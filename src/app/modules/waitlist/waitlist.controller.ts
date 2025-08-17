import { Request, Response } from "express";
import sendResponse from "../../utils/sendResponse";
import { WaitlistService } from "./waitlist.service";
import catchAsync from "../../utils/catchAsync";
import status from "http-status";

const joinWaitlist = catchAsync(async (req: Request, res: Response) => {
  const { email, name, toolId } = req.body;

  const result = await WaitlistService.addToWaitlist(email, name, toolId);

  sendResponse(res, {
    success: true,
    statusCode: status.OK,
    message: "Added to waitlist successfully",
    data: result,
  });
});

const getAllWaitlistEntries = catchAsync(async (req: Request, res: Response) => {
  const result = await WaitlistService.getAllWaitlistEntries();

  sendResponse(res, {
    success: true,
    statusCode: status.OK,
    message: "Waitlist entries retrieved successfully",
    data: result,
  });
});

export const WaitlistController = {
  joinWaitlist,
  getAllWaitlistEntries,
};