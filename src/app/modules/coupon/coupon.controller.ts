import status from "http-status";

import { Request, Response } from "express";
import catchAsync from "../../utils/catchAsync";
import AppError from "../../errors/appError";
import { CouponServices } from "./coupon.service";
import sendResponse from "../../utils/sendResponse";


const createCoupon = catchAsync(async (req: Request, res: Response) => {
  // ensure req.user exists via your auth middleware
  const userId = (req as any).user?._id;
  if (!userId) throw new AppError(status.UNAUTHORIZED, "Unauthorized");

  if (!req.body.code || !req.body.discountType || req.body.discountValue == null) {
    throw new AppError(status.BAD_REQUEST, "code, discountType and discountValue are required");
  }

  const payload = {
    ...req.body,
    code: req.body.code.toString().toUpperCase(),
    createdBy: userId,
  };

  const result = await CouponServices.createCouponIntoDB(payload);

  sendResponse(res, {
    success: true,
    statusCode: status.OK,
    message: "Coupon created successfully",
    data: result,
  });
});

const getAllCoupons = catchAsync(async (req: Request, res: Response) => {
  const result = await CouponServices.getAllCouponsFromDB();
  sendResponse(res, {
    success: true,
    statusCode: status.OK,
    message: "Coupons fetched successfully",
    data: result,
  });
});

const applyCoupon = catchAsync(async (req: Request, res: Response) => {
  const userId = (req as any).user?._id;
  if (!userId) throw new AppError(status.UNAUTHORIZED, "Unauthorized");

  const { code, toolPrice, toolId } = req.body;
  if (!code || toolPrice == null) {
    throw new AppError(status.BAD_REQUEST, "code and toolPrice are required");
  }

  const result = await CouponServices.applyCoupon(code, Number(toolPrice), userId, toolId);

  sendResponse(res, {
    success: true,
    statusCode: status.OK,
    message: "Coupon applied successfully",
    data: result,
  });
});

export const CouponControllers = {
  createCoupon,
  getAllCoupons,
  applyCoupon,
};
