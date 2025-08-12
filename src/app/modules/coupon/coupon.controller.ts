import status from "http-status";
import catchAsync from "../../utils/catchAsync";
import { Request, Response } from "express";
import { CouponServices } from "./coupon.service";
import sendResponse from "../../utils/sendResponse";


const createCoupon = catchAsync(async (req: Request, res: Response) => {
  const result = await CouponServices.createCouponIntoDB({
    ...req.body,
    createdBy: req.user._id
  });

  sendResponse(res, {
    success: true,
    statusCode: status.OK,
    message: "Coupon created successfully",
    data: result
  });
});

const getAllCoupons = catchAsync(async (req: Request, res: Response) => {
  const result = await CouponServices.getAllCouponsFromDB();
  sendResponse(res, {
    success: true,
    statusCode: status.OK,
    message: "Coupons fetched successfully",
    data: result
  });
});

const applyCoupon = catchAsync(async (req: Request, res: Response) => {
  const { code, toolPrice, toolId } = req.body;
  const result = await CouponServices.applyCoupon(code, toolPrice, req.user._id, toolId);

  sendResponse(res, {
    success: true,
    statusCode: status.OK,
    message: "Coupon applied successfully",
    data: result
  });
});

export const CouponControllers = {
  createCoupon,
  getAllCoupons,
  applyCoupon
};
