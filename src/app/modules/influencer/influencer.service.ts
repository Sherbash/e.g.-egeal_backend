import status from "http-status";
import AppError from "../../errors/appError";
import { IPaginationOptions } from "../../interface/pagination";
import { paginationHelper } from "../../utils/paginationHelpers";
import UserModel from "../user/user.model";
import { Influencer } from "./influencer.model"; // Assuming you have an Influencer model
import mongoose from "mongoose";
import { GigPage, IGigPage } from "./influencer-gigPage.model";
import { IUser } from "../user/user.interface";
import { generateUniqueId } from "../../utils/generateUniqueSlug";
import { Affiliate } from "../affiliate/affiliate.model";

interface IInfluencerFilters {
  searchTerm?: string;
  [key: string]: unknown;
}

// const getAllInfluencer = async (
//   options: IPaginationOptions,
//   filters: IInfluencerFilters = {}
// ) => {
//   const { page, limit, skip, sortBy, sortOrder } =
//     paginationHelper.calculatePagination(options);

//   const aggregationPipeline: mongoose.PipelineStage[] = [
//     {
//       $match: {
//         role: "influencer",
//         isActive: true,
//         ...(filters.searchTerm && {
//           $or: [
//             { firstName: { $regex: filters.searchTerm, $options: "i" } },
//             { lastName: { $regex: filters.searchTerm, $options: "i" } },
//             { email: { $regex: filters.searchTerm, $options: "i" } },
//           ],
//         }),
//       },
//     },
//     {
//       $lookup: {
//         from: "influencers",
//         localField: "_id",
//         foreignField: "userId",
//         as: "influencerDetails",
//       },
//     },
//     {
//       $unwind: {
//         path: "$influencerDetails",
//         preserveNullAndEmptyArrays: false,
//       },
//     },
//     {
//       $project: {
//         password: 0,
//         influencerDetails: {
//           userId: 0,
//         },
//       },
//     },
//     { $skip: skip },
//     { $limit: limit },
//     { $sort: { [sortBy]: sortOrder === "desc" ? -1 : 1 } },
//   ];

//   // Count pipeline for pagination
//   const countPipeline: mongoose.PipelineStage[] = [
//     {
//       $match: {
//         role: "influencer",
//         isActive: true,
//         ...(filters.searchTerm && {
//           $or: [
//             { firstName: { $regex: filters.searchTerm, $options: "i" } },
//             { lastName: { $regex: filters.searchTerm, $options: "i" } },
//             { email: { $regex: filters.searchTerm, $options: "i" } },
//           ],
//         }),
//       },
//     },
//     {
//       $lookup: {
//         from: "influencers",
//         localField: "_id",
//         foreignField: "userId",
//         as: "influencerDetails",
//       },
//     },
//     {
//       $unwind: {
//         path: "$influencerDetails",
//         preserveNullAndEmptyArrays: false,
//       },
//     },
//     { $count: "total" },
//   ];

//   const [influencers, countResult] = await Promise.all([
//     UserModel.aggregate(aggregationPipeline),
//     UserModel.aggregate(countPipeline),
//   ]);

//   const total = countResult[0]?.total || 0;

//   return {
//     meta: {
//       page,
//       limit,
//       total,
//       totalPages: Math.ceil(total / limit),
//     },
//     data: influencers,
//   };
// };

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
    // Populate earnedBadges from User model first
    {
      $lookup: {
        from: "badges",
        localField: "earnedBadges",
        foreignField: "_id",
        as: "earnedBadges",
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
const createGigPage = async (user: IUser, payload: IGigPage) => {
  const userId = user?.id;

  const fullName = `${user.firstName}${user.lastName}`;
  const username = await generateUniqueId(
    fullName.toLocaleLowerCase(),
    GigPage,
    "username"
  );

  payload.username = username;
  const influencer = await Influencer.findOne({ userId });
  if (!influencer) {
    throw new AppError(status.NOT_FOUND, "Influencer not found");
  }

  const existingGigPage = await GigPage.findOne({
    influencerId: influencer?._id,
  });
  if (existingGigPage) {
    throw new AppError(status.BAD_REQUEST, "Gig page already exists");
  }

  // // Get all affiliates for this influencer and extract their IDs
  // const affiliates = await Affiliate.find({
  //   influencerId: influencer?.influencerId,
  // }).lean();

  // const affiliateLinks = affiliates.map((affiliate) => affiliate.affiliateUrl);

  // Create with normalized username
  const gigPage = await GigPage.create({
    ...payload,
    username: payload.username.toLowerCase(),
    // affiliateLinks: affiliateLinks,
    influencerId: influencer._id,
    // isPublished: false,
    customLink: `${process.env.CLIENT_URL}/gig-info?username=${payload.username}&influencerId=${influencer?._id}`,
  });
  return gigPage;
};

const getGigPage = async (username: string) => {
  const gigPage = await GigPage.findOne({ username: username.toLowerCase() })
    .populate("influencerId")
    .lean();

  if (!gigPage) {
    throw new AppError(status.NOT_FOUND, "Gig page not found");
  }

  // Add custom link to response
  return gigPage;
};

const getGigPageByUserId = async (userId: string) => {
  const influencer = await Influencer.findOne({ userId });
  if (!influencer) {
    throw new AppError(status.NOT_FOUND, "Influencer not found");
  }

  // Get all affiliates for this influencer and extract their IDs
  const affiliates = await Affiliate.find({
    influencerId: influencer?.influencerId,
  }).lean();

  const affiliateLinks = affiliates.map((affiliate) => affiliate.affiliateUrl);

  const gigPage = await GigPage.findOne({
    influencerId: influencer?._id,
  })
    .populate("influencerId")
    .lean();

  if (!gigPage) {
    throw new AppError(status.NOT_FOUND, "Gig page not found");
  }

 const updatedGigPage = {
    ...gigPage,
    affiliateLinks: affiliateLinks,
  };

  return updatedGigPage;
};
const getGigPageByInfluencerId = async (influencerId: string) => {
  const influencer = await Influencer.findOne({ _id: influencerId });
  if (!influencer) {
    throw new AppError(status.NOT_FOUND, "Influencer not found");
  }

  // Get all affiliates for this influencer and extract their IDs
  const affiliates = await Affiliate.find({
    influencerId: influencer?.influencerId,
  }).lean();

  const affiliateLinks = affiliates.map((affiliate) => affiliate.affiliateUrl);

  const gigPage = await GigPage.findOne({
    influencerId: influencer._id,
  })
    .populate("influencerId")
    .lean();

  if (!gigPage) {
    throw new AppError(status.NOT_FOUND, "Gig page not found");
  }

  const updatedGigPage = {
    ...gigPage,
    affiliateLinks: affiliateLinks,
  };

  return updatedGigPage;
};

const getGigPageById = async (gigId: string) => {
  const gigPage = await GigPage.findOne({ _id: gigId })
    .populate("influencerId")
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
  const username = await generateUniqueId(
    payload.username as string,
    GigPage,
    "username"
  );

  payload.username = username;
  // Handle username change separately
  if (payload.username) {
    const existing = await GigPage.findOne({
      username: payload.username.toLocaleLowerCase(),
      influencerId: { $ne: influencer._id }, // Exclude current user
    });

    if (existing) {
      throw new AppError(status.BAD_REQUEST, "Username already taken");
    }

    payload.username = payload.username.toLocaleLowerCase();
  }

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
  const influencer = await Influencer.findOne({ influencerId }).select(
    "bankDetails"
  );
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
  getGigPageByInfluencerId,
};
