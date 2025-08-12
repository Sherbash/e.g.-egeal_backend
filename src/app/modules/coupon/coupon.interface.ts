import { Types } from "mongoose";

export interface ICoupon {
  code: string; // uppercase, unique
  description?: string;
  discountType: "PERCENTAGE" | "FIXED";
  discountValue: number; // e.g. 10 (10% or 10 units)
  toolId: string; // <-- string, not ObjectId
  createdBy: Types.ObjectId; // admin/founder who created
  maxUsage?: number | null; // optional cap (total uses)
  usageCount: number; // total times used
  usedBy: Types.ObjectId[]; // unique user ids who have used the coupon
  expiresAt: Date | null;
  isActive?: boolean;
}

export interface ICouponUpdate {
  description?: string;
  discountType?: "PERCENTAGE" | "FIXED";
  discountValue?: number;
  toolId: string;
  maxUsage?: number | null;
  expiresAt?: Date | null;
  isActive?: boolean;
}
