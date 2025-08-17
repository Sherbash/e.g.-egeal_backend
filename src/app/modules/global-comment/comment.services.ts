import { ReviewModel } from "../global-review/global-review.model";
import { CommentModel } from "./comment.model";
import AppError from "../../errors/appError";
import { IComment } from "./comment.interface";
import { paginationHelper } from "../../utils/paginationHelpers";
import { IPaginationOptions } from "../../interface/pagination";
import status from "http-status";
import { StoryModel } from "../storyPoll/storyPoll.model";
import mongoose from "mongoose";
import { IUser } from "../user/user.interface";

const createCommentForDb = async (payload: IComment, userId: string) => {
  // console.log("payload", payload)

  const result = await CommentModel.create({
    ...payload,
    userId,
  });

  if (payload?.entityType === "review") {
    const getReview = await ReviewModel.findById(payload?.entityId);

    if (getReview) {
      // Update the review's comments array
      await ReviewModel.findByIdAndUpdate(
        payload?.entityId,
        { $push: { comments: result?._id } },
        { new: true }
      );
    }
  } else if (payload?.entityType === "story") {
    const getStory = await StoryModel.findById(payload?.entityId);
    if (getStory) {
      await StoryModel.findByIdAndUpdate(
        payload?.entityId,
        { $push: { comments: result?._id } },
        { new: true }
      );
    }
  }

  return result;
};

const getAllCommentsForDb = async (
  options: IPaginationOptions,
  entityId: string
) => {
  const { page, limit, skip, sortBy, sortOrder } =
    paginationHelper.calculatePagination(options);

  const [comments, total] = await Promise.all([
    CommentModel.find({ entityId })
      .populate("userId", "firstName lastName email role isActive")
      .sort({ [sortBy]: sortOrder })
      .skip(skip)
      .limit(limit)
      .lean(),
    CommentModel.countDocuments({ entityId }),
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
  // const findReview = await ReviewModel.findById(payload.entityId);

  // if (!findReview) {
  //   throw new AppError(status.NOT_FOUND, "Review not found");
  // }
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

const deleteCommentForDb = async (id: string, user: IUser) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // 1. Find and verify comment exists
    const comment = await CommentModel.findById(id).session(session);
    if (!comment) {
      throw new AppError(status.NOT_FOUND, "Comment not found");
    }

    // 2. Authorization check (comment author or admin)
    const isAuthor = comment.userId.toString() === user.id;
    const isAdmin = user.role === 'admin';
    
    if (!isAuthor && !isAdmin) {
      throw new AppError(
        status.FORBIDDEN,
        "Only comment author or admin can delete this comment"
      );
    }

    // 3. Remove comment from associated entity
    let updateQuery;
    switch (comment.entityType) {
      case 'review':
        updateQuery = { $pull: { comments: id } };
        await ReviewModel.findByIdAndUpdate(
          comment.entityId,
          updateQuery,
          { session }
        );
        break;
      case 'story':
        updateQuery = { $pull: { comments: id } };
        await StoryModel.findByIdAndUpdate(
          comment.entityId,
          updateQuery,
          { session }
        );
        break;
      // Add other entity types as needed
    }

    // 4. Delete the comment
    const result = await CommentModel.deleteOne({ _id: id }).session(session);

    await session.commitTransaction();
    
    return null

  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};

export const commentServices = {
  createCommentForDb,
  getAllCommentsForDb,
  getSingleCommentForDb,
  updateSingleCommentForDb,
  deleteCommentForDb,
};
