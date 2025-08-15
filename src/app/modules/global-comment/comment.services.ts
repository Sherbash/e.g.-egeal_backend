import { ReviewModel } from "../global-review/global-review.model";
import { CommentModel } from "./comment.model";
import AppError from "../../errors/appError";
import { IComment } from "./comment.interface";
import { paginationHelper } from "../../utils/paginationHelpers";
import { IPaginationOptions } from "../../interface/pagination";
import status from "http-status";

const createCommentForDb = async (payload: IComment, userId: string) => {
  // console.log("payload", payload)
  const result = await CommentModel.create({
    ...payload,
    userId,
  });

  // Update the review's comments array
  await ReviewModel.findByIdAndUpdate(
    payload?.feedbackId,
    { $push: { comments: result?._id } },
    { new: true }
  );

  return result;
};

const getAllCommentsForDb = async (
  options: IPaginationOptions,
  feedbackId: string
) => {
  const { page, limit, skip, sortBy, sortOrder } =
    paginationHelper.calculatePagination(options);

  const [comments, total] = await Promise.all([
    CommentModel.find({ feedbackId })
      .populate("userId", "firstName lastName email role isActive")
      .sort({ [sortBy]: sortOrder })
      .skip(skip)
      .limit(limit)
      .lean(),
    CommentModel.countDocuments({ feedbackId }),
  ]);

  return {
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
    data: comments,
  };
};

const getSingleCommentForDb = async (id: string) => {
  const result = await CommentModel.findOne({ _id: id }).populate(
    "userId",
    "-password"
  );

  if (!result) {
    throw new AppError(status.NOT_FOUND, "Comment not found");
  }

  return { result };
};

const updateSingleCommentForDb = async (
  id: string,
  payload: Partial<IComment>
) => {
  const findReview = await ReviewModel.findById(payload.feedbackId);

  if (!findReview) {
    throw new AppError(status.NOT_FOUND, "Review not found");
  }
  const result = await CommentModel.findOneAndUpdate(
    { _id: id },
    {
      $set: {
        ...payload,
      },
    },
    { new: true, runValidators: true }
  ).populate("userId", "-password");

  if (!result) {
    throw new AppError(status.NOT_FOUND, "Comment not found");
  }

  return { result };
};

const deleteCommentForDb = async (id: string) => {
  const isExistingComment = await CommentModel.findById(id);

  if (!isExistingComment) {
    throw new AppError(status.NOT_FOUND, "Comment not found");
  }

  const result = await CommentModel.deleteOne({ _id: id });

  // Remove comment from review's comments array
  await ReviewModel.findByIdAndUpdate(
    isExistingComment.feedbackId,
    { $pull: { comments: id } },
    { new: true }
  );

  return { result };
};

export const commentServices = {
  createCommentForDb,
  getAllCommentsForDb,
  getSingleCommentForDb,
  updateSingleCommentForDb,
  deleteCommentForDb,
};
