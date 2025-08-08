import status from "http-status";
import AppError from "../../errors/appError";
import { IPaginationOptions } from "../../interface/pagination";
import { paginationHelper } from "../../utils/paginationHelpers";
import { IReview } from "./review.interface";
import { ReviewModel } from "./review.model";

const createReviewForDb = async (paylood: IReview) => {
  const result = await ReviewModel.create(paylood);

  return {
    result,
  };
};
const getAllReviewForDb = async (
  options: IPaginationOptions,
  filters: any = {}
) => {
  const { page, limit, skip, sortBy, sortOrder } =
    paginationHelper.calculatePagination(options);

  const queryConditions: any = {};

  if (filters.rating) {
    queryConditions.rating = filters.rating;
  }

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
const getSingleReviewForDb = async (id: string) => {
  const result = await ReviewModel.findOne({ _id: id }).populate(
    "userId",
    "-password"
  );

  return {
    result,
  };
};
const updateSingleReviewForDb = async (
  id: string,
  paylood: Partial<IReview>
) => {
  const result = await ReviewModel.findOneAndUpdate(
    { _id: id },
    {
      $set: paylood,
    },
    { new: true, runValidators: true }
  );

  return {
    result,
  };
};

const deleteReviewForDb = async (id: string) => {

  const isExistingReview = await ReviewModel.findById({ _id: id });

  if (!isExistingReview) {
    throw new AppError(status.NOT_FOUND, "Review not found");
  }
  const result = await ReviewModel.deleteOne({ _id: id });

  return {
    result,
  };
};
const getToolReviewForDb = async (id: string) => {
  const result = await ReviewModel.find({ toolId: id }).populate(
    "userId",
    "-password"
  );

  return {
    result,
  };
};

export const reviewServices = {
  createReviewForDb,
  getAllReviewForDb,
  getSingleReviewForDb,
  updateSingleReviewForDb,
  deleteReviewForDb,
  getToolReviewForDb,
};
