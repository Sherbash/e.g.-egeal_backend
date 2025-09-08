// import status from "http-status";

// import mongoose from "mongoose";
// import { ICoupon, ICouponUpdate } from "./coupon.interface";
// import AppError from "../../errors/appError";
// import { CouponModel } from "./coupon.model";

// // coupon.service.ts
// const createCouponIntoDB = async (payload: ICoupon) => {
//   // Now TypeScript knows payload.code definitely exists
//   const code = payload.code.toUpperCase();

//   const existing = await CouponModel.findOne({ code });
//   if (existing) {
//     throw new AppError(status.CONFLICT, "Coupon code already exists");
//   }

//   // Create with defaults
//   const couponData: ICoupon = {
//     code,
//     description: payload.description || undefined,
//     discountType: payload.discountType!,
//     discountValue: payload.discountValue!,
//     toolId: payload.toolId || undefined,
//     createdBy: payload.createdBy!,
//     maxUsage: payload.maxUsage || undefined,
//     usageCount: 0,
//     usedBy: [],
//     expiresAt: payload.expiresAt || undefined,
//     isActive: payload.isActive ?? true,
//   };

//   return await CouponModel.create(couponData);
// };

// const getAllCouponsFromDB = async () => {
//   return CouponModel.find().populate("createdBy", "name email").lean();
// };

// const getSingleCouponFromDB = async (id: string) => {
//   const coupon = await CouponModel.findById(id).lean();
//   if (!coupon) throw new AppError(status.NOT_FOUND, "Coupon not found");
//   return coupon;
// };

// const updateCouponIntoDB = async (id: string, payload: ICouponUpdate) => {
//   const updated = await CouponModel.findByIdAndUpdate(id, payload, {
//     new: true,
//   }).lean();
//   if (!updated) throw new AppError(status.NOT_FOUND, "Coupon not found");
//   return updated;
// };

// const deleteCouponIntoDB = async (id: string) => {
//   const deleted = await CouponModel.findByIdAndDelete(id).lean();
//   if (!deleted) throw new AppError(status.NOT_FOUND, "Coupon not found");
//   return deleted;
// };

// // const applyCoupon = async (
// //   code: string,
// //   toolPrice: number,
// //   userId: string,
// //   toolId?: string
// // ) => {
// //   if (!code) throw new AppError(status.BAD_REQUEST, "Coupon code is required");
// //   if (!mongoose.Types.ObjectId.isValid(userId)) {
// //     throw new AppError(status.BAD_REQUEST, "Invalid user ID");
// //   }

// //   const coupon = await CouponModel.findOne({
// //     code: code.toUpperCase(),
// //     isActive: true,
// //   });
// //   if (!coupon) throw new AppError(status.BAD_REQUEST, "Invalid coupon code");

// //   // Check expiry
// //   if (coupon.expiresAt && coupon.expiresAt < new Date()) {
// //     throw new AppError(status.BAD_REQUEST, "Coupon has expired");
// //   }

// //   // Check max usage (if set)
// //   if (
// //     typeof coupon.maxUsage === "number" &&
// //     coupon.usageCount >= coupon.maxUsage
// //   ) {
// //     throw new AppError(status.BAD_REQUEST, "Coupon usage limit reached");
// //   }

// //   // If coupon is restricted to a tool, ensure toolId matches
// //   if (coupon.toolId) {
// //     if (!toolId) {
// //       throw new AppError(
// //         status.BAD_REQUEST,
// //         "This coupon is valid only for a specific tool"
// //       );
// //     }
// //     if (coupon.toolId !== toolId) {
// //       throw new AppError(status.BAD_REQUEST, "Coupon not valid for this tool");
// //     }
// //   }

// //   // Calculate discount
// //   let discountAmount = 0;
// //   if (coupon.discountType === "PERCENTAGE") {
// //     discountAmount = (toolPrice * coupon.discountValue) / 100;
// //   } else {
// //     discountAmount = coupon.discountValue;
// //   }

// //   const finalPrice = Math.max(toolPrice - discountAmount, 0);

// //   // Atomically update usageCount and usedBy
// //   const update: any = {
// //     $inc: { usageCount: 1 },
// //   };
// //   if (!coupon.usedBy.some((u) => u.toString() === userId)) {
// //     update.$push = { usedBy: new mongoose.Types.ObjectId(userId) };
// //   }

// //   const updatedCoupon = await CouponModel.findOneAndUpdate(
// //     { _id: coupon._id, isActive: true },
// //     update,
// //     { new: true }
// //   ).lean();

// //   if (!updatedCoupon) {
// //     throw new AppError(status.INTERNAL_SERVER_ERROR, "Failed to update coupon usage");
// //   }

// //   return {
// //     finalPrice,
// //     discountAmount,
// //     coupon: updatedCoupon,
// //   };
// // };

// const getMyCouponsFromDB = async (id: string) => {
//   const coupons = await CouponModel.find({ createdBy: id })
//     .populate("createdBy", "name email")
//     .lean();
//   if (!coupons || coupons.length === 0) {
//     throw new AppError(status.NOT_FOUND, "No coupons found for this user");
//   }
//   return coupons;
// };

// // coupon.service.ts
// const applyCoupon = async (
//   code: string,
//   toolPrice: number,
//   usedBy: string, // Changed parameter name to match req.body.usedBy
//   toolId?: string
// ) => {
//   if (!code) throw new AppError(status.BAD_REQUEST, "Coupon code is required");
//   if (!mongoose.Types.ObjectId.isValid(usedBy)) {
//     throw new AppError(status.BAD_REQUEST, "Invalid user ID in usedBy");
//   }

//   const coupon = await CouponModel.findOne({
//     code: code.toUpperCase(),
//     isActive: true,
//   });
//   if (!coupon) throw new AppError(status.BAD_REQUEST, "Invalid coupon code");

//   // Check expiry
//   if (coupon.expiresAt && coupon.expiresAt < new Date()) {
//     throw new AppError(status.BAD_REQUEST, "Coupon has expired");
//   }

//   // Check max usage (if set)
//   if (
//     typeof coupon.maxUsage === "number" &&
//     coupon.usageCount >= coupon.maxUsage
//   ) {
//     throw new AppError(status.BAD_REQUEST, "Coupon usage limit reached");
//   }

//   // If coupon is restricted to a tool, ensure toolId matches
//   if (coupon.toolId) {
//     if (!toolId) {
//       throw new AppError(
//         status.BAD_REQUEST,
//         "This coupon is valid only for a specific tool"
//       );
//     }
//     if (coupon.toolId !== toolId) {
//       throw new AppError(status.BAD_REQUEST, "Coupon not valid for this tool");
//     }
//   }

//   // Calculate discount
//   let discountAmount = 0;
//   if (coupon.discountType === "PERCENTAGE") {
//     discountAmount = (toolPrice * coupon.discountValue) / 100;
//   } else {
//     discountAmount = coupon.discountValue;
//   }

//   const finalPrice = Math.max(toolPrice - discountAmount, 0);

//   // Atomically update usageCount and usedBy
//   const update: any = {
//     $inc: { usageCount: 1 },
//   };
//   if (!coupon.usedBy.some((u) => u.toString() === usedBy)) {
//     update.$push = { usedBy: new mongoose.Types.ObjectId(usedBy) };
//   }

//   const updatedCoupon = await CouponModel.findOneAndUpdate(
//     { _id: coupon._id, isActive: true },
//     update,
//     { new: true }
//   ).lean();

//   if (!updatedCoupon) {
//     throw new AppError(status.INTERNAL_SERVER_ERROR, "Failed to update coupon usage");
//   }

//   return {
//     finalPrice,
//     discountAmount,
//     coupon: updatedCoupon,
//   };
// };

// export const CouponServices = {
//   createCouponIntoDB,
//   getAllCouponsFromDB,
//   getSingleCouponFromDB,
//   updateCouponIntoDB,
//   deleteCouponIntoDB,
//   applyCoupon,
//   getMyCouponsFromDB
// };

//! Version - 2

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
    packageId: payload.packageId || undefined,
    createdBy: payload.createdBy!,
    maxUsage: payload.maxUsage || undefined,
    usageCount: 0,
    usedBy: [],
    expiresAt: payload.expiresAt || undefined,
    isActive: payload.isActive ?? true,
    isDeleted: payload.isDeleted ?? false,
    validatedFor: payload.validatedFor || "TOOL",
  };

  return await CouponModel.create(couponData);
};

const getAllCouponsByUserIdFromDB = async (
  userId: string,
  filters: { searchTerm?: string }
) => {
  const query: any = { createdBy: userId, isDeleted: false };

  if (filters.searchTerm) {
    query.$or = [
      { code: { $regex: filters.searchTerm, $options: "i" } },
      { discountType: { $regex: filters.searchTerm, $options: "i" } },
    ];
  }

  return await CouponModel.find(query)
    .populate("createdBy", "name email")
    .lean();
};

const getSingleCouponByIdWithUserIdFromDB = async (
  id: string,
  userId: string
) => {
  const coupon = await CouponModel.findOne({ _id: id, createdBy: userId })
    .populate("createdBy", "name email")
    .lean();

  if (!coupon) {
    throw new AppError(status.NOT_FOUND, "Coupon not found");
  }

  return coupon;
};

const updateSingleCouponByIdWithUserIdIntoDB = async (
  id: string,
  userId: string,
  payload: ICouponUpdate
) => {
  const updated = await CouponModel.findOneAndUpdate(
    { _id: id, createdBy: userId, isDeleted: false },
    payload,
    { new: true, lean: true }
  );

  if (!updated) {
    throw new AppError(status.NOT_FOUND, "Coupon not found or unauthorized");
  }

  return updated;
};

const softDeleteSingleCouponByIdWithUserIdIntoDB = async (
  id: string,
  userId: string
) => {
  const updated = await CouponModel.findOneAndUpdate(
    { _id: id, createdBy: userId },
    { isDeleted: true },
    { new: true, lean: true }
  );

  if (!updated) {
    throw new AppError(status.NOT_FOUND, "Coupon not found or unauthorized");
  }

  return updated;
};

const deleteCouponIntoDB = async (id: string) => {
  const deleted = await CouponModel.findByIdAndDelete(id).lean();
  if (!deleted) throw new AppError(status.NOT_FOUND, "Coupon not found");
  return deleted;
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

//! coupon.service.ts

const applyCoupon = async (
  code: string,
  toolPrice: number,
  usedBy: string, // Changed parameter name to match req.body.usedBy
  toolId?: string
) => {
  if (!code) throw new AppError(status.BAD_REQUEST, "Coupon code is required");
  if (!mongoose.Types.ObjectId.isValid(usedBy)) {
    throw new AppError(status.BAD_REQUEST, "Invalid user ID in usedBy");
  }

  const coupon = await CouponModel.findOne({
    code: code.toUpperCase(),
    isActive: true,
  });
  if (!coupon) throw new AppError(status.BAD_REQUEST, "Invalid coupon code");

  // Check expiry
  if (coupon.expiresAt && coupon.expiresAt < new Date()) {
    throw new AppError(status.BAD_REQUEST, "Coupon has expired");
  }

  // ! Check Validated for tool
  if (coupon.validatedFor === "TOOL") {
    if (!toolId) {
      throw new AppError(
        status.BAD_REQUEST,
        "This coupon is valid only for a specific tool"
      );
    }
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

  // Atomically update usageCount and usedBy
  const update: any = {
    $inc: { usageCount: 1 },
  };
  if (!coupon.usedBy.some((u) => u.toString() === usedBy)) {
    update.$push = { usedBy: new mongoose.Types.ObjectId(usedBy) };
  }

  const updatedCoupon = await CouponModel.findOneAndUpdate(
    { _id: coupon._id, isActive: true },
    update,
    { new: true }
  ).lean();

  if (!updatedCoupon) {
    throw new AppError(
      status.INTERNAL_SERVER_ERROR,
      "Failed to update coupon usage"
    );
  }

  return {
    finalPrice,
    discountAmount,
    coupon: updatedCoupon,
  };
};

const applyCouponForAdmin = async (
  code: string,
  toolPrice: number,
  usedBy: mongoose.Types.ObjectId,
  packageId?: mongoose.Types.ObjectId
) => {
  if (!code) throw new AppError(status.BAD_REQUEST, "Coupon code is required");
  if (!mongoose.Types.ObjectId.isValid(usedBy)) {
    throw new AppError(status.BAD_REQUEST, "Invalid user ID in usedBy");
  }

  const coupon = await CouponModel.findOne({
    code: code.toUpperCase(),
    isActive: true,
  });
  if (!coupon) throw new AppError(status.BAD_REQUEST, "Invalid coupon code");

  //! Checked active status
  if (!coupon.isActive || coupon.isDeleted) {
    throw new AppError(status.BAD_REQUEST, "Coupon is inactive");
  }

  //! Check Validated for Package
  if (coupon.validatedFor === "PACKAGE") {
    if (!packageId) {
      throw new AppError(
        status.BAD_REQUEST,
        "This coupon is valid only for a specific package"
      );
    }
  }

  //! Check for specific package
  if (coupon.packageId) {
    if (!packageId) {
      throw new AppError(
        status.BAD_REQUEST,
        "This coupon is valid only for a specific package"
      );
    }

    // FIX: convert or use .equals()
    if (!coupon.packageId.equals(packageId)) {
      throw new AppError(
        status.BAD_REQUEST,
        "Coupon not valid for this package"
      );
    }
  }

  // Check usage
  if (coupon.usedBy.includes(usedBy)) {
    throw new AppError(status.BAD_REQUEST, "Coupon already used by this user");
  }

  // Check if coupon is deleted
  if (coupon.isDeleted) {
    throw new AppError(status.BAD_REQUEST, "Coupon is deleted");
  }

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
  // Calculate discount
  let discountAmount = 0;
  if (coupon.discountType === "PERCENTAGE") {
    discountAmount = (toolPrice * coupon.discountValue) / 100;
  } else {
    discountAmount = coupon.discountValue;
  }

  const finalPrice = Math.max(toolPrice - discountAmount, 0);

  // Atomically update usageCount and usedBy
  const update: any = {
    $inc: { usageCount: 1 },
  };
  if (!coupon.usedBy.some((u) => u.equals(usedBy))) {
    update.$push = { usedBy: new mongoose.Types.ObjectId(usedBy) };
  }

  const updatedCoupon = await CouponModel.findOneAndUpdate(
    { _id: coupon._id, isActive: true },
    update,
    { new: true }
  ).lean();

  if (!updatedCoupon) {
    throw new AppError(
      status.INTERNAL_SERVER_ERROR,
      "Failed to update coupon usage"
    );
  }

  return {
    finalPrice,
    discountAmount,
    coupon: updatedCoupon,
  };
};

const getPackageCouponByCode = async (code: string, packagePrice: number) => {
  if (!code) throw new AppError(status.BAD_REQUEST, "Coupon code is required");

  const coupon = await CouponModel.findOne({
    code: code.toUpperCase(),
    isActive: true,
    isDeleted: false,
    validatedFor: "PACKAGE",
  })
    .populate("createdBy", "name email")
    .populate("packageId", "name description")
    .lean();

  if (!coupon) {
    throw new AppError(
      status.NOT_FOUND,
      "Coupon not found or not valid for packages"
    );
  }

  if (coupon.expiresAt && coupon.expiresAt < new Date()) {
    throw new AppError(status.BAD_REQUEST, "Coupon has expired");
  }

  if (
    typeof coupon.maxUsage === "number" &&
    coupon.usageCount >= coupon.maxUsage
  ) {
    throw new AppError(status.BAD_REQUEST, "Coupon usage limit reached");
  }

  let discountAmount = 0;
  if (coupon.discountType === "PERCENTAGE") {
    discountAmount = (packagePrice * coupon.discountValue) / 100;
  } else {
    discountAmount = coupon.discountValue;
  }

  const finalPrice = Math.max(packagePrice - discountAmount, 0);

  return {
    coupon,
    discountAmount,
    finalPrice,
  };
};

export const CouponServices = {
  createCouponIntoDB,
  getAllCouponsByUserIdFromDB,
  getSingleCouponByIdWithUserIdFromDB,
  updateSingleCouponByIdWithUserIdIntoDB,
  softDeleteSingleCouponByIdWithUserIdIntoDB,
  getPackageCouponByCode,
  deleteCouponIntoDB,
  applyCoupon,
  applyCouponForAdmin,
  getMyCouponsFromDB,
};
