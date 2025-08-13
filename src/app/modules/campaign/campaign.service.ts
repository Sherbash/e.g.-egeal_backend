import status from "http-status";
import { Campaign, ICampaign } from "./campaign.model";
import AppError from "../../errors/appError";
import { IUser } from "../user/user.interface";
import { IPaginationOptions } from "../../interface/pagination";
import { paginationHelper } from "../../utils/paginationHelpers";
import { Founder } from "../founder/founder.model";
import { ToolModel } from "../tool/tool.model";
import { Types } from "mongoose";
import { Influencer } from "../influencer/influencer.model";

const createCampaign = async (payload: ICampaign, user: IUser) => {
  const existingFounder = await Founder.findOne({ userId: user?.id });

  const founderId = existingFounder?._id;

  if (!founderId) {
    throw new AppError(status.BAD_REQUEST, "Founder not found");
  }
  const existingCampaign = await Campaign.findOne({
    founderId,
    toolId: payload?.toolId,
  });

  if (existingCampaign) {
    throw new AppError(
      status.BAD_REQUEST,
      "Campaign already exists for this tool"
    );
  }

  const isExistingTool = await ToolModel.findOne({
    founderId,
    toolId: payload?.toolId,
    isActive: true,
  });

  if (!isExistingTool) {
    throw new AppError(status.BAD_REQUEST, "Tool not found");
  }

  const campaignData = {
    ...payload,
    founderId,
    isActive: true,
  };

  const result = await Campaign.create(campaignData);
  return result;
};

const getAllCampaigns = async (paginationOptions: IPaginationOptions) => {
  const { limit, page, skip, sortBy, sortOrder } =
    paginationHelper.calculatePagination(paginationOptions);

  const campaigns = await Campaign.find()
    .populate({
      path: "founderId",
      select: "userId",
      populate: {
        path: "userId",
        select: "firstName lastName email",
      },
    })
    // .populate("influencers.userId", "firstName lastName email")
    .sort({ [sortBy]: sortOrder })
    .skip(skip)
    .limit(limit);

  const total = await Campaign.countDocuments();

  return {
    meta: {
      page,
      limit,
      total,
    },
    data: campaigns,
  };
};

const getCampaignById = async (campaignId: string) => {
  const campaign = await Campaign.findById(campaignId).populate({
    path: "founderId",
    select: "userId",
    populate: {
      path: "userId",
      select: "firstName lastName email",
    },
  });

  if (!campaign) {
    throw new AppError(status.NOT_FOUND, "Campaign not found");
  }

  return campaign;
};

const updateCampaign = async (
  campaignId: string,
  payload: Partial<ICampaign>,
  user: IUser
) => {
  const campaign = await Campaign.findById(campaignId);

  if (!campaign) {
    throw new AppError(status.NOT_FOUND, "Campaign not found");
  }

  // Only admin or founder can update
  if (
    user.role !== "admin" &&
    campaign.founderId.toString() !== user?.id.toString()
  ) {
    throw new AppError(
      status.FORBIDDEN,
      "Not authorized to update this campaign"
    );
  }

  // Prevent changing certain fields
  if (payload.founderId || payload.toolId) {
    throw new AppError(
      status.BAD_REQUEST,
      "Cannot change campaign ownership or tool"
    );
  }

  const result = await Campaign.findByIdAndUpdate(campaignId, payload, {
    new: true,
    runValidators: true,
  });

  return result;
};

const deleteCampaign = async (campaignId: string, user: IUser) => {
  const campaign = await Campaign.findById(campaignId);

  if (!campaign) {
    throw new AppError(status.NOT_FOUND, "Campaign not found");
  }

  // Only admin or founder can delete
  if (
    user.role !== "admin" &&
    campaign.founderId.toString() !== user._id.toString()
  ) {
    throw new AppError(
      status.FORBIDDEN,
      "Not authorized to delete this campaign"
    );
  }

  await campaign.deleteOne();
  return { message: "Campaign deleted successfully" };
};

const addInfluencerToCampaign = async (
  campaignId: string,
  influencerId: string,
  user: IUser
) => {
  const campaign = await Campaign.findById(campaignId);

  if (!campaign) {
    throw new AppError(status.NOT_FOUND, "Campaign not found");
  }

  // Only admin or founder can add influencers
  if (
    user.role !== "admin" &&
    campaign.founderId.toString() !== user?.id.toString()
  ) {
    throw new AppError(
      status.FORBIDDEN,
      "Not authorized to modify this campaign"
    );
  }

  // Check if influencer already exists
  const existingInfluencer = campaign.influencers.find(
    (inf) => inf.influencerId.toString() === influencerId
  );

  if (existingInfluencer) {
    throw new AppError(status.CONFLICT, "Influencer already added to campaign");
  }

  campaign.influencers.push({
    influencerId: new Types.ObjectId(influencerId),
    status: "approved",
  });

  await campaign.save();
  return campaign;
};

const requestToJoinCampaign = async (campaignId: string, user: IUser) => {
  const existingInfluencer = await Influencer.findOne({ userId: user?.id });

  const InfluencerId = existingInfluencer?._id;

  const campaign = await Campaign.findById(campaignId);
  if (!campaign) throw new AppError(status.NOT_FOUND, "Campaign not found");

  // Check if already requested/joined
  const exists = campaign.influencers.some(
    (inf) =>
      inf.influencerId.toString() === (InfluencerId as string | undefined)
  );
  if (exists) throw new AppError(status.CONFLICT, "Already requested/joined");

  campaign.influencers.push({
    influencerId: new Types.ObjectId(InfluencerId),
    status: "pending", // Default status
  });

  console.log("check campaign", campaign);

  await campaign.save();
  return campaign;
};

const updateInfluencerStatus = async (
  campaignId: string,
  influencerId: string,
  user: IUser
) => {
  // 1. Validate campaign exists
  const campaign = await Campaign.findById(campaignId);
  if (!campaign) {
    throw new AppError(status.NOT_FOUND, "Campaign not found");
  }

  // 2. Authorization check
  if (user.role !== "admin") {
    // For non-admins, verify they're the campaign founder
    const founder = await Founder.findOne({ userId: user.id });
    if (!founder) {
      throw new AppError(status.FORBIDDEN, "Founder profile not found");
    }

    if (campaign.founderId.toString() !== founder._id.toString()) {
      throw new AppError(
        status.FORBIDDEN,
        "Not authorized to modify this campaign"
      );
    }
  }

  // 3. Find and update influencer status
  const influencerToUpdate = campaign.influencers.find(
    (inf) => inf.influencerId.toString() === influencerId
  );

  if (!influencerToUpdate) {
    throw new AppError(
      status.NOT_FOUND,
      "Influencer not found in this campaign"
    );
  }

  // 4. Toggle status (approved ↔ rejected)
  influencerToUpdate.status =
    influencerToUpdate.status === "approved" ? "rejected" : "approved";
  await campaign.save();

  return campaign;
};

export const CampaignServices = {
  createCampaign,
  getAllCampaigns,
  getCampaignById,
  updateCampaign,
  deleteCampaign,
  addInfluencerToCampaign,
  updateInfluencerStatus,
  requestToJoinCampaign,
};
