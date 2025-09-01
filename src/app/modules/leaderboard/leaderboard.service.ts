// import { Campaign } from "../campaign/campaign.model";
// import { ReviewModel } from "../global-review/global-review.model";
// import { Influencer } from "../influencer/influencer.model";

// const getLeaderboard = async () => {
//   const [mostActive, bestReviews, topInfluencers] = await Promise.all([
//     // 1. Most Active Influencers (by approved campaigns)
//     Campaign.aggregate([
//       { $unwind: "$influencers" },
//       { $match: { "influencers.status": "approved" } },
//       {
//         $group: {
//           _id: "$influencers.influencerId", // Influencer profile ID
//           campaignsJoined: { $sum: 1 },
//           lastCampaignDate: { $max: "$createdAt" },
//         },
//       },
//       { $sort: { campaignsJoined: -1, lastCampaignDate: -1 } },
//       { $limit: 10 },

//       // Step 1: Get Influencer profile
//       {
//         $lookup: {
//           from: "influencers",
//           localField: "_id",
//           foreignField: "_id",
//           as: "influencer",
//         },
//       },
//       { $unwind: "$influencer" },

//       // Step 2: Get linked User data from Influencer.userId
//       {
//         $lookup: {
//           from: "users",
//           localField: "influencer.userId",
//           foreignField: "_id",
//           as: "user",
//         },
//       },
//       { $unwind: "$user" },

//       // Step 3: Final projection
//       {
//         $project: {
//           influencerId: "$influencer._id",
//           campaignsJoined: 1,
//           reputationScore: "$influencer.reputation.score",
//           profileImage: { $ifNull: ["$influencer.profileImage", null] },
//           name: "$user.name",
//           email: "$user.email",
//           verified: "$user.verified",
//         },
//       },
//     ]),

//     // 2. Best Reviews (Editor's Pick)
//     ReviewModel.aggregate([
//       {
//         $match: {
//           entityType: "influencer",
//           bestReview: true,
//           status: "approved",
//         },
//       },
//       { $sort: { rating: -1, createdAt: -1 } },
//       { $limit: 5 },
//       {
//         $lookup: {
//           from: "influencers",
//           localField: "entityId",
//           foreignField: "_id",
//           as: "influencer",
//         },
//       },
//       { $unwind: "$influencer" },
//       {
//         $lookup: {
//           from: "users",
//           localField: "userId",
//           foreignField: "_id",
//           as: "reviewer",
//         },
//       },
//       { $unwind: "$reviewer" },
//       {
//         $project: {
//           _id: 1,
//           rating: 1,
//           reviewText: 1,
//           createdAt: 1,
//           influencer: {
//             influencerId: "$influencer.influencerId",
//             profileImage: { $ifNull: ["$influencer.profileImage", null] },
//           },
//           reviewer: {
//             name: {
//               $concat: ["$reviewer.firstName", " ", "$reviewer.lastName"],
//             },
//             profileImage: { $ifNull: ["$reviewer.profileImage", null] },
//           },
//         },
//       },
//     ]),

//     // 3. Top Influencers (by reputation score)
//     Influencer.aggregate([
//       { $sort: { "reputation.score": -1 } },
//       { $limit: 10 },
//       {
//         $project: {
//           influencerId: 1,
//           profileImage: 1,
//           reputation: 1,
//           campaignStats: { $size: "$affiliations" },
//           engagementRate: {
//             $cond: [
//               { $gt: ["$reputation.score", 0] },
//               { $multiply: ["$reputation.score", 0.8] }, // Example calculation
//               0,
//             ],
//           },
//         },
//       },
//     ]),
//   ]);

//   return {
//     mostActive,
//     bestReviews,
//     topInfluencers,
//     lastUpdated: new Date(),
//   };
// };

// export const LeaderboardService = {
//   getLeaderboard,
// };


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
          reputationScore: "$influencer.reputation.score",
          verified: "$user.verified",
          profileImage: { $ifNull: ["$influencer.profileImage", null] },
          name: "$user.name",
          email: "$user.email",
          lastCampaignDate: 1,
          badges: { $ifNull: ["$influencer.reputation.badges", []] },
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
      { $limit: 5 },
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

    // 3. Top Influencers (by reputation score)
    // We'll enhance this with reputation details
    Influencer.aggregate([
      { $sort: { "reputation.score": -1 } },
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
          engagementRate: {
            $cond: [
              { $gt: ["$reputation.score", 0] },
              { $multiply: ["$reputation.score", 0.8] },
              0,
            ],
          },
        },
      },
    ]),
  ]);

  // Enhance top influencers with reputation details
  const enhancedTopInfluencers = await Promise.all(
    topInfluencers.map(async (influencer) => {
      const reputationDetails = await InfluencerReputationService.getInfluencerReputationDetails(
        influencer._id
      );
      
      return {
        ...influencer,
        reputationDetails: {
          averageROI: reputationDetails.reputation.averageROI,
          onTimeDeliveryRate: reputationDetails.reputation.onTimeDeliveryRate,
          completedCampaigns: reputationDetails.reputation.completedCampaigns,
          lastCampaignDate: reputationDetails.performance.lastCampaignDate
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