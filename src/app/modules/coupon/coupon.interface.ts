// import { Types } from "mongoose";

// export interface ICoupon {
//   code: string;
//   description?: string; 
//   discountType: "PERCENTAGE" | "FIXED";
//   discountValue: number;
//   toolId?: string;
//   createdBy: Types.ObjectId;
//   maxUsage?: number | null;
//   usageCount: number;
//   usedBy: Types.ObjectId[];
//   expiresAt?: Date | null;
//   isActive?: boolean;
// }

// export interface ICouponUpdate {
//   description?: string;
//   discountType?: "PERCENTAGE" | "FIXED";
//   discountValue?: number;
//   toolId: string;
//   maxUsage?: number | null;
//   expiresAt?: Date | null;
//   isActive?: boolean;
// }



//! version 2

import { Types } from "mongoose";

export interface ICoupon {
  code: string;
  description?: string; 
  discountType: "PERCENTAGE" | "FIXED";
  discountValue: number;
  toolId?: string;
  packageId?: Types.ObjectId;
  createdBy: Types.ObjectId;
  maxUsage?: number | null;
  usageCount: number;
  usedBy: Types.ObjectId[];
  expiresAt?: Date | 
  null;
  isActive?: boolean;
  isDeleted?: boolean;
  validatedFor: "PACKAGE" | "TOOL";
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

export interface ICouponDelete {
  isDeleted?: boolean;
}



