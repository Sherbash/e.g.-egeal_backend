import { IPaginationOptions } from "../../interface/pagination";
import { paginationHelper } from "../../utils/paginationHelpers";
import UserModel from "../user/user.model";
import { Influencer } from "./influencer.model"; // Assuming you have an Influencer model
import mongoose from "mongoose";

interface IInfluencerFilters {
  searchTerm?: string;
  [key: string]: unknown;
}

const getAllInfluencer = async (
  options: IPaginationOptions,
  filters: IInfluencerFilters = {}
) => {
  const { page, limit, skip, sortBy, sortOrder } =
    paginationHelper.calculatePagination(options);

  const aggregationPipeline: mongoose.PipelineStage[] = [
    {
      $match: {
        role: "influencer", 
        isActive: true,
        ...(filters.searchTerm && {
          $or: [
            { firstName: { $regex: filters.searchTerm, $options: "i" } },
            { lastName: { $regex: filters.searchTerm, $options: "i" } },
            { email: { $regex: filters.searchTerm, $options: "i" } }
          ]
        })
      }
    },
    {
      $lookup: {
        from: "influencers", 
        localField: "_id",
        foreignField: "userId",
        as: "influencerDetails"
      }
    },
    {
      $unwind: {
        path: "$influencerDetails",
        preserveNullAndEmptyArrays: false
      }
    },
    {
      $project: {
        password: 0,
        influencerDetails: {
          userId: 0
        }
      }
    },
    { $skip: skip },
    { $limit: limit },
    { $sort: { [sortBy]: sortOrder === "desc" ? -1 : 1 } }
  ];

  // Count pipeline for pagination
  const countPipeline: mongoose.PipelineStage[] = [
    {
      $match: {
        role: "influencer",
        isActive: true,
        ...(filters.searchTerm && {
          $or: [
            { firstName: { $regex: filters.searchTerm, $options: "i" } },
            { lastName: { $regex: filters.searchTerm, $options: "i" } },
            { email: { $regex: filters.searchTerm, $options: "i" } }
          ]
        })
      }
    },
    {
      $lookup: {
        from: "influencers",
        localField: "_id",
        foreignField: "userId",
        as: "influencerDetails"
      }
    },
    {
      $unwind: {
        path: "$influencerDetails",
        preserveNullAndEmptyArrays: false
      }
    },
    { $count: "total" }
  ];

  const [influencers, countResult] = await Promise.all([
    UserModel.aggregate(aggregationPipeline),
    UserModel.aggregate(countPipeline)
  ]);

  const total = countResult[0]?.total || 0;

  return {
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    },
    data: influencers
  };
};

export const InfluencerService = {
  getAllInfluencer,
};