import { Request, Response } from "express";
import status from "http-status";
import catchAsync from "../../utils/catchAsync";
import AppError from "../../errors/appError";
import sendResponse from "../../utils/sendResponse";
import { ReviewService } from "./global-review.services";
import pickOptions from "../../utils/pick";

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
  ]);
  const result = await ReviewService.getAllReviewForDb(options, filters);

  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: "All reviews successfully get !",
    data: result,
  });
});

// Update Review
const updateReview = catchAsync(async (req: Request, res: Response) => {
  const reviewId = req.params.id;
  const userId = req.user?.id;
  const updateData = req.body;

  const result = await ReviewService.updateReview(reviewId, userId, updateData);

  sendResponse(res, {
    success: true,
    statusCode: status.OK,
    message: "Review updated successfully",
    data: result,
  });
});

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
};