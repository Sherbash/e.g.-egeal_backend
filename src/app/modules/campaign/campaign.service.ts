import status from "http-status";
import { Campaign, ICampaign } from "./campaign.model";
import AppError from "../../errors/appError";
import { IUser } from "../user/user.interface";
import { IPaginationOptions } from "../../interface/pagination";
import { paginationHelper } from "../../utils/paginationHelpers";

const createCampaign = async (payload: ICampaign, user: IUser) => {
  const existingCampaign = await Campaign.findOne({
    founderId: user?.id,
    toolId: payload?.toolId,
  });
  if (existingCampaign) {
    throw new AppError(status.BAD_REQUEST, "Campaign name already exists");
  }

  const campaignData = {
    ...payload,
    founderId: user?.id,
    isActive: true,
  };

  const result = await Campaign.create(campaignData);
  return result;
};

const getAllCampaigns = async (paginationOptions: IPaginationOptions) => {
  const { limit, page, skip } =
    paginationHelper.calculatePagination(paginationOptions);

  const campaigns = await Campaign.find()
    .populate("founderId", "firstName lastName email")
    .populate("toolId", "name description")
    .populate("influencers.userId", "firstName lastName email")
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
  const campaign = await Campaign.findById(campaignId)
    .populate("founderId", "firstName lastName email")
    .populate("toolId", "name description")
    .populate("influencers.userId", "firstName lastName email");

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
    campaign.founderId.toString() !== user._id.toString()
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
    campaign.founderId.toString() !== user._id.toString()
  ) {
    throw new AppError(
      status.FORBIDDEN,
      "Not authorized to modify this campaign"
    );
  }

  // Check if influencer already exists
  const existingInfluencer = campaign.influencers.find(
    (inf) => inf.userId.toString() === influencerId
  );

  if (existingInfluencer) {
    throw new AppError(status.CONFLICT, "Influencer already added to campaign");
  }

  campaign.influencers.push({
    userId: new Types.ObjectId(influencerId),
    status: "pending",
  });

  await campaign.save();
  return campaign;
};

const updateInfluencerStatus = async (
  campaignId: string,
  influencerId: string,
  status: "approved" | "rejected" | "completed",
  user: IUser
) => {
  const campaign = await Campaign.findById(campaignId);

  if (!campaign) {
    throw new AppError(status.NOT_FOUND, "Campaign not found");
  }

  // Only admin or founder can update status
  if (
    user.role !== "admin" &&
    campaign.founderId.toString() !== user._id.toString()
  ) {
    throw new AppError(
      status.FORBIDDEN,
      "Not authorized to modify this campaign"
    );
  }

  const influencerIndex = campaign.influencers.findIndex(
    (inf) => inf.userId.toString() === influencerId
  );

  if (influencerIndex === -1) {
    throw new AppError(
      status.NOT_FOUND,
      "Influencer not found in this campaign"
    );
  }

  campaign.influencers[influencerIndex].status = status;
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
};
