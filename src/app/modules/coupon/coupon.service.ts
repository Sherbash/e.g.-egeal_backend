import status from "http-status";
import mongoose from "mongoose";
import { ICoupon, ICouponUpdate } from "./coupon.interface";
import { CouponModel } from "./coupon.model";
import AppError from "../../errors/appError";

const createCouponIntoDB = async (payload: ICoupon) => {
  const existing = await CouponModel.findOne({ code: payload.code });
  if (existing) {
    throw new AppError(status.BAD_REQUEST, "Coupon code already exists");
  }
  const coupon = await CouponModel.create(payload);
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

const applyCoupon = async (code: string, toolPrice: number, userId: string, toolId?: string) => {
  const coupon = await CouponModel.findOne({ code: code.toUpperCase(), isActive: true });

  if (!coupon) throw new AppError(status.BAD_REQUEST, "Invalid coupon code");

  // Check expiry
  if (coupon.expiresAt && coupon.expiresAt < new Date()) {
    throw new AppError(status.BAD_REQUEST, "Coupon has expired");
  }

  // Check max usage
  if (coupon.maxUsage && coupon.usageCount >= coupon.maxUsage) {
    throw new AppError(status.BAD_REQUEST, "Coupon usage limit reached");
  }

  // If tool-specific coupon
  if (coupon.toolId && toolId && coupon.toolId.toString() !== toolId) {
    throw new AppError(status.BAD_REQUEST, "Coupon not valid for this tool");
  }

  // Calculate discount
  let discountAmount = 0;
  if (coupon.discountType === "PERCENTAGE") {
    discountAmount = (toolPrice * coupon.discountValue) / 100;
  } else {
    discountAmount = coupon.discountValue;
  }

  const finalPrice = Math.max(toolPrice - discountAmount, 0);

  // Update usage tracking
  coupon.usageCount += 1;
  coupon.usedBy.push(new mongoose.Types.ObjectId(userId));
  await coupon.save();

  return { finalPrice, discountAmount, coupon };
};

export const CouponServices = {
  createCouponIntoDB,
  getAllCouponsFromDB,
  getSingleCouponFromDB,
  updateCouponIntoDB,
  deleteCouponIntoDB,
  applyCoupon
};
