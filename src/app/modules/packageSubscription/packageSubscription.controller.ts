import { NextFunction, Request, Response } from "express";
import catchAsync from "../../utils/catchAsync";
import { SubscriptionServices } from "./packageSubscription.service";
import sendResponse from "../../utils/sendResponse";
import status from "http-status";


const createSubscription = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const userId = req.user.id;
  const { packageId } = req.body;

  const result = await SubscriptionServices.createSubscription(userId, packageId);

  sendResponse(res, {
    statusCode: status.CREATED,
    success: true,
    message: "Subscription created successfully.",
    data: result,
  });
});

const getAllSubscription = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const results = await SubscriptionServices.getAllSubscription(req.query);
  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: "Subscriptions retrieved successfully",
    meta: results.meta,
    data: results.data,
  });
});

const getSingleSubscription = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const result = await SubscriptionServices.getSingleSubscription(req.params.subscriptionId);
  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: "Subscription retrieved successfully",
    data: result,
  });
});

const getMySubscription = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const userId = req.user.id;

  const result = await SubscriptionServices.getMySubscription(userId);

  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: "Subscription retrieved successfully.",
    data: result,
  });
});

const updateSubscription = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { subscriptionId } = req.params;

  const result = await SubscriptionServices.updateSubscription(subscriptionId, req.body);
  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: "Subscription updated successfully.",
    data: result,
  });
});

const deleteSubscription = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const result = await SubscriptionServices.deleteSubscription(req.params.subscriptionId);

  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: "Subscription deleted successfully.",
    data: result,
  });
});

const handleStripeWebhook = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const result = await SubscriptionServices.handleStripeWebhook(req.body);

  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: "Webhook event triggered successfully",
    data: result,
  });
});

export const SubscriptionController = {
  createSubscription,
  getAllSubscription,
  getMySubscription,
  handleStripeWebhook,
  getSingleSubscription,
  updateSubscription,
  deleteSubscription,
};