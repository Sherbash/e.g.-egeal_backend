import mongoose from "mongoose";
import { ReviewModel } from "../../global-review/global-review.model";
import { Campaign } from "../../campaign/campaign.model";
import { Influencer } from "../influencer.model";
import status from "http-status";
import AppError from "../../../errors/appError";

const calculateReputation = async (
  influencerId: string | mongoose.Types.ObjectId
): Promise<{ score: number; badges: string[] }> => {

  // console.log("influencerId", influencerId)
  const reviews = await ReviewModel.find({
    entityType: "influencer",
    entityId: influencerId,
    status: "approved",
  });
  // console.log("reviews 345", reviews)

  const reviewCount = reviews.length;

  if (reviewCount === 0) {
    return { score: 0, badges: [] };
  }

  const averageRating =
    reviews.reduce((sum, r) => sum + r.rating, 0) / reviewCount;

    // console.log("averageRating", averageRating)
  const score = Math.min(100, Math.floor(averageRating * 20));

  const badges: string[] = [];
  if (score >= 80) badges.push("Elite");
  else if (score >= 65) badges.push("Trusted");
  else if (score >= 50) badges.push("Verified");

  return { score, badges };
};

const updateInfluencerReputation = async (influencerId: string | mongoose.Types.ObjectId) => {
  // console.log("influencerId", influencerId)
  const { score, badges } = await calculateReputation(influencerId);

  const updatedInfluencer = await Influencer.findByIdAndUpdate(
    influencerId,
    {
      $set: {
        "reputation.score": score,
        "reputation.badges": badges,
        "reputation.lastUpdated": new Date(),
        "reputation.isVerified": score >= 60,
      },
    },
    { new: true }
  );

  if (!updatedInfluencer) {
    throw new AppError(status.NOT_FOUND, "Influencer not found");
  }

  return { score, badges };
};

const handleCampaignStatusChange = async (
  influencerId: string,
  campaignId: string
) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // 1. Find the campaign to check current status of this influencer
    const campaign = await Campaign.findOne(
      {
        _id: campaignId,
        "influencers.influencerId": new mongoose.Types.ObjectId(influencerId),
      },
      { "influencers.$": 1 } // Only return the matched influencer
    ).session(session);

    if (
      !campaign ||
      !campaign.influencers ||
      campaign.influencers.length === 0
    ) {
      throw new Error("Influencer not found in this campaign");
    }

    const currentStatus = campaign.influencers[0].status;

    // 2. Decide new status (toggle)
    const newStatus = currentStatus === "pending" ? "approved" : "pending";

    // 3. Update status in DB
    await Campaign.findOneAndUpdate(
      {
        _id: campaignId,
        "influencers.influencerId": new mongoose.Types.ObjectId(influencerId),
      },
      {
        $set: { "influencers.$.status": newStatus },
      },
      { session }
    );

    // 4. Update influencer reputation
    const result = await updateInfluencerReputation(influencerId);

    await session.commitTransaction();
    return { ...result, newStatus };
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};

const handleNewReview = async (review: any) => {
  if (review.entityType === "influencer") {
    return updateInfluencerReputation(review.entityId);
  }
  return null;
};

export const InfluencerReputationService = {
  calculateReputation,
  updateInfluencerReputation,
  handleCampaignStatusChange,
  handleNewReview,
};
