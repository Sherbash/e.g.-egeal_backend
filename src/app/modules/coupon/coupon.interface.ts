import { Types } from "mongoose";

export interface ICoupon {
  code: string; // e.g. SAVE10
  description?: string;
  discountType: "PERCENTAGE" | "FIXED";
  discountValue: number; // e.g. 10 (for 10% or $10)
  toolId?: Types.ObjectId; // optional: coupon for a specific tool only
  createdBy: Types.ObjectId; // Admin or Founder
  maxUsage?: number; // optional
  usageCount: number;
  usedBy: Types.ObjectId[]; // array of user IDs who used this coupon
  expiresAt?: Date; // optional expiry date
  isActive: boolean;
}

export interface ICouponUpdate {
  description?: string;
  discountType?: "PERCENTAGE" | "FIXED";
  discountValue?: number;
  toolId?: Types.ObjectId;
  maxUsage?: number;
  expiresAt?: Date;
  isActive?: boolean;
}
