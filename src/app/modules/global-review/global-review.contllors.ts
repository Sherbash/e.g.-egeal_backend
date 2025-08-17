import { Request, Response } from "express";
import status from "http-status";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { ReviewService } from "./global-review.services";
import pickOptions from "../../utils/pick";
import { IUser } from "../user/user.interface";

// Create Review
const createReview = catchAsync(async (req: Request, res: Response) => {
  const payload = req.body;
  const userId = req.user?.id;

  const result = await ReviewService.createReview(payload, userId);

  sendResponse(res, {
    success: true,
    statusCode: status.OK,
    message: "Review created successfully",
    data: result,
  });
});

const getAllReview = catchAsync(async (req, res) => {
  const options = pickOptions(req.query, [
    "limit",
    "page",
    "sortBy",
    "sortOrder",
  ]);
  const filters = pickOptions(req.query, [
    "rating",
    "isApproved",
    "entityType",
    "status",
    "isEditorPicked",
    "bestReview",
  ]);
  const result = await ReviewService.getAllReviewForDb(options, filters);

  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: "All reviews successfully get !",
    data: result,
  });
});

const GetToolReviews = catchAsync(async (req, res) => {
  const { id } = req.params;
  console.log(id);
  const result = await ReviewService.getToolReviewForDb(id);

  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: "Tool reviews successfully get !",
    data: result,
  });
});

// Update Review
const updateReview = catchAsync(async (req: Request, res: Response) => {
  const reviewId = req.params.id;
  const user = req.user;
  const updateData = req.body;

  const result = await ReviewService.updateReview(
    reviewId,
    user as IUser,
    updateData
  );

  sendResponse(res, {
    success: true,
    statusCode: status.OK,
    message: "Review updated successfully",
    data: result,
  });
});

const updateReviewStatus = catchAsync(async (req: Request, res: Response) => {
  const reviewId = req.params.id;
  const user = req.user;
  const { reviewStatus } = req.body;

  const result = await ReviewService.updateReviewStatus(
    reviewId,
    user as IUser,
    reviewStatus
  );

  sendResponse(res, {
    success: true,
    statusCode: status.OK,
    message: "Review updated successfully",
    data: result,
  });
});

// Toggle Review Editor Pick
const toggleReviewEditorPick = catchAsync(
  async (req: Request, res: Response) => {
    const reviewId = req.params.id;

    const result = await ReviewService.ToggleReviewEditorPick(reviewId);

    sendResponse(res, {
      success: true,
      statusCode: status.OK,
      message: "Review editor pick toggled successfully",
      data: result,
    });
  }
);

// Delete Review
const deleteReview = catchAsync(async (req: Request, res: Response) => {
  const reviewId = req.params.id;
  const userId = req.user?.id;
  const userRole = req.user?.role;

  const result = await ReviewService.deleteReview(reviewId, userId, userRole);

  sendResponse(res, {
    success: true,
    statusCode: status.OK,
    message: result.message,
    data: null,
  });
});

// Get Review by ID
const getReviewById = catchAsync(async (req: Request, res: Response) => {
  const reviewId = req.params.id;
  const result = await ReviewService.getReviewById(reviewId);

  sendResponse(res, {
    success: true,
    statusCode: status.OK,
    message: "Review fetched successfully",
    data: result,
  });
});

const getReviewByInfulencerId = catchAsync(
  async (req: Request, res: Response) => {
    const influencerId = req.params.id;
    const result = await ReviewService.getReviewByInfulencerId(influencerId);

    sendResponse(res, {
      success: true,
      statusCode: status.OK,
      message: "Review fetched by influencer successfully",
      data: result,
    });
  }
);

// Get Reviews by User
const getReviewsByUser = catchAsync(async (req: Request, res: Response) => {
  const userId = req.params.userId;
  const result = await ReviewService.getReviewsByUser(userId);

  sendResponse(res, {
    success: true,
    statusCode: status.OK,
    message: "User reviews fetched successfully",
    data: result,
  });
});

// Get Reviews by Entity
const getReviewsByEntity = catchAsync(async (req: Request, res: Response) => {
  const { entityId, entityType } = req.params;
  const result = await ReviewService.getReviewsByEntity(entityId, entityType);

  sendResponse(res, {
    success: true,
    statusCode: status.OK,
    message: "Entity reviews fetched successfully",
    data: result,
  });
});

export const ReviewController = {
  createReview,
  getAllReview,
  updateReview,
  deleteReview,
  getReviewById,
  getReviewsByUser,
  getReviewsByEntity,
  toggleReviewEditorPick,
  updateReviewStatus,
  GetToolReviews,
  getReviewByInfulencerId
};
