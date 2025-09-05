import mongoose from "mongoose";
import { ReviewModel } from "../../global-review/global-review.model";
import { Campaign } from "../../campaign/campaign.model";
import { Influencer } from "../influencer.model";

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

interface TrustScoreResult {
  score: number;
  totalReviews: number;
  averageRating: number;
  verified: boolean;
}

const calculateReputation = async (
  influencerId: string | mongoose.Types.ObjectId
): Promise<TrustScoreResult> => {
  // Get approved reviews for this influencer
  const reviews = await ReviewModel.find({
    entityType: "influencer",
    entityId: influencerId,
    status: "approved",
  });

  // Calculate metrics from reviews
  const totalReviews = reviews.length;
  const averageRating =
    totalReviews > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews
      : 0;

  // Trust score will be only based on average rating (0-100)
  const trustScore = Math.min(100, Math.floor(averageRating * 20));

  // Get influencer to check verification status
  const influencer = (await Influencer.findById(influencerId).populate(
    "userId"
  )) as any;
  const verified = influencer?.userId?.verified || false;

  return {
    score: trustScore,
    totalReviews,
    averageRating,
    verified,
  };
};


const updateInfluencerReputation = async (influencerId: string | mongoose.Types.ObjectId) => {
  const trustScoreData = await calculateReputation(influencerId);

  // Update only the score in the influencer model
  const updatedInfluencer = await Influencer.findByIdAndUpdate(
    influencerId,
    {
      $set: {
        "reputation.score": trustScoreData.score,
        "reputation.lastUpdated": new Date(),
      },
    },
    { new: true }
  );

  if (!updatedInfluencer) {
    throw new Error("Influencer not found");
  }

  return trustScoreData;
};

const getInfluencerTrustScoreDetails = async (influencerId: string | mongoose.Types.ObjectId) => {
  const trustScoreData = await calculateReputation(influencerId);
  const influencer = await Influencer.findById(influencerId).populate("userId") as any;
  
  return {
    influencerId,
    name: influencer?.userId?.firstName + " " + influencer?.userId?.lastName  || "Unknown",
    verified: influencer?.userId?.verified || false,
    trustScore: trustScoreData.score,
    reviewStats: {
      totalReviews: trustScoreData.totalReviews,
      averageRating: trustScoreData.averageRating.toFixed(1),
    },
    lastUpdated: new Date()
  };
};

export const InfluencerReputationService = {
  calculateReputation,
  updateInfluencerReputation,
  getInfluencerTrustScoreDetails,
  handleNewReview,
  handleCampaignStatusChange
};
