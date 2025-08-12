import { Request, Response } from "express";
import sendResponse from "../../utils/sendResponse";
import { WaitlistService } from "./waitlist.service";
import catchAsync from "../../utils/catchAsync";

const joinWaitlist = catchAsync(async (req: Request, res: Response) => {
  const { email, name } = req.body;

  const result = await WaitlistService.addToWaitlist(email, name);

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: "Added to waitlist successfully",
    data: result,
  });
});

export const WaitlistController = {
  joinWaitlist,
};
