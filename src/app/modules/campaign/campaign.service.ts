import status from "http-status";
import { Campaign, ICampaign, rejectedProfModel } from "./campaign.model";
import AppError from "../../errors/appError";
import { IUser } from "../user/user.interface";
import { IPaginationOptions } from "../../interface/pagination";
import { paginationHelper } from "../../utils/paginationHelpers";
import { Founder } from "../founder/founder.model";
import { ToolModel } from "../tool/tool.model";
import mongoose, { Types } from "mongoose";
import { Influencer } from "../influencer/influencer.model";
import UserModel from "../user/user.model";
import { findProfileByRole } from "../../utils/findUser";
import { IProof } from "../proof/otherProof/proof.interface";
import ProofModel from "../proof/otherProof/proof.model";
import { sendEmail } from "../../utils/emailHelper";

const createCampaign = async (payload: ICampaign, user: IUser) => {
  const authorId = user?.id;

  if (!authorId) {
    throw new AppError(status.BAD_REQUEST, "author not found");
  }

  const existingCampaign = await Campaign.findOne({
    authorId,
    toolId: payload?.toolId,
  });

  if (existingCampaign) {
    throw new AppError(
      status.BAD_REQUEST,
      "Campaign already exists for this tool"
    );
  }

  const isExistingTool = await ToolModel.findOne({
    toolId: payload?.toolId,
    isActive: true,
  });

  if (!isExistingTool) {
    throw new AppError(status.BAD_REQUEST, "Tool not found");
  }

  const campaignData = {
    ...payload,
    authorId,
    isActive: true,
  };

  const result = await Campaign.create(campaignData);

  await UserModel.findOneAndUpdate(
    { _id: user?.id },
    { $set: { verified: true } },
    { new: true }
  );

  if(result.createdAt){
    await sendEmail(
  user.email,
  "🚀 Campaign Created Successfully",
  `
    <div style="font-family: Arial, sans-serif; background-color: #f4f6f8; padding: 20px;">
      <div style="max-width: 600px; background-color: #ffffff; margin: auto; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
        <div style="background-color: #4CAF50; color: white; padding: 15px 20px; text-align: center;">
          <h1 style="margin: 0; font-size: 22px;">🚀 Campaign Created Successfully</h1>
        </div>
        <div style="padding: 20px;">
          <p style="font-size: 16px; color: #333;">
            Hello <strong>${user.firstName || "User"}</strong>,
          </p>
          <p style="font-size: 15px; color: #555;">
            Your campaign has been successfully created!  
            You can now manage and track its performance directly from your dashboard.
          </p>
          <div style="text-align: center; margin: 25px 0;">
            <a href="http://206.162.244.131:6001/dashboard/campaigns" style="background-color: #4CAF50; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold;">
              View Your Campaigns
            </a>
          </div>
          <p style="font-size: 14px; color: #888;">
            If you have any questions, feel free to reply to this email.  
          </p>
          <p style="font-size: 14px; color: #333; margin-top: 20px;">
            Best regards,  
            <br>
            <strong>Egeal AI Hub Team</strong>
          </p>
        </div>
      </div>
    </div>
  `
);

  }
  return result;
};

// const getAllCampaigns = async (paginationOptions: IPaginationOptions) => {
//   const { limit, page, skip, sortBy, sortOrder } =
//     paginationHelper.calculatePagination(paginationOptions);

//   const campaigns = await Campaign.find()
//     .populate(
//       "authorId",
//       "firstName lastName email role referralLink referralCode"
//     )
//     .populate({
//       path: "influencers",
//       populate: [
//         {
//           path: "influencerId",
//           select: "userId",
//           populate: {
//             path: "userId",
//             select: "firstName lastName email",
//           },
//         },
//         {
//           path: "proofs",
//           model: "Proof",
//         },
//       ],
//     })
//     .select("-password")
//     // .populate("influencers.userId", "firstName lastName email")
//     .sort({ [sortBy]: sortOrder })
//     .skip(skip)
//     .limit(limit);

//   const total = await Campaign.countDocuments();

//   return {
//     meta: {
//       page,
//       limit,
//       total,
//       totalPages: Math.ceil(total / limit),
//     },
//     data: campaigns,
//   };
// };

const getAllCampaigns = async (
  paginationOptions: IPaginationOptions,
  user: IUser
) => {
  const { limit, page, skip, sortBy, sortOrder } =
    paginationHelper.calculatePagination(paginationOptions);

  if (user?.role === "founder") {
  }
  // First get the campaigns with all other populated fields
  const campaigns = await Campaign.find()
    .populate(
      "authorId",
      "firstName lastName email role referralLink referralCode"
    )
    .populate({
      path: "influencers",
      populate: [
        {
          path: "influencerId",
          select: "userId",
          populate: {
            path: "userId",
            select: "firstName lastName email",
          },
        },
        {
          path: "proofs",
          model: "Proof",
        },
      ],
    })
    .select("-password")
    .sort({ [sortBy]: sortOrder })
    .skip(skip)
    .limit(limit)
    .lean(); // Convert to plain JS object

  // Get all unique toolIds from the campaigns
  const toolIds = [...new Set(campaigns.map((c) => c.toolId))];

  // Find all tools that match these toolIds
  const tools = await ToolModel.find({ toolId: { $in: toolIds } })
    .select(
      "_id name logo description price commissionRate toolId isActive launched imageUrl"
    )
    .lean();

  // Create a map for quick lookup: toolId -> tool document
  const toolMap = new Map(tools.map((tool) => [tool.toolId, tool]));

  // Combine the data
  const campaignsWithTools = campaigns.map((campaign) => ({
    ...campaign,
    tool: toolMap.get(campaign.toolId) || null, // Add the full tool document
  }));

  const total = await Campaign.countDocuments();

  return {
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
    data: campaignsWithTools,
  };
};


const getAllMyCampaigns = async (
  paginationOptions: IPaginationOptions,
toolId: string
) => {


  const campaigns = await Campaign.findOne({toolId:toolId}).populate({
      path: "influencers",
      populate: [
        {
          path: "influencerId",
          select: "userId",
          populate: {
            path: "userId",
            select: "firstName lastName email",
          },
        },
        {
          path: "proofs",
          model: "Proof",
        },
      ],
    })
  return campaigns
   
  }


const getCampaignById = async (campaignId: string) => {
  const campaign = await Campaign.findById(campaignId)
    .populate("authorId", "-password")
    .populate({
      path: "influencers",
      populate: [
        {
          path: "influencerId",
          select: "userId",
          populate: {
            path: "userId",
            select: "firstName lastName email",
          },
        },
        {
          path: "proofs",
          model: "Proof",
        },
      ],
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
    campaign.authorId.toString() !== user?.id.toString()
  ) {
    throw new AppError(
      status.FORBIDDEN,
      "Not authorized to update this campaign"
    );
  }

  // Prevent changing certain fields
  if (payload.authorId || payload.toolId) {
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
    campaign.authorId.toString() !== user._id.toString()
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
    campaign.authorId.toString() !== user?.id.toString()
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
    throw new AppError(
      status.CONFLICT,
      "Already requested/joined this campaign"
    );
  }

  // 4. Create proof
  const newProof = await ProofModel.create({
    ...payload,
    proofSubmittedBy: user?.id,
    campaignId: campaign._id,
    proofType: "campaign",
    status: existingInfluencer.userId?.verified ? "approved" : "pending",
  });

  // 5. Add to campaign with proof reference
  campaign.influencers.push({
    influencerId: existingInfluencer._id,
    status: existingInfluencer.userId?.verified ? "approved" : "pending",
    proofs: [newProof?._id], // Store reference to this proof
  });

  await campaign.save();
await sendEmail(
  user.email,
  "✅ Successfully Campaign Joined request send ",
  `
    <div style="font-family: Arial, sans-serif; background-color: #f4f6f8; padding: 20px;">
      <div style="max-width: 600px; background-color: #ffffff; margin: auto; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
        <div style="background-color: #3F51B5; color: white; padding: 15px 20px; text-align: center;">
          <h1 style="margin: 0; font-size: 22px;">✅ Successfully Joined Campaign</h1>
        </div>
        <div style="padding: 20px;">
          <p style="font-size: 16px; color: #333;">
            Hello <strong>${user.firstName || "User"}</strong>,
          </p>
          <p style="font-size: 15px; color: #555;">
            You have successfully send the request joined the campaign!  
            You can now track your progress and view campaign details from your dashboard.
          </p>
          <div style="text-align: center; margin: 25px 0;">
            <a href="${process.env.CLIENT_URL}/dashboard/influencer/promote-to-earn" style="background-color: #3F51B5; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold;">
              View Your Campaigns
            </a>
          </div>
          <p style="font-size: 14px; color: #888;">
            If you have any questions, feel free to reply to this email.  
          </p>
          <p style="font-size: 14px; color: #333; margin-top: 20px;">
            Best regards,  
            <br>
            <strong>Egeal AI Hub Team</strong>
          </p>
        </div>
      </div>
    </div>
  `
);

  // 6. Return populated data if needed
  return await Campaign.findById(campaign._id)
    .populate({
      path: "influencers.influencerId",
      select: "name socialMedia",
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
  // if (user.role !== "admin") {
  //   const founder = await UserModel.findById(user.id);
  //   if (!founder) {
  //     throw new AppError(status.FORBIDDEN, "Founder profile not found");
  //   }

  //   console.log(campaign.authorId.toString(), founder._id.toString());

  //   if (campaign.authorId.toString() !== founder._id.toString()) {
  //     throw new AppError(
  //       status.FORBIDDEN,
  //       "Not authorized to modify this campaign"
  //     );
  //   }
  // }

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

const proofRejectRequest = async (
  proofId: string,
  founderId: string,
  payload: { message: string }
) => {
  if (!proofId) {
    throw new Error("prof id is not found ");
  }
  if (!payload) {
    throw new Error("prof reject payload  is not found ");
  }

  const founder=await Founder.findOne({userId:founderId})
  const result = await rejectedProfModel.create({
    ...payload,
    proofId: new mongoose.Types.ObjectId(proofId),
    founderId: new mongoose.Types.ObjectId(founder?._id),
  });

  return result;
};

const getAllProofRejectRequests = async () => {
  const result = await rejectedProfModel
    .find()
    .populate("proofId")
    .populate("founderId")
    .exec();
  return result;
};

// Get Single Proof Reject Request by ID
const getSingleProofRejectRequest = async (id: string) => {
  if (!id) {
    throw new Error("Proof reject ID is required");
  }

  const result = await rejectedProfModel
    .findById(id)
    .populate("proofId")
    .populate("founderId")
    .exec();
  if (!result) {
    throw new Error("Proof reject request not found");
  }

  return result;
};

const updateProofRejectRequest = async (
  id: string,
  payload:{ status:"approved" | "rejected"}
) => {
  if (!id) {
    throw new Error("Proof reject ID is required");
  }

  // findById
  const result = await ProofModel.findById(id);
  if (!result) {
    throw new Error("Proof reject request not found");
  }



  if(!payload.status){
      throw new Error("status is required");
  }
  // যদি status দেওয়া থাকে, update করা হবে
  if (status) {
    result.status = payload.status; // schema তে status field থাকতে হবে
    await result.save();
  }

  await rejectedProfModel.findOneAndDelete({ proofId: id });

  return result;
};
const approveProofByCampaignAndTool = async (
  campaignId: string,
  proofId: string,
  updateStatus:string
) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // 1. Campaign find by campaignId + toolId
    const campaign = await Campaign.findOne({ _id: campaignId}).session(session);
    if (!campaign) throw new AppError(status.NOT_FOUND, "Campaign not found");
    console.log(updateStatus)

    const result=await ProofModel.findOneAndUpdate({_id:proofId,campaignId:campaignId},{$set:{status:updateStatus}})
    const result1=await ProofModel.findOne({_id:proofId,campaignId:campaignId})
    
    // 3. Save campaign and commit transaction
    await campaign.save({ session });
    await session.commitTransaction();

    return result1 // return updated proof
  } catch (err) {
    if (session.inTransaction()) await session.abortTransaction();
    throw err;
  } finally {
    session.endSession();
  }
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
  proofRejectRequest,
  getAllProofRejectRequests,
  getSingleProofRejectRequest,
  updateProofRejectRequest,
  getAllMyCampaigns,
  approveProofByCampaignAndTool
};
