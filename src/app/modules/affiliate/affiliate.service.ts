import AppError from "../../errors/appError";
import status from "http-status";
import { ToolModel } from "../tool/tool.model";
import { IAffiliate } from "./affiliate.interface";
import config from "../../config";
import { Affiliate } from "./affiliate.model";
import { Influencer } from "../influencer/influencer.model";
import mongoose from "mongoose";

// const createAffiliateIntoDB = async (payload: IAffiliate) => {
//   const tool = await ToolModel.findOne({ toolId: payload.toolId });

//   if (!tool || !tool.isActive) {
//     throw new AppError(status.BAD_REQUEST, "Tool not found or inactive");
//   }

//   const commissionRate = tool.commissionRate;
//   if (commissionRate == null) {
//     throw new AppError(
//       status.BAD_REQUEST,
//       "Tool does not have a commission rate defined"
//     );
//   }

//   if (!payload.influencerId || !payload.toolId) {
//     throw new AppError(
//       status.BAD_REQUEST,
//       "Influencer ID and Tool ID are required"
//     );
//   }

//   const affiliateUrl = `${config.backend_url}/affiliates/tool/${payload.toolId}?ref=${payload.influencerId}`;

//   const affiliateData = {
//     influencerId: payload.influencerId,
//     toolId: payload.toolId,
//     affiliateUrl,
//     commissionRate,
//     clicks: payload.clicks,
//     conversions: payload.conversions,
//     earning: payload.earning,
//   };

//   const existingAffiliate = await Affiliate.findOne({
//     influencerId: affiliateData.influencerId,
//     toolId: affiliateData.toolId,
//   });

//   if (existingAffiliate) {
//     throw new AppError(
//       status.BAD_REQUEST,
//       "Affiliate link already generated for this influencer and tool"
//     );
//   }

//   const createdAffiliate = await Affiliate.create(affiliateData);
//   return createdAffiliate;
// };



const createAffiliateIntoDB = async (payload: IAffiliate) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // 1. Check the tool exists and is active
    const tool = await ToolModel.findOne({ toolId: payload.toolId }).session(session);
    if (!tool || !tool.isActive) {
      throw new AppError(status.BAD_REQUEST, "Tool not found or inactive");
    }

    // 2. Validate commission rate
    if (tool.commissionRate == null) {
      throw new AppError(
        status.BAD_REQUEST,
        "Tool does not have a commission rate defined"
      );
    }

    // 3. Validate required fields
    if (!payload.influencerId || !payload.toolId) {
      throw new AppError(
        status.BAD_REQUEST,
        "Influencer ID and Tool ID are required"
      );
    }

    // 4. Check if affiliate already exists
    const existingAffiliate = await Affiliate.findOne({
      influencerId: payload.influencerId,
      toolId: payload.toolId,
    }).session(session);

    if (existingAffiliate) {
      throw new AppError(
        status.BAD_REQUEST,
        "Affiliate link already generated for this influencer and tool"
      );
    }

    // 5. Create affiliate URL
    const affiliateUrl = `${config.client_url}/tool/${payload.toolId}?ref=${payload.influencerId}`;

    // 6. Prepare affiliate data
    const affiliateData = {
      influencerId: payload.influencerId,
      toolId: payload.toolId,
      affiliateUrl,
      commissionRate: tool.commissionRate,
      clicks: payload.clicks || 0,
      conversions: payload.conversions || 0,
      earning: payload.earning || 0,
    };

    // 7. Create affiliate and update influencer in a transaction
    const createdAffiliate = await Affiliate.create([affiliateData], { session });
    
    await Influencer.findOneAndUpdate(
      { influencerId: payload.influencerId },
      { $addToSet: { affiliations: payload.toolId } },
      { session, new: true }
    );

    await session.commitTransaction();
    return createdAffiliate[0];
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};


const incrementClickCount = async (
  influencerId: string,
  toolId: string,
  source?: string
) => {
  const update: any = { $inc: { clicks: 1 } };

  if (source) {
    update.$inc[`sourceClicks.${source}`] = 1;
  }

  const affiliate = await Affiliate.findOneAndUpdate(
    { influencerId, toolId },
    update,
    { new: true }
  );

  if (!affiliate) {
    throw new AppError(
      status.NOT_FOUND,
      "Affiliate link not found for this influencer and tool"
    );
  }

  return affiliate;
};


const getAffiliatesByInfluencerId = async (influencerId: string) => {
  if (!influencerId) {
    throw new AppError(status.BAD_REQUEST, "Influencer ID is required");
  }

  // 1. Get all affiliates for this influencer
  const affiliates = await Affiliate.find({ influencerId }).lean();

  if (affiliates.length === 0) {
    return {
      affiliates: [],
      totals: {
        totalClicks: 0,
        totalConversions: 0,
        totalEarnings: 0
      }
    };
  }

  // 2. Get all unique toolIds from affiliates
  const toolIds = [...new Set(affiliates.map(a => a.toolId))];

  // 3. Get tool details in one query
  const tools = await ToolModel.find({ toolId: { $in: toolIds } })
    .select('toolId name description price isActive')
    .lean();

  // 4. Create a tool map for quick lookup
  const toolMap = new Map(tools.map(tool => [tool.toolId, tool]));

  // 5. Enrich affiliates with tool data
  const enrichedAffiliates = affiliates.map(affiliate => ({
    ...affiliate,
    tool: toolMap.get(affiliate.toolId) || null
  }));

  // 6. Calculate totals
  const totals = enrichedAffiliates.reduce((acc, affiliate) => ({
    totalClicks: acc.totalClicks + (affiliate.clicks || 0),
    totalConversions: acc.totalConversions + (affiliate.conversions || 0),
    totalEarnings: acc.totalEarnings + (affiliate.earning || 0)
  }), { totalClicks: 0, totalConversions: 0, totalEarnings: 0 });

  return {
    affiliates: enrichedAffiliates,
    totals
  };
};

// const getAffiliatesByInfluencerId = async (influencerId: string) => {
//   if (!influencerId) {
//     throw new AppError(status.BAD_REQUEST, "Influencer ID is required");
//   }

//   // 1. Get all affiliates for this influencer
//   const affiliates = await Affiliate.find({ influencerId }).lean();

//   if (affiliates.length === 0) {
//     return {
//       affiliates: [],
//       totals: {
//         totalClicks: 0,
//         totalConversions: 0,
//         totalEarnings: 0
//       }
//     };
//   }

//   // 2. Get all unique toolIds from affiliates
//   const toolIds = [...new Set(affiliates.map(a => a.toolId))];

//   // 3. Get tool details in one query
//   const tools = await ToolModel.find({ toolId: { $in: toolIds } })
//     .select('toolId name description price isActive imageUrl commissionRate') // Added imageUrl and commissionRate
//     .lean();

//   // 4. Create a tool map for quick lookup
//   const toolMap = new Map(tools.map(tool => [tool.toolId, {
//     name: tool.name,
//     description: tool.description,
//     price: tool.price,
//     isActive: tool.isActive,
//     imageUrl: tool.imageUrl,
//     commissionRate: tool.commissionRate
//   }]));

//   // 5. Enrich affiliates with tool data
//   const enrichedAffiliates = affiliates.map(affiliate => {
//     const toolData = toolMap.get(affiliate.toolId);
//     return {
//       ...affiliate,
//       tool: toolData || null
//     };
//   });

//   // 6. Calculate totals
//   const totals = enrichedAffiliates.reduce((acc, affiliate) => ({
//     totalClicks: acc.totalClicks + (affiliate.clicks || 0),
//     totalConversions: acc.totalConversions + (affiliate.conversions || 0),
//     totalEarnings: acc.totalEarnings + (affiliate.earning || 0)
//   }), { totalClicks: 0, totalConversions: 0, totalEarnings: 0 });

//   return {
//     affiliates: enrichedAffiliates,
//     totals
//   };
// };

export const AffiliateServices = {
  createAffiliateIntoDB,
  incrementClickCount,
  getAffiliatesByInfluencerId
};
