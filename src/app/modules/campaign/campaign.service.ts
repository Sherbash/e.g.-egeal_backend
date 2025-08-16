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
import UserModel from "../user/user.model";
import { findProfileByRole } from "../../utils/findUser";
import { IProof } from "../proof/otherProof/proof.interface";
import ProofModel from "../proof/otherProof/proof.model";


const createCampaign = async (payload: ICampaign, user: IUser) => {
  const existingFounder = await findProfileByRole(user);

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

  await UserModel.findOneAndUpdate(
    { _id: user?.id },
    { $set: { verified: true } },
    { new: true }
  );

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
      totalPages: Math.ceil(total / limit),
    },
    data: campaigns,
  };
};

const getCampaignById = async (campaignId: string) => {
  const campaign = await Campaign.findById(campaignId)
    .populate({
      path: "founderId",
      select: "userId",
      populate: {
        path: "userId",
        select: "firstName lastName email",
      },
    })
    .populate("Proof");

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
    proofs: [],
  });

  await campaign.save();
  return campaign;
};

const requestToJoinCampaign = async (
  campaignId: string,
  user: IUser,
  payload: IProof
) => {
  // 1. Find influencer profile
  const existingInfluencer = await findProfileByRole(user);
  if (!existingInfluencer) {
    throw new AppError(status.BAD_REQUEST, "Influencer profile not found");
  }

  // 2. Find campaign
  const campaign = await Campaign.findById(campaignId);
  if (!campaign) {
    throw new AppError(status.NOT_FOUND, "Campaign not found");
  }

  // 3. Check for existing participation
  const alreadyParticipating = campaign.influencers.some(
    (inf) => inf.influencerId.toString() === existingInfluencer._id.toString()
  );
  if (alreadyParticipating) {
    throw new AppError(status.CONFLICT, "Already requested/joined this campaign");
  }

  // 4. Create proof
  const newProof = await ProofModel.create({
    ...payload,
    proofSubmittedBy: user?.id,
    campaignId: campaign._id,
    status: existingInfluencer.userId?.verified ? "approved" : "pending",
  });

  // 5. Add to campaign with proof reference
  campaign.influencers.push({
    influencerId: existingInfluencer._id,
    status: existingInfluencer.userId?.verified ? "approved" : "pending",
    proofs: [newProof._id], // Store reference to this proof
  });

  await campaign.save();
  
  // 6. Return populated data if needed
  return await Campaign.findById(campaign._id)
    .populate({
      path: "influencers.influencerId",
      select: "name socialMedia", // Customize fields as needed
    })
    .populate("influencers.proofs");
};

const updateInfluencerStatus = async (
  campaignId: string,
  influencerId: string,
  user: IUser
) => {
  // 1. Validate campaign exists
  const campaign = await Campaign.findById(campaignId).populate(
    "influencers.proofs"
  );
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

  // 3. Find the influencer in the campaign
  const influencerToUpdate = campaign.influencers.find(
    (inf) => inf.influencerId.toString() === influencerId.toString()
  );

  if (!influencerToUpdate) {
    throw new AppError(
      status.NOT_FOUND,
      "Influencer not found in this campaign"
    );
  }

  // 4. Update status to approved
  influencerToUpdate.status = "approved";

  // 5. Also mark the linked User as verified
  if (influencerToUpdate.status === "approved") {
    // Get the Influencer profile to access userId
    const influencerProfile = await Influencer.findById(influencerId);
    if (!influencerProfile) {
      throw new AppError(status.NOT_FOUND, "Influencer profile not found");
    }

    const updatedUser = await UserModel.findByIdAndUpdate(
      influencerProfile.userId, // Link to actual User _id
      { verified: true },
      { new: true }
    );
  }

  // 6. Save the campaign
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
