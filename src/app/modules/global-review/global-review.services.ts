import status from "http-status";
import UserModel from "../user/user.model";
import AppError from "../../errors/appError";
import { validateEntity } from "../../utils/validateEntity";
import { paginationHelper } from "../../utils/paginationHelpers";
import { IPaginationOptions } from "../../interface/pagination";
import { ReviewModel } from "./global-review.model";
import { IGlobalReview } from "./global-review.interface";
import { InfluencerReputationService } from "../influencer/Reputation/reputation.service";
import { IUser } from "../user/user.interface";
import { FreePackage } from "../gift/gift.model";

/**
 * Create Review (Dynamic for any entity)
 */
const createReview = async (payload: any, userId: string) => {
  // console.log("payload", payload)
  // 1. Validate Entity (Story, Tool, etc.)
  if (payload?.entityId && payload?.entityType) {
    await validateEntity("_id", payload.entityId, payload.entityType);
  }

  // 2. Prevent duplicate review by same user for same entity
  const alreadyReviewed = await ReviewModel.findOne({
    userId,
    entityId: payload.entityId,
    entityType: payload.entityType,
  });
  if (alreadyReviewed) {
    throw new AppError(status.CONFLICT, "You already reviewed this entity");
  }

  let review = null;
  if (!payload?.entityId || !payload?.entityType) {
    review = await ReviewModel.create({
      ...payload,
      entityType: "testimonialWall",
      userId,
    });
  } else {
    // 3. Create Review
    review = await ReviewModel.create({
      ...payload,
      userId,
    });
  }

  // Update reputation if reviewing an influencer
  if (payload.entityType === "influencer") {
    await InfluencerReputationService.handleNewReview(review);
  }

  return review;
};

/**
 * Update Review
 */
const updateReview = async (
  reviewId: string,
  user: IUser,
  updateData: Partial<IGlobalReview>
) => {

  const review = await ReviewModel.findById(reviewId);
  if (!review) {
    throw new AppError(status.NOT_FOUND, "Review not found");
  }

  // Role-based authorization
  if (user?.role !== "admin") {
    if (review.userId.toString() !== user?.id) {
      throw new AppError(
        status.FORBIDDEN,
        "Not authorized to update this review"
      );
    }

    // Restrict allowed fields for non-admin
    const allowedFields = [
      "rating",
      "reviewText",
      "reviewVideoUrl",
      "proofUrl",
      "entityId",
      "entityType",
    ];
    const filteredData: Partial<IGlobalReview> = {};

    for (const key of allowedFields) {
      if (key in updateData) {
        filteredData[key as keyof IGlobalReview] = updateData[
          key as keyof IGlobalReview
        ] as any;
      }
    }

    updateData = filteredData;
  }

  // Validate rating range
  if (
    updateData.rating !== undefined &&
    (updateData.rating < 1 || updateData.rating > 5)
  ) {
    throw new AppError(status.BAD_REQUEST, "Rating must be between 1 and 5");
  }

  const result = await ReviewModel.findOneAndUpdate(
    { _id: reviewId },
    { $set: updateData },
    { new: true }
  );

  return result;
};

const updateReviewStatus = async (
  reviewId: string,
  user: IUser,
  reviewStatus: boolean
) => {
  const review = await ReviewModel.findById(reviewId);
  if (!review) {
    throw new AppError(status.NOT_FOUND, "Review not found");
  }

  if (user?.role !== "admin") {
    if (review.userId.toString() !== user?.id.toString()) {
      throw new AppError(
        status.FORBIDDEN,
        "Not authorized to update this review"
      );
    }
  }
  const result = await ReviewModel.findOneAndUpdate(
    { _id: reviewId },
    { $set: { status: reviewStatus } },
    { new: true }
  );

  if (result?.entityType === "influencer") {
    await InfluencerReputationService.updateInfluencerReputation(
      result?.entityId
    );
  } else if (result?.entityType === "testimonialWall") {
    // const freePackage = await FreePackage.findOneAndUpdate(
    //   { _id: result?.userId },
    //   { $set: { status: "paid", type: "testimonialWall" } },
    //   { new: true }
    // );

    const freePackage = await FreePackage.create({
      userId: result?.userId,
      status: "paid",
      type: "testimonialWall",
    });

    await UserModel.findOneAndUpdate(
      { _id: result?.userId },
      { $push: { freePackages: freePackage?._id } },
      { new: true }
    );
  }
  return result;
};

const getAllReviewForDb = async (
  options: IPaginationOptions,
  filters: Record<string, any> = {}
) => {
  const { page, limit, skip, sortBy, sortOrder } =
    paginationHelper.calculatePagination(options);

  const queryConditions: Record<string, any> = {};

  // allowed filter fields
  const filterableFields = [
    "entityType",
    "rating",
    "isApproved",
    "entityId",
    "status",
    "bestReview"
  ];

  filterableFields.forEach((field) => {
    if (filters[field] !== undefined && filters[field] !== null && filters[field] !== "") {
      queryConditions[field] = filters[field];
    }
  });
  console.log("queryConditions", queryConditions)

  const [reviews, total] = await Promise.all([
    ReviewModel.find(queryConditions)
      .sort({ [sortBy]: sortOrder })
      .skip(skip)
      .limit(limit)
      .lean(),
    ReviewModel.countDocuments(queryConditions),
  ]);

  return {
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
    data: reviews,
  };
};

/**
 * Delete Review
 */
const deleteReview = async (
  reviewId: string,
  userId: string,
  userRole: string
) => {
  const review = await ReviewModel.findOne({ reviewId, isApproved: true });
  if (!review) {
    throw new AppError(status.NOT_FOUND, "Review not found");
  }

  // Only owner or admin can delete
  if (review.userId.toString() !== userId && userRole !== "admin") {
    throw new AppError(
      status.FORBIDDEN,
      "Not authorized to delete this review"
    );
  }

  await review.deleteOne();
  return { message: "Review deleted successfully" };
};

/**
 * Get Single Review by ID
 */
const getReviewById = async (reviewId: string) => {
  const review = await ReviewModel.findOne({ _id: reviewId })
    .populate("userId", "firstName lastName email")
    .populate("entityId", "title")
    .populate("comments");
  if (!review) {
    throw new AppError(status.NOT_FOUND, "Review not found");
  }
  return review;
};

const ToggleReviewEditorPick = async (reviewId: string) => {
  const review = await ReviewModel.findById({ _id: reviewId });
  if (!review) {
    throw new AppError(status.NOT_FOUND, "Review not found");
  }
  const updatedReview = await ReviewModel.findOneAndUpdate(
    { _id: reviewId },
    { $set: { isEditorPicked: !review.isEditorPicked } },
    { new: true }
  );

  return updatedReview;
};

/**
 * Get Reviews by User ID
 */
const getReviewsByUser = async (userId: string) => {
  const reviews = await ReviewModel.find({ userId, isApproved: true })
    .populate("userId", "-password")
    .populate("entityId", "title")
    .populate("comments");
  return reviews;
};

/**
 * Get Reviews by Entity (Story, Tool, etc.)
 */
const getReviewsByEntity = async (entityId: string, entityType: string) => {
  // await validateEntity("_id", payload.entityId, payload.entityType);
  await validateEntity("_id", entityId, entityType);
  const reviews = await ReviewModel.find({ entityId, entityType }).populate(
    "userId",
    "firstName lastName email"
  );
  return reviews;
};

export const ReviewService = {
  createReview,
  updateReview,
  deleteReview,
  getReviewById,
  getReviewsByUser,
  getReviewsByEntity,
  getAllReviewForDb,
  ToggleReviewEditorPick,
  updateReviewStatus,
};
