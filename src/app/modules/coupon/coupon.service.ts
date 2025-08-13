import status from "http-status";

import mongoose from "mongoose";
import { ICoupon, ICouponUpdate } from "./coupon.interface";
import AppError from "../../errors/appError";
import { CouponModel } from "./coupon.model";

// coupon.service.ts
const createCouponIntoDB = async (payload: ICoupon) => {
  // Now TypeScript knows payload.code definitely exists
  const code = payload.code.toUpperCase();

  const existing = await CouponModel.findOne({ code });
  if (existing) {
    throw new AppError(status.CONFLICT, "Coupon code already exists");
  }

  // Create with defaults
  const couponData: ICoupon = {
    code,
    description: payload.description || undefined,
    discountType: payload.discountType!,
    discountValue: payload.discountValue!,
    toolId: payload.toolId || undefined,
    createdBy: payload.createdBy!,
    maxUsage: payload.maxUsage || undefined,
    usageCount: 0,
    usedBy: [],
    expiresAt: payload.expiresAt || undefined,
    isActive: payload.isActive ?? true,
  };

  return await CouponModel.create(couponData);
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
  const updated = await CouponModel.findByIdAndUpdate(id, payload, {
    new: true,
  }).lean();
  if (!updated) throw new AppError(status.NOT_FOUND, "Coupon not found");
  return updated;
};

const deleteCouponIntoDB = async (id: string) => {
  const deleted = await CouponModel.findByIdAndDelete(id).lean();
  if (!deleted) throw new AppError(status.NOT_FOUND, "Coupon not found");
  return deleted;
};

const applyCoupon = async (
  code: string,
  toolPrice: number,
  userId: string,
  toolId?: string
) => {
  if (!code) throw new AppError(status.BAD_REQUEST, "Coupon code is required");

  const coupon = await CouponModel.findOne({
    code: code.toUpperCase(),
    isActive: true,
  });
  if (!coupon) throw new AppError(status.BAD_REQUEST, "Invalid coupon code");

  // Check expiry
  if (coupon.expiresAt && coupon.expiresAt < new Date()) {
    throw new AppError(status.BAD_REQUEST, "Coupon has expired");
  }

  // Check max usage (if set)
  if (
    typeof coupon.maxUsage === "number" &&
    coupon.usageCount >= coupon.maxUsage
  ) {
    throw new AppError(status.BAD_REQUEST, "Coupon usage limit reached");
  }

  // If coupon is restricted to a tool, ensure toolId matches
  if (coupon.toolId) {
    if (!toolId) {
      throw new AppError(
        status.BAD_REQUEST,
        "This coupon is valid only for a specific tool"
      );
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
  
// Track usage
  coupon.usageCount = (coupon.usageCount ?? 0) + 1;
  const userAlreadyTracked = coupon.usedBy?.some(
    (u) => u.toString() === userId
  );
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


const getMyCouponsFromDB = async (id: string) => {
  const coupons = await CouponModel.find({ createdBy: id })
    .populate("createdBy", "name email")
    .lean();
  if (!coupons || coupons.length === 0) {
    throw new AppError(status.NOT_FOUND, "No coupons found for this user");
  }
  return coupons;
};

export const CouponServices = {
  createCouponIntoDB,
  getAllCouponsFromDB,
  getSingleCouponFromDB,
  updateCouponIntoDB,
  deleteCouponIntoDB,
  applyCoupon,
  getMyCouponsFromDB
};
