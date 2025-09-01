import mongoose from "mongoose";
import { ReviewModel } from "../../global-review/global-review.model";
import { Campaign } from "../../campaign/campaign.model";
import { Influencer } from "../influencer.model";
import status from "http-status";
import AppError from "../../../errors/appError";


// const calculateReputation = async (
//   influencerId: string | mongoose.Types.ObjectId
// ): Promise<{ score: number; badges: string[] }> => {

//   // console.log("influencerId", influencerId)
//   const reviews = await ReviewModel.find({
//     entityType: "influencer",
//     entityId: influencerId,
//     status: "approved",
//   });
//   // console.log("reviews 345", reviews)

//   const reviewCount = reviews.length;

//   if (reviewCount === 0) {
//     return { score: 0, badges: [] };
//   }

//   const averageRating =
//     reviews.reduce((sum, r) => sum + r.rating, 0) / reviewCount;

//     // console.log("averageRating", averageRating)
//   const score = Math.min(100, Math.floor(averageRating * 20));

//   const badges: string[] = [];
//   if (score >= 80) badges.push("Elite");
//   else if (score >= 65) badges.push("Trusted");

//   return { score, badges };
// };

// const updateInfluencerReputation = async (influencerId: string | mongoose.Types.ObjectId) => {
//   // console.log("influencerId", influencerId)
//   const { score, badges } = await calculateReputation(influencerId);

//   const updatedInfluencer = await Influencer.findByIdAndUpdate(
//     influencerId,
//     {
//       $set: {
//         "reputation.score": score,
//         "reputation.badges": badges,
//         "reputation.lastUpdated": new Date(),
//       },
//     },
//     { new: true }
//   );

//   if (!updatedInfluencer) {
//     throw new AppError(status.NOT_FOUND, "Influencer not found");
//   }

//   return { score, badges };
// };

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

// Interface for ROI history entry
interface ROIHistoryEntry {
  campaignId: mongoose.Types.ObjectId;
  campaignName: string;
  roiPercentage: number;
  completionDate: Date;
  deliveredOnTime: boolean;
}

interface ReputationResult {
  score: number;
  badges: string[];
  roiHistory: ROIHistoryEntry[];
  averageROI: number;
  onTimeDeliveryRate: number;
  totalCampaigns: number;
  completedCampaigns: number;
  verified: boolean;
}

const calculateReputation = async (
  influencerId: string | mongoose.Types.ObjectId
): Promise<ReputationResult> => {
  // Get approved reviews
  const reviews = await ReviewModel.find({
    entityType: "influencer",
    entityId: influencerId,
    status: "approved",
  });

  // Get all campaigns for this influencer
  const allCampaigns = await Campaign.find({
    "influencers.influencerId": influencerId,
    "influencers.status": { $in: ["pending", "approved", "rejected"] }
  });

  // Since there's no "completed" status, we'll consider "approved" campaigns as completed
  // for reputation calculation purposes (assuming approved means they participated)
  const completedCampaigns = allCampaigns.filter(campaign => {
    const influencerData = campaign.influencers.find(
      (inf: any) => inf.influencerId.toString() === influencerId.toString()
    );
    return influencerData?.status === "approved";
  });

  const reviewCount = reviews.length;
  const totalCampaigns = allCampaigns.length;
  const completedCount = completedCampaigns.length;

  // Calculate average rating from reviews
  const averageRating = reviewCount > 0 
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviewCount 
    : 0;

  // Since we don't have actual ROI data in the model, we'll simulate it
  // In a real implementation, you'd want to add ROI tracking to your campaign model
  const roiHistory = completedCampaigns.map(campaign => {
    const influencerData = campaign.influencers.find(
      (inf: any) => inf.influencerId.toString() === influencerId.toString()
    );

    // Simulate ROI based on campaign factors
    // Better engagement = higher ROI simulation
    const engagementFactor = averageRating > 0 ? averageRating / 5 : 0.5;
    const baseROI = Math.random() * 150 * engagementFactor; // 0-150% simulated ROI
    const timeBonus = Math.random() > 0.3 ? 25 : 0; // 70% chance of on-time bonus
    const finalROI = Math.round(baseROI + timeBonus);

    // Simulate delivery timing (based on rating)
    const deliveryChance = 0.7 + (averageRating * 0.06); // 70-100% chance based on rating
    const deliveredOnTime = Math.random() < deliveryChance;

    return {
      campaignId: campaign._id,
      campaignName: campaign.campaignName,
      roiPercentage: finalROI,
      completionDate: campaign.updatedAt,
      deliveredOnTime
    };
  });

  // Calculate average ROI
  const averageROI = roiHistory.length > 0
    ? roiHistory.reduce((sum, entry) => sum + entry.roiPercentage, 0) / roiHistory.length
    : 0;

  // Calculate on-time delivery rate
  const onTimeDeliveries = roiHistory.filter(entry => entry.deliveredOnTime).length;
  const onTimeDeliveryRate = roiHistory.length > 0
    ? (onTimeDeliveries / roiHistory.length) * 100
    : 0;

  // Base score from reviews (0-100)
  let baseScore = Math.min(100, Math.floor(averageRating * 20));

  // Apply campaign participation bonus
  const campaignBonus = Math.min(20, completedCount * 4);
  baseScore += campaignBonus;

  // Apply ROI bonus (up to +15 points)
  const roiBonus = Math.min(15, Math.floor(averageROI / 6));
  baseScore += roiBonus;

  // Apply timing bonus (up to +10 points)
  const timingBonus = Math.min(10, Math.floor(onTimeDeliveryRate / 10));
  baseScore += timingBonus;

  // Ensure score doesn't exceed 100
  const finalScore = Math.min(100, baseScore);

  // Determine badges based ONLY on finalScore
  const badges: string[] = [];
  if (finalScore >= 90) badges.push("Elite");
  else if (finalScore >= 80) badges.push("Expert");
  else if (finalScore >= 70) badges.push("Professional");
  else if (finalScore >= 60) badges.push("Skilled");
  else if (finalScore >= 50) badges.push("Competent");
  else if (finalScore >= 40) badges.push("Beginner");
  // No badge for scores below 40

  // Get influencer to check verification status
  const influencer = await Influencer.findById(influencerId).populate("userId");
  const verified = influencer?.userId?.verified || false;

  return {
    score: finalScore,
    badges,
    roiHistory: roiHistory.slice(0, 5), // Keep last 5 entries for display
    averageROI,
    onTimeDeliveryRate,
    totalCampaigns,
    completedCampaigns: completedCount,
    verified
  };
};
const updateInfluencerReputation = async (influencerId: string | mongoose.Types.ObjectId) => {
  const reputationData = await calculateReputation(influencerId);

  // Store only essential data in the influencer model
  const updatedInfluencer = await Influencer.findByIdAndUpdate(
    influencerId,
    {
      $set: {
        "reputation.score": reputationData.score,
        "reputation.badges": reputationData.badges,
        "reputation.lastUpdated": new Date(),
      },
    },
    { new: true }
  );

  if (!updatedInfluencer) {
    throw new AppError(status.NOT_FOUND, "Influencer not found");
  }

  return {
    ...reputationData,
    // Return the stored data plus calculated metrics
    storedInDB: {
      score: reputationData.score,
      badges: reputationData.badges,
      lastUpdated: new Date()
    }
  };
};

// Helper function to get detailed reputation info for display
const getInfluencerReputationDetails = async (influencerId: string | mongoose.Types.ObjectId) => {
  const reputationData = await calculateReputation(influencerId);
  const influencer = await Influencer.findById(influencerId).populate("userId");
  
  return {
    influencerId,
    name: influencer?.userId?.firstName + " " + influencer?.userId?.lastName  || "Unknown",
    verified: influencer?.userId?.verified || false,
    reputation: {
      score: reputationData.score,
      badges: reputationData.badges,
      averageROI: reputationData.averageROI,
      onTimeDeliveryRate: reputationData.onTimeDeliveryRate,
      totalCampaigns: reputationData.totalCampaigns,
      completedCampaigns: reputationData.completedCampaigns,
      lastUpdated: new Date()
    },
    performance: {
      roiHistory: reputationData.roiHistory,
      lastCampaignDate: reputationData.roiHistory.length > 0 
        ? reputationData.roiHistory[reputationData.roiHistory.length - 1].completionDate 
        : null
    }
  };
};



// export const ReputationService = {
//   calculateReputation,
//   updateInfluencerReputation,
//   getInfluencerReputationDetails,
// };

export const InfluencerReputationService = {
  calculateReputation,
  updateInfluencerReputation,
  handleCampaignStatusChange,
  handleNewReview,
  getInfluencerReputationDetails
};
