import { Request, Response } from "express";
import catchAsync from "../../utils/catchAsync";
import { BadgeService } from "./badge.service";
import sendResponse from "../../utils/sendResponse";


const createBadge = catchAsync(async (req: Request, res: Response) => {
  const { name, minScore, maxScore, iconUrl } = req.body;
  const result = await BadgeService.createBadge(name, minScore, maxScore, iconUrl);

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: "Badge created successfully",
    data: result,
  });
});

const getAllBadges = catchAsync(async (req: Request, res: Response) => {
  const result = await BadgeService.getAllBadges();

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: "Badges retrieved successfully",
    data: result,
  });
});

const getBadgeById = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await BadgeService.getBadgeById(id);

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: "Badge retrieved successfully",
    data: result,
  });
});

const updateBadge = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, minScore, maxScore, iconUrl } = req.body;
  const result = await BadgeService.updateBadge(id, { name, minScore, maxScore, iconUrl });

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: "Badge updated successfully",
    data: result,
  });
});

const deleteBadge = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  await BadgeService.deleteBadge(id);

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: "Badge deleted successfully",
    data: null,
  });
});

const assignBadgeToUser = catchAsync(async (req: Request, res: Response) => {
  const { userId } = req.params;
  const result = await BadgeService.assignBadgeToUser(userId);

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: "Badge assigned successfully",
    data: result,
  });
});

const removeBadgeFromUser = catchAsync(async (req: Request, res: Response) => {
  const { userId, badgeId } = req.params;
  const result = await BadgeService.removeBadgeFromUser(userId, badgeId);

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: "Badge removed successfully",
    data: result,
  });
});

const getUserEarnedBadges = catchAsync(async (req: Request, res: Response) => {
  const { userId } = req.params;
  const result = await BadgeService.getUserEarnedBadges(userId);

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: "User's earned badges retrieved successfully",
    data: result,
  });
});

export const BadgeController = {
  createBadge,
  getAllBadges,
  getBadgeById,
  updateBadge,
  deleteBadge,
  assignBadgeToUser,
  removeBadgeFromUser,
  getUserEarnedBadges,
};