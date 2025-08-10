import status from "http-status";
import UserModel from "../user/user.model";
import { IReview } from "./global-review.interface";
import AppError from "../../errors/appError";
import { ReviewModel } from "./global-review.model";
import { validateEntity } from "../../utils/validateEntity";
import { Types } from "mongoose";

/**
 * Create Review (Dynamic for any entity)
 */
const createReview = async (payload: any, userId: string) => {

  // 1. Validate User
  const user = await UserModel.findById(userId);
  if (!user) {
    throw new AppError(status.NOT_FOUND, "User not found");
  }

  // 2. Validate Entity (Story, Tool, etc.)
  await validateEntity("_id", payload.entityId, payload.entityType);

  // 3. Prevent duplicate review by same user for same entity
  const alreadyReviewed = await ReviewModel.findOne({
    userId,
    entityId: payload.entityId,
    entityType: payload.entityType,
  });
  if (alreadyReviewed) {
    throw new AppError(status.CONFLICT, "You already reviewed this entity");
  }

  // 4. Create Review
  const review = await ReviewModel.create({
    ...payload,
    userId,
  });

  return review;
};

/**
 * Update Review
 */
const updateReview = async (
  reviewId: string,
  userId: string,
  updateData: Partial<IReview>
) => {
  const review = await ReviewModel.findById(reviewId);
  if (!review) {
    throw new AppError(status.NOT_FOUND, "Review not found");
  }

  // Only owner or admin can update
  if (review.userId.toString() !== userId) {
    throw new AppError(status.FORBIDDEN, "Not authorized to update this review");
  }

  // Validate rating range
  if (updateData.rating && (updateData.rating < 1 || updateData.rating > 5)) {
    throw new AppError(status.BAD_REQUEST, "Rating must be between 1 and 5");
  }

  Object.assign(review, updateData);
  await review.save();
  return review;
};

/**
 * Delete Review
 */
const deleteReview = async (reviewId: string, userId: string, userRole: string) => {
  const review = await ReviewModel.findById(reviewId);
  if (!review) {
    throw new AppError(status.NOT_FOUND, "Review not found");
  }

  // Only owner or admin can delete
  if (review.userId.toString() !== userId && userRole !== "admin") {
    throw new AppError(status.FORBIDDEN, "Not authorized to delete this review");
  }

  await review.deleteOne();
  return { message: "Review deleted successfully" };
};

/**
 * Get Single Review by ID
 */
const getReviewById = async (reviewId: string) => {
  const review = await ReviewModel.findById(reviewId).populate(
    "userId",
    "firstName lastName email"
  );
  if (!review) {
    throw new AppError(status.NOT_FOUND, "Review not found");
  }
  return review;
};

/**
 * Get Reviews by User ID
 */
const getReviewsByUser = async (userId: string) => {
  const reviews = await ReviewModel.find({ userId });
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
};