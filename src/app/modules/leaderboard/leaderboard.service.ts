import { Campaign } from "../campaign/campaign.model";
import { ReviewModel } from "../global-review/global-review.model";
import { Influencer } from "../influencer/influencer.model";
import { InfluencerReputationService } from "../influencer/Reputation/reputation.service";

const getLeaderboard = async () => {
  const [mostActive, bestReviews, topInfluencers] = await Promise.all([
    // 1. Most Active Influencers (by approved campaigns)
    Campaign.aggregate([
      { $unwind: "$influencers" },
      { $match: { "influencers.status": "approved" } },
      {
        $group: {
          _id: "$influencers.influencerId",
          campaignsJoined: { $sum: 1 },
          lastCampaignDate: { $max: "$createdAt" },
        },
      },
      { $sort: { campaignsJoined: -1, lastCampaignDate: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: "influencers",
          localField: "_id",
          foreignField: "_id",
          as: "influencer",
        },
      },
      { $unwind: "$influencer" },
      {
        $lookup: {
          from: "users",
          localField: "influencer.userId",
          foreignField: "_id",
          as: "user",
        },
      },
      { $unwind: "$user" },
      {
        $project: {
          influencerId: "$influencer._id",
          campaignsJoined: 1,
          trustScore: "$influencer.reputation.score", // Changed from reputationScore
          verified: "$user.verified",
          profileImage: { $ifNull: ["$influencer.profileImage", null] },
          name: "$user.name",
          email: "$user.email",
          lastCampaignDate: 1,
          // Removed badges field
        },
      },
    ]),

    // 2. Best Reviews (Editor's Pick)
    ReviewModel.aggregate([
      {
        $match: {
          entityType: "influencer",
          bestReview: true,
          status: "approved",
        },
      },
      { $sort: { rating: -1, createdAt: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: "influencers",
          localField: "entityId",
          foreignField: "_id",
          as: "influencer",
        },
      },
      { $unwind: "$influencer" },
      {
        $lookup: {
          from: "users",
          localField: "userId",
          foreignField: "_id",
          as: "reviewer",
        },
      },
      { $unwind: "$reviewer" },
      {
        $project: {
          _id: 1,
          rating: 1,
          reviewText: 1,
          createdAt: 1,
          influencer: {
            influencerId: "$influencer.influencerId",
            profileImage: { $ifNull: ["$influencer.profileImage", null] },
          },
          reviewer: {
            name: {
              $concat: ["$reviewer.firstName", " ", "$reviewer.lastName"],
            },
            profileImage: { $ifNull: ["$reviewer.profileImage", null] },
          },
        },
      },
    ]),

    // 3. Top Influencers (by trust score)
    Influencer.aggregate([
      { $sort: { "reputation.score": -1 } }, // Still sorting by score
      { $limit: 10 },
      {
        $lookup: {
          from: "users",
          localField: "userId",
          foreignField: "_id",
          as: "user",
        },
      },
      { $unwind: "$user" },
      {
        $project: {
          influencerId: 1,
          profileImage: 1,
          reputation: 1,
          verified: "$user.verified",
          name: "$user.name",
          // Removed engagementRate calculation since it was based on reputation
        },
      },
    ]),
  ]);

  // Enhance top influencers with trust score details
  const enhancedTopInfluencers = await Promise.all(
    topInfluencers.map(async (influencer) => {
      const trustScoreDetails = await InfluencerReputationService.getInfluencerTrustScoreDetails(
        influencer._id
      );
      
      return {
        ...influencer,
        trustScoreDetails: {
          totalReviews: trustScoreDetails.reviewStats.totalReviews,
          averageRating: trustScoreDetails.reviewStats.averageRating,
        }
      };
    })
  );

  return {
    mostActive,
    bestReviews,
    topInfluencers: enhancedTopInfluencers,
    lastUpdated: new Date(),
  };
};

export const LeaderboardService = {
  getLeaderboard,
};