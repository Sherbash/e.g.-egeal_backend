import { IPaginationOptions } from "../../interface/pagination";
import { paginationHelper } from "../../utils/paginationHelpers";
import UserModel from "../user/user.model";
import { Founder } from "./founder.model";
import mongoose from "mongoose";

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

export const FounderService = {
  getAllFounder,
};
