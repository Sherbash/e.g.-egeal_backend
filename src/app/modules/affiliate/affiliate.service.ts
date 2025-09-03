import AppError from "../../errors/appError";
import status from "http-status";
import { ToolModel } from "../tool/tool.model";
import { IAffiliate } from "./affiliate.interface";
import config from "../../config";
import { Affiliate } from "./affiliate.model";
import { Influencer } from "../influencer/influencer.model";
import mongoose from "mongoose";
import { IUser } from "../user/user.interface";
import { sendEmail } from "../../utils/emailHelper";

const createAffiliateIntoDB = async (payload: IAffiliate,user:any) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  console.log(user)
  try {
    // 1. Check the tool exists and is active
    const tool = await ToolModel.findOne({ toolId: payload.toolId }).session(
      session
    );
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
    const affiliateUrl = `${config.client_url}/tool/${payload.toolId}?ref=${payload.influencerId}&id=${tool?._id}`;

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
    const createdAffiliate = await Affiliate.create([affiliateData], {
      session,
    });

    await Influencer.findOneAndUpdate(
      { influencerId: payload.influencerId },
      { $addToSet: { affiliations: payload.toolId } },
      { session, new: true }
    );

    if(createdAffiliate.length){

      await sendEmail(
  user.email,
  "🔗 Affiliate Link Generated Successfully",
  `
    <div style="font-family: Arial, sans-serif; background-color: #f4f6f8; padding: 20px;">
      <div style="max-width: 600px; background-color: #ffffff; margin: auto; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
        <div style="background-color: #673AB7; color: white; padding: 15px 20px; text-align: center;">
          <h1 style="margin: 0; font-size: 22px;">🔗 Affiliate Link Generated</h1>
        </div>
        <div style="padding: 20px;">
          <p style="font-size: 16px; color: #333;">
            Hello <strong>${user.firstName || "User"}</strong>,
          </p>
          <p style="font-size: 15px; color: #555;">
            Your affiliate link has been successfully generated!  
            You can now share it with others to earn rewards and commissions.
          </p>
          <div style="text-align: center; margin: 25px 0;">
            <a href="http://172.252.13.69:3002/dashboard/influencer/explore-tools" style="background-color: #673AB7; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold;">
              View Affiliate Dashboard
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

  // 1. Get influencer & populate user details
  const influencer = await Influencer.findOne({ influencerId })
    .populate<{ userId: IUser }>("userId", "firstName lastName email")
    .lean();

  if (!influencer) {
    throw new AppError(status.NOT_FOUND, "Influencer not found");
  }

  const userData = influencer.userId as IUser;

  // 2. Get all affiliates for this influencer
  const affiliates = await Affiliate.find({ influencerId }).lean();

  if (affiliates.length === 0) {
    return {
      influencer: {
        name: `${userData.firstName} ${userData.lastName}`,
        email: userData.email,
      },
      affiliates: [],
      totals: { totalClicks: 0, totalConversions: 0, totalEarnings: 0 },
    };
  }

  // 3. Get unique tool IDs
  const toolIds = [...new Set(affiliates.map((a) => a.toolId))];

  // 4. Fetch tool details
  const tools = await ToolModel.find({ toolId: { $in: toolIds } })
    .select("toolId name description price isActive")
    .lean();

  const toolMap = new Map(tools.map((tool) => [tool.toolId, tool]));

  // 5. Enrich affiliates with tool data
  const enrichedAffiliates = affiliates.map((a) => ({
    ...a,
    tool: toolMap.get(a.toolId) || null,
  }));

  // 6. Calculate totals
  const totals = enrichedAffiliates.reduce(
    (acc, a) => ({
      totalClicks: acc.totalClicks + (a.clicks || 0),
      totalConversions: acc.totalConversions + (a.conversions || 0),
      totalEarnings: acc.totalEarnings + (a.earning || 0),
    }),
    { totalClicks: 0, totalConversions: 0, totalEarnings: 0 }
  );

  // 7. Return result
  return {
    influencer: {
      name: `${userData.firstName} ${userData.lastName}`,
      email: userData.email,
    },
    affiliates: enrichedAffiliates,
    totals,
  };
};

export const AffiliateServices = {
  createAffiliateIntoDB,
  incrementClickCount,
  getAffiliatesByInfluencerId,
};
