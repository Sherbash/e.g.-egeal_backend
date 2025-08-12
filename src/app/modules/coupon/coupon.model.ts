import { Document, Schema, model } from "mongoose";
import { ICoupon } from "./coupon.interface";

interface ICouponDocument extends ICoupon, Document {}

const couponSchema = new Schema<ICouponDocument>(
  {
    code: { type: String, required: true, unique: true, uppercase: true, trim: true },
    description: { type: String },
    discountType: { type: String, enum: ["PERCENTAGE", "FIXED"], required: true },
    discountValue: { type: Number, required: true, min: 0 },
    // toolId is a string key that matches Tool.toolId
    toolId: { type: String }, 
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    maxUsage: { type: Number }, // optional
    usageCount: { type: Number, default: 0 },
    usedBy: [{ type: Schema.Types.ObjectId, ref: "User" }], // unique user ids (no duplicates enforced here but handled in service)
    expiresAt: { type: Date },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const CouponModel = model<ICouponDocument>("Coupon", couponSchema);
