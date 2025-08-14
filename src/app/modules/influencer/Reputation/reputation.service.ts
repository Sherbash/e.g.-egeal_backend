import mongoose from "mongoose";
import { ReviewModel } from "../../global-review/global-review.model";
import { Campaign } from "../../campaign/campaign.model";
import { Influencer } from "../influencer.model";
import status from "http-status";
import AppError from "../../../errors/appError";

const calculateReputation = async (
  influencerId: string
): Promise<{ score: number; badges: string[] }> => {
  const influencerObjectId = new mongoose.Types.ObjectId(influencerId);

  // Get all relevant data in parallel
  const [reviews, activeCampaigns] = await Promise.all([
    // Approved reviews for this influencer
    ReviewModel.find({
      entityType: "influencer",
      entityId: influencerObjectId,
      status: "approved",
    }),

    // Campaigns where influencer is either pending or approved
    Campaign.find({
      "influencers.influencerId": influencerObjectId,
      "influencers.status": { $in: ["pending", "approved"] },
    }),
  ]);

  // Calculate review metrics (50% weight)
  const reviewCount = reviews.length;
  const averageRating =
    reviewCount > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviewCount
      : 0;
  const reviewScore = averageRating * 20; // Convert 5-star to 100 scale

  // Calculate campaign metrics (50% weight)
  const campaignCount = activeCampaigns.length;
  const campaignScore = Math.min(campaignCount * 5, 50); // Max 50 points for campaigns

  // Calculate composite score (0-100)
  const score = Math.min(100, Math.floor(reviewScore + campaignScore));

  // Determine badges
  const badges = [];
  if (score >= 80) badges.push("Elite");
  else if (score >= 65) badges.push("Trusted");
  else if (score >= 50) badges.push("Verified");

  return { score, badges };
};

const updateInfluencerReputation = async (influencerId: string) => {
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
