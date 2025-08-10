import { Request, Response } from "express";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import status from "http-status";
import { StoryService } from "./storyPoll.services";

// Create a story
const createStory = catchAsync(async (req: Request, res: Response) => {
  const payload = req.body;
  payload.authorId = req.user?.id; // Attach logged-in user as author
  const result = await StoryService.createStory(payload);

  sendResponse(res, {
    success: true,
    statusCode: status.CREATED,
    message: "Story created successfully",
    data: result,
  });
});

// Get a story by ID
const getStory = catchAsync(async (req: Request, res: Response) => {
  const storyId = req.params.id;
  const result = await StoryService.getStoryById(storyId);

  sendResponse(res, {
    success: true,
    statusCode: status.OK,
    message: "Story fetched successfully",
    data: result,
  });
});

// Update a story
const updateStory = catchAsync(async (req: Request, res: Response) => {
  const storyId = req.params.id;
  const payload = req.body;
  const userId = req.user?.id;
  const userRole = req.user?.role;

  const result = await StoryService.updateStory(
    storyId,
    payload,
    userId,
    userRole
  );

  sendResponse(res, {
    success: true,
    statusCode: status.OK,
    message: "Story updated successfully",
    data: result,
  });
});

// Delete a story
const deleteStory = catchAsync(async (req: Request, res: Response) => {
  const storyId = req.params.id;
  const userId = req.user?.id;
  const userRole = req.user?.role;

  const result = await StoryService.deleteStory(storyId, userId, userRole);

  sendResponse(res, {
    success: true,
    statusCode: status.OK,
    message: "Story deleted successfully",
    data: null,
  });
});

// Vote on a poll
const voteOnPoll = catchAsync(async (req: Request, res: Response) => {
  const storyId = req.params.id;
  const { pollChoiceIndex } = req.body;
  const userId = req.user?.id;

  const result = await StoryService.voteOnPoll(storyId, pollChoiceIndex, userId);

  sendResponse(res, {
    success: true,
    statusCode: status.OK,
    message: "Vote recorded successfully",
    data: result,
  });
});

export const StoryController = {
  createStory,
  getStory,
  updateStory,
  deleteStory,
  voteOnPoll,
};