import status from "http-status";

import mongoose from "mongoose";
import { ICoupon, ICouponUpdate } from "./coupon.interface";
import AppError from "../../errors/appError";
import { CouponModel } from "./coupon.model";

const createCouponIntoDB = async (payload: Partial<ICoupon>) => {
  if (!payload.code) {
    throw new AppError(status.BAD_REQUEST, "Coupon code is required");
  }

  const code = payload.code.toUpperCase();
  const existing = await CouponModel.findOne({ code });
  if (existing) {
    throw new AppError(status.BAD_REQUEST, "Coupon code already exists");
  }

  const couponData: Partial<ICoupon> = {
    ...payload,
    code,
    usageCount: 0,
    usedBy: payload.usedBy ?? [],
    isActive: payload.isActive ?? true,
  };

  const coupon = await CouponModel.create(couponData);
  return coupon;
};

const getAllCouponsFromDB = async () => {
  return CouponModel.find().populate("createdBy", "name email").lean();
};

const getSingleCouponFromDB = async (id: string) => {
  const coupon = await CouponModel.findById(id).lean();
  if (!coupon) throw new AppError(status.NOT_FOUND, "Coupon not found");
  return coupon;
};

const updateCouponIntoDB = async (id: string, payload: ICouponUpdate) => {
  const updated = await CouponModel.findByIdAndUpdate(id, payload, { new: true }).lean();
  if (!updated) throw new AppError(status.NOT_FOUND, "Coupon not found");
  return updated;
};

const deleteCouponIntoDB = async (id: string) => {
  const deleted = await CouponModel.findByIdAndDelete(id).lean();
  if (!deleted) throw new AppError(status.NOT_FOUND, "Coupon not found");
  return deleted;
};

/**
 * Apply coupon:
 * - code: coupon code (string)
 * - toolPrice: number (price before discount)
 * - userId: string (user's ObjectId string)
 * - toolId?: string (Tool.toolId string) optional but recommended when coupon is tool-specific
 */
const applyCoupon = async (code: string, toolPrice: number, userId: string, toolId?: string) => {
  if (!code) throw new AppError(status.BAD_REQUEST, "Coupon code is required");

  const coupon = await CouponModel.findOne({ code: code.toUpperCase(), isActive: true });
  if (!coupon) throw new AppError(status.BAD_REQUEST, "Invalid coupon code");

  // Check expiry
  if (coupon.expiresAt && coupon.expiresAt < new Date()) {
    throw new AppError(status.BAD_REQUEST, "Coupon has expired");
  }

  // Check max usage (if set)
  if (typeof coupon.maxUsage === "number" && coupon.usageCount >= coupon.maxUsage) {
    throw new AppError(status.BAD_REQUEST, "Coupon usage limit reached");
  }

  // If coupon is restricted to a tool, ensure toolId matches
  if (coupon.toolId) {
    if (!toolId) {
      throw new AppError(status.BAD_REQUEST, "This coupon is valid only for a specific tool");
    }
    if (coupon.toolId !== toolId) {
      throw new AppError(status.BAD_REQUEST, "Coupon not valid for this tool");
    }
  }

  // Calculate discount
  let discountAmount = 0;
  if (coupon.discountType === "PERCENTAGE") {
    discountAmount = (toolPrice * coupon.discountValue) / 100;
  } else {
    discountAmount = coupon.discountValue;
  }

  const finalPrice = Math.max(toolPrice - discountAmount, 0);

  // Update usage tracking:
  // - increment total usageCount
  // - add userId to usedBy only once (so usedBy acts as unique user list)
  coupon.usageCount = (coupon.usageCount ?? 0) + 1;
  const userAlreadyTracked = coupon.usedBy?.some((u) => u.toString() === userId);
  if (!userAlreadyTracked) {
    coupon.usedBy.push(new mongoose.Types.ObjectId(userId));
  }
  await coupon.save();

  return {
    finalPrice,
    discountAmount,
    coupon: coupon.toObject(),
  };
};

export const CouponServices = {
  createCouponIntoDB,
  getAllCouponsFromDB,
  getSingleCouponFromDB,
  updateCouponIntoDB,
  deleteCouponIntoDB,
  applyCoupon,
};
