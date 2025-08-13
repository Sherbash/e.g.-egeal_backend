// reputation

import mongoose from "mongoose";
import { ReviewModel } from "../../global-review/global-review.model";
import { Campaign } from "../../campaign/campaign.model";
import { Influencer } from "../influencer.model";

const ReputationService = {
  async calculateScore(influencerId: string): Promise<number> {
    // Convert to ObjectId
    const influencerObjectId = new mongoose.Types.ObjectId(influencerId);

    // Get all relevant data in one query
    const [reviews, campaigns] = await Promise.all([
      ReviewModel.find({
        entityType: "influencer",
        entityId: influencerObjectId,
        // status: "approved",
      }),
      Campaign.find({
        influencers: influencerObjectId,
      }),
    ]);

    // Calculate basic metrics
    const reviewCount = reviews.length;
    const averageRating =
      reviewCount > 0
        ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviewCount
        : 0;

    // Since influencers are stored as ObjectId references in Campaign,
    // we just need to count campaigns where the influencer is present
    const totalCampaigns = campaigns.length;

    // For completion rate, we'd need to know which campaigns were completed
    // This would require either:
    // 1. Adding status to Campaign model, or
    // 2. Using another field to track completion
    // For now, we'll assume all campaigns joined are completed
    const completionRate = totalCampaigns > 0 ? 100 : 0;

    // Simple dynamic score formula
    const score = Math.min(
      100,
      Math.floor(
        averageRating * 20 + // 50% weight (converts 5-star to 100 scale)
          completionRate * 0.5 // 50% weight
      )
    );

    return score;
  },

  async updateInfluencerReputation(influencerId: string) {
    console.log("influencerId", influencerId)
    const score = await this.calculateScore(influencerId);
    const badges = this.determineBadges(score);

    await Influencer.findByIdAndUpdate(influencerId, {
      $set: {
        "reputation.score": score,
        "reputation.badges": badges,
        "reputation.lastUpdated": new Date(),
        "reputation.isVerified": score >= 60, // Auto-verify at 60+ score
      },
    });

    return { score, badges };
  },

  determineBadges(score: number): string[] {
    const badges = [];
    if (score >= 80) badges.push("Elite");
    if (score >= 65) badges.push("Trusted");
    if (score >= 50) badges.push("Verified");
    return badges;
  },

  // New method to update reputation when campaign status changes
  async handleCampaignParticipation(influencerId: string, campaignId: string) {
    // You would call this when an influencer joins/completes a campaign
    return this.updateInfluencerReputation(influencerId);
  },

  // New method to update reputation when review is added
  async handleNewReview(review: any) {
    if (review.entityType === "influencer") {
      return this.updateInfluencerReputation(review.entityId);
    }
  },
};

const addInfluencerToCampaign = async (
  campaignId: string,
  influencerId: string
) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Add to campaign
    await Campaign.findByIdAndUpdate(
      campaignId,
      { $addToSet: { influencers: influencerId } },
      { session }
    );

    // Update reputation
    await ReputationService.handleCampaignParticipation(
      influencerId,
      campaignId
    );

    await session.commitTransaction();
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};

export const InfluencerReputationService = {
  addInfluencerToCampaign,
  ReputationService,
};
