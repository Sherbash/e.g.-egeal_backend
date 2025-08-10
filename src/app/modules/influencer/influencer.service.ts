import status from "http-status";
import AppError from "../../errors/appError";
import { IPaginationOptions } from "../../interface/pagination";
import { paginationHelper } from "../../utils/paginationHelpers";
import UserModel from "../user/user.model";
import { Influencer } from "./influencer.model"; // Assuming you have an Influencer model
import mongoose from "mongoose";
import { GigPage } from "./influencer-gigPage.model";

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

const createGigPage = async (userId: string, payload: any) => {
  // Find the influencer first
  const influencer = await Influencer.findOne({ userId });
  if (!influencer) {
    throw new AppError(status.NOT_FOUND, "Influencer not found");
  }

  // Check if gig page already exists
  const existingGigPage = await GigPage.findOne({ influencerId: influencer._id });
  if (existingGigPage) {
    throw new AppError(status.BAD_REQUEST, "Gig page already exists for this influencer");
  }

  // Create new gig page
  const gigPage = await GigPage.create({
    ...payload,
    influencerId: influencer._id
  });

  // // Update influencer with gig page reference
  // influencer.gigPage = gigPage._id;
  await influencer.save();

  return gigPage;
};

const getGigPage = async (username: string) => {
  const gigPage = await GigPage.findOne({ username })
    .populate('influencerId', 'userId') // Populate influencer if needed
    .lean();

  if (!gigPage) {
    throw new AppError(status.NOT_FOUND, "Gig page not found");
  }

  return gigPage;
};

const getGigPageByUserId = async (userId: string) => {
  // Find influencer first
  const influencer = await Influencer.findOne({ userId });
  if (!influencer) {
    throw new AppError(status.NOT_FOUND, "Influencer not found");
  }

  // Get gig page
  const gigPage = await GigPage.findOne({ influencerId: influencer._id });
  if (!gigPage) {
    throw new AppError(status.NOT_FOUND, "Gig page not found");
  }

  return gigPage;
};

const updateGigPage = async (userId: string, payload: Partial<any>) => {
  // Find influencer first
  const influencer = await Influencer.findOne({ userId });
  if (!influencer) {
    throw new AppError(status.NOT_FOUND, "Influencer not found");
  }

  // Update gig page
  const gigPage = await GigPage.findOneAndUpdate(
    { influencerId: influencer._id },
    payload,
    { new: true, runValidators: true }
  );

  if (!gigPage) {
    throw new AppError(status.NOT_FOUND, "Gig page not found");
  }

  return gigPage;
};

const deleteGigPage = async (userId: string) => {
  // Find influencer first
  const influencer = await Influencer.findOne({ userId });
  if (!influencer) {
    throw new AppError(status.NOT_FOUND, "Influencer not found");
  }

  // Delete gig page
  await GigPage.deleteOne({ influencerId: influencer._id });

  // Remove reference from influencer
  influencer.gigPage = undefined;
  await influencer.save();

  return { message: "Gig page deleted successfully" };
};


export const InfluencerService = {
  getAllInfluencer,
  createGigPage,
  getGigPage,
  updateGigPage,
  deleteGigPage
};