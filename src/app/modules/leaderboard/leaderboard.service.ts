import { Campaign } from "../campaign/campaign.model";
import { ReviewModel } from "../global-review/global-review.model";
import { Influencer } from "../influencer/influencer.model";

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
          lastCampaignDate: { $max: "$createdAt" }
        }
      },
      { $sort: { campaignsJoined: -1, lastCampaignDate: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: "influencers",
          localField: "_id",
          foreignField: "_id",
          as: "influencer"
        }
      },
      { $unwind: "$influencer" },
      {
        $project: {
          influencerId: "$influencer.influencerId",
          campaignsJoined: 1,
          reputationScore: "$influencer.reputation.score",
          profileImage: { $ifNull: ["$influencer.profileImage", null] }
        }
      }
    ]),

    // 2. Best Reviews (Editor's Pick)
    ReviewModel.aggregate([
      { 
        $match: { 
          entityType: "influencer",
          bestReview: true,
          status: "approved"
        } 
      },
      { $sort: { rating: -1, createdAt: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: "influencers",
          localField: "entityId",
          foreignField: "_id",
          as: "influencer"
        }
      },
      { $unwind: "$influencer" },
      {
        $lookup: {
          from: "users",
          localField: "userId",
          foreignField: "_id",
          as: "reviewer"
        }
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
            profileImage: { $ifNull: ["$influencer.profileImage", null] }
          },
          reviewer: {
            name: { $concat: ["$reviewer.firstName", " ", "$reviewer.lastName"] },
            profileImage: { $ifNull: ["$reviewer.profileImage", null] }
          }
        }
      }
    ]),

    // 3. Top Influencers (by reputation score)
    Influencer.aggregate([
      { $sort: { "reputation.score": -1 } },
      { $limit: 10 },
      {
        $project: {
          influencerId: 1,
          profileImage: 1,
          reputation: 1,
          campaignStats: { $size: "$affiliations" },
          engagementRate: {
            $cond: [
              { $gt: ["$reputation.score", 0] },
              { $multiply: ["$reputation.score", 0.8] }, // Example calculation
              0
            ]
          }
        }
      }
    ])
  ]);

  return {
    mostActive,
    bestReviews,
    topInfluencers,
    lastUpdated: new Date()
  };
};

export const LeaderboardService = {
  getLeaderboard,
};