import status from "http-status";
import AppError from "../../errors/appError";
import { IPaginationOptions } from "../../interface/pagination";
import { paginationHelper } from "../../utils/paginationHelpers";
import UserModel from "../user/user.model";
import { Influencer } from "./influencer.model"; // Assuming you have an Influencer model
import mongoose from "mongoose";
import { GigPage, IGigPage } from "./influencer-gigPage.model";

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
            { email: { $regex: filters.searchTerm, $options: "i" } },
          ],
        }),
      },
    },
    {
      $lookup: {
        from: "influencers",
        localField: "_id",
        foreignField: "userId",
        as: "influencerDetails",
      },
    },
    {
      $unwind: {
        path: "$influencerDetails",
        preserveNullAndEmptyArrays: false,
      },
    },
    {
      $project: {
        password: 0,
        influencerDetails: {
          userId: 0,
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
        role: "influencer",
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
        from: "influencers",
        localField: "_id",
        foreignField: "userId",
        as: "influencerDetails",
      },
    },
    {
      $unwind: {
        path: "$influencerDetails",
        preserveNullAndEmptyArrays: false,
      },
    },
    { $count: "total" },
  ];

  const [influencers, countResult] = await Promise.all([
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
    data: influencers,
  };
};

const createGigPage = async (userId: string, payload: IGigPage) => {
  // console.log("check payload", payload);
  // Validate username format (alphanumeric + hyphen/underscore)
  if (!/^[a-zA-Z0-9_-]+$/.test(payload.username)) {
    throw new AppError(
      status.BAD_REQUEST,
      "Username can only contain letters, numbers, hyphens and underscores"
    );
  }

  const influencer = await Influencer.findOne({ userId });
  if (!influencer) {
    throw new AppError(status.NOT_FOUND, "Influencer not found");
  }

  // Check for existing gig page or duplicate username
  const existingGigPage = await GigPage.findOne({
    $or: [
      { influencerId: influencer._id },
      { username: payload.username.toLowerCase() },
    ],
  });

  if (existingGigPage) {
    if (existingGigPage.influencerId.equals(influencer._id)) {
      throw new AppError(
        status.BAD_REQUEST,
        "Gig page already exists for this influencer"
      );
    } else {
      throw new AppError(status.BAD_REQUEST, "Username already taken");
    }
  }

  // Create with normalized username
  const gigPage = await GigPage.create({
    ...payload,
    username: payload.username.toLowerCase(), // Store lowercase for case-insensitive matching
    influencerId: influencer._id,
    isPublished: false, // Default to unpublished
    customLink: `${process.env.CLIENT_URL}/${payload.username}`,
  });

  // Generate the custom link

  return {
    ...gigPage.toObject(),
  };
};

const getGigPage = async (username: string) => {
  const gigPage = await GigPage.findOne({ username: username.toLowerCase() })
    .populate({
      path: "influencerId",
      select: "userId influencerId",
      populate: {
        path: "userId",
        select: "firstName lastName email",
      },
    })
    .lean();

  if (!gigPage) {
    throw new AppError(status.NOT_FOUND, "Gig page not found");
  }

  // Add custom link to response
  return {
    ...gigPage,
    influencer: gigPage.influencerId, // Flatten the populated data
  };
};

const getGigPageByUserId = async (userId: string) => {
  const influencer = await Influencer.findOne({ userId });
  if (!influencer) {
    throw new AppError(status.NOT_FOUND, "Influencer not found");
  }

  const gigPage = await GigPage.findOne({
    influencerId: influencer._id,
  }).lean();

  if (!gigPage) {
    throw new AppError(status.NOT_FOUND, "Gig page not found");
  }

  return {
    ...gigPage,
  };
};

const getGigPageById = async (gigId: string) => {
  const gigPage = await GigPage.findOne({ _id: gigId })
    .populate({
      path: "influencerId",
      select: "userId influencerId",
      populate: {
        path: "userId",
        select: "firstName lastName email",
      },
    })
    .lean();

  if (!gigPage) {
    throw new AppError(status.NOT_FOUND, "Gig page not found");
  }

  return gigPage;
};

const updateGigPage = async (userId: string, payload: Partial<IGigPage>) => {
  const influencer = await Influencer.findOne({ userId });
  if (!influencer) {
    throw new AppError(status.NOT_FOUND, "Influencer not found");
  }

  // Handle username change separately
  if (payload.username) {
    const existing = await GigPage.findOne({
      username: payload.username.toLowerCase(),
      influencerId: { $ne: influencer._id }, // Exclude current user
    });

    if (existing) {
      throw new AppError(status.BAD_REQUEST, "Username already taken");
    }

    payload.username = payload.username.toLowerCase();
  }

  const gigPage = await GigPage.findOneAndUpdate(
    { influencerId: influencer._id },
    payload,
    { new: true, runValidators: true }
  );

  if (!gigPage) {
    throw new AppError(status.NOT_FOUND, "Gig page not found");
  }

  return {
    ...gigPage.toObject(),
  };
};

const deleteGigPage = async (userId: string) => {
  const influencer = await Influencer.findOne({ userId });
  if (!influencer) {
    throw new AppError(status.NOT_FOUND, "Influencer not found");
  }

  const result = await GigPage.deleteOne({ influencerId: influencer._id });
  return result;
};




const upsertBankDetails = async (influencerId: string, bankDetails: any) => {
  const updated = await Influencer.findOneAndUpdate(
    { influencerId },
    { $set: { bankDetails } },
    { new: true }
  );

  if (!updated) {
    throw new AppError(status.NOT_FOUND, "Influencer not found");
  }

  return updated;
};

const getBankDetails = async (influencerId: string) => {
  const influencer = await Influencer.findOne({ influencerId }).select("bankDetails");
  if (!influencer) {
    throw new AppError(status.NOT_FOUND, "Influencer not found");
  }
  return influencer.bankDetails;
};

const deleteBankDetails = async (influencerId: string) => {
  const updated = await Influencer.findOneAndUpdate(
    { influencerId },
    { $unset: { bankDetails: "" } },
    { new: true }
  );

  if (!updated) {
    throw new AppError(status.NOT_FOUND, "Influencer not found");
  }

  return updated;
};

export const InfluencerService = {
  getAllInfluencer,
  getGigPageByUserId,
  createGigPage,
  getGigPage,
  updateGigPage,
  deleteGigPage,
  getGigPageById,
  upsertBankDetails,
  getBankDetails,
  deleteBankDetails,
};
