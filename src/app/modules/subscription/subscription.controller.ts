import { Request, Response } from "express";
import catchAsync from "../../utils/catchAsync";
import { EmailSubscriptionService } from "./subscription.service";
import sendResponse from "../../utils/sendResponse";

const subscribe = catchAsync(async (req: Request, res: Response) => {
  const { email, name } = req.body;

  const result = await EmailSubscriptionService.subscribeEmail(email, name);

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: "Email subscribed",
    data: result,
  });
});

export const EmailSubscriptionController = {
  subscribe,
};
