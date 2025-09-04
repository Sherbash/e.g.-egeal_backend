import status from "http-status";
import catchAsync from "../../utils/catchAsync";
import { Request, Response } from "express";
import { AffiliateServices } from "./affiliate.service";
import sendResponse from "../../utils/sendResponse";
// import config from "../../config";

const createAffiliate = catchAsync(async (req: Request, res: Response) => {

  const result = await AffiliateServices.createAffiliateIntoDB(req.body,req.user);

  sendResponse(res, {
    success: true,
    statusCode: status.OK,
    message: "Affiliate url generated successfully",
    data: result,
  });
});

const incrementClickApi = catchAsync(async (req: Request, res: Response) => {
  const { influencerId, toolId, source } = req.body;
  if (!influencerId || !toolId) {
    return res
      .status(400)
      .json({ success: false, message: "Missing influencerId or toolId" });
  }
  const result = await AffiliateServices.incrementClickCount(
    influencerId,
    toolId,
    source
  );
  sendResponse(res, {
    success: true,
    statusCode: status.OK,
    message: "Click incremented",
    data: result,
  });
});

const getAffiliatesByInfluencerId = catchAsync(
  async (req: Request, res: Response) => {
    const { influencerId } = req.params;

    const result = await AffiliateServices.getAffiliatesByInfluencerId(
      influencerId
    );

    sendResponse(res, {
      success: true,
      statusCode: status.OK,
      message: "Affiliate data retrieved successfully",
      data: result,
    });
  }
);
const InfluencerTotalRoi= catchAsync(
  async (req: Request, res: Response) => {
    const { influencerId } = req.params;

    const result = await AffiliateServices.InfluencerTotalRoi(
      influencerId
    );

    sendResponse(res, {
      success: true,
      statusCode: status.OK,
      message: "Influencer roi retrieved successfully",
      data: result,
    });
  }
);



export const AffiliateControllers = {
  createAffiliate,
  // handleAffiliateUrl,
  incrementClickApi,
  getAffiliatesByInfluencerId,
  InfluencerTotalRoi
};
