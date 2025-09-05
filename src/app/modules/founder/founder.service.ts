import status from "http-status";
import AppError from "../../errors/appError";
import { IPaginationOptions } from "../../interface/pagination";
import { paginationHelper } from "../../utils/paginationHelpers";
import UserModel from "../user/user.model";
import { Founder } from "./founder.model";
import mongoose from "mongoose";
import { sendEmail } from "../../utils/emailHelper";

interface IFounderFilters {
  searchTerm?: string;
  [key: string]: unknown;
}

const getAllFounder = async (
  options: IPaginationOptions,
  filters: IFounderFilters = {}
) => {
  const { page, limit, skip, sortBy, sortOrder } =
    paginationHelper.calculatePagination(options);

  // Aggregation pipeline to find active founders with their founder data
  const aggregationPipeline: mongoose.PipelineStage[] = [
    {
      $match: {
        role: "founder",
        isActive: true,
        ...(filters.searchTerm && {
          $or: [
            { firstName: { $regex: filters.searchTerm, $options: "i" } },
            { lastName: { $regex: filters.searchTerm, $options: "i" } },
            { email: { $regex: filters.searchTerm, $options: "i" } },
          ],
        }),
      },
    },
    {
      $lookup: {
        from: "founders", // Collection name (lowercase & pluralized)
        localField: "_id", // Field from User collection
        foreignField: "userId", // Field from Founder collection
        as: "founderDetails",
      },
    },
    {
      $unwind: {
        path: "$founderDetails",
        preserveNullAndEmptyArrays: false, // Only users with founder data
      },
    },
    {
      $project: {
        password: 0, // Exclude password
        founderDetails: {
          userId: 0, // Exclude redundant userId from founder details
        },
      },
    },
    { $skip: skip },
    { $limit: limit },
    { $sort: { [sortBy]: sortOrder === "desc" ? -1 : 1 } },
  ];

  // Count pipeline for pagination
  const countPipeline: mongoose.PipelineStage[] = [
    {
      $match: {
        role: "founder",
        isActive: true,
        ...(filters.searchTerm && {
          $or: [
            { firstName: { $regex: filters.searchTerm, $options: "i" } },
            { lastName: { $regex: filters.searchTerm, $options: "i" } },
            { email: { $regex: filters.searchTerm, $options: "i" } },
          ],
        }),
      },
    },
    {
      $lookup: {
        from: "founders",
        localField: "_id",
        foreignField: "userId",
        as: "founderDetails",
      },
    },
    {
      $unwind: {
        path: "$founderDetails",
        preserveNullAndEmptyArrays: false,
      },
    },
    { $count: "total" },
  ];

  const [founders, countResult] = await Promise.all([
    UserModel.aggregate(aggregationPipeline),
    UserModel.aggregate(countPipeline),
  ]);

  const total = countResult[0]?.total || 0;

  return {
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
    data: founders,
  };
};
// export const getAllFoundersByRefer = async () => {
//   const founders = await Founder.find()
//     .populate({
//       path: "userId",
//       select: "-password",
//       populate: [
//         { path: "referralCount" },
//         { path: "referralStats" },
//         { path: "freePackages", select: "_id status type createdAt" },
//       ],
//     })
//     .lean();

//   if (!founders || founders.length === 0) {
//     throw new AppError(status.NOT_FOUND, "No Founders found!");
//   }

//   return founders;
// };


export const getAllFoundersByRefer = async () => {
  const users = await UserModel.find({ invitedUserCount: { $gt: 0 } }).lean();


  return users
};

export const sendCouponCode = async (
  payload: { code: string; referralCount: number; discount: number,email:string }
) => {
  if (!payload.email) throw new Error("Email is required");
  if (!payload || !payload.code) throw new Error("Coupon code is required");

  const { code, referralCount, discount } = payload;

  const subject = "🎉 Your Exclusive Coupon Code from Egeal AI Hub!";
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px; text-align: center; background-color: #f9f9f9;">
      <h2 style="color: #007bff;">Congratulations!</h2>
      <p>You have successfully referred <strong>${referralCount}</strong> user(s)!</p>
      <p>As a reward, you get a <strong>${discount}% discount</strong> coupon code:</p>
      <h3 style="color: #ff4b2b; font-size: 24px; margin: 20px 0;">${code}</h3>
      <p style="font-size: 14px; color: #555;">Use this code at checkout to claim your discount. Hurry, limited time offer!</p>
      <p style="margin-top: 20px; font-size: 12px; color: #999;">Egeal AI Hub © ${new Date().getFullYear()}</p>
    </div>
  `;

  await sendEmail(payload.email, subject, html);

  return { success: true, message: "Coupon code sent successfully", code, referralCount, discount };
};

export const FounderService = {
  getAllFounder,
  getAllFoundersByRefer,
  sendCouponCode
};

