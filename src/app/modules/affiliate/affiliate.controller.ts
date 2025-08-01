import status from "http-status";
import catchAsync from "../../utils/catchAsync";
import { Request, Response } from "express";
import { AffiliateServices } from "./affiliate.service";
import sendResponse from "../../utils/sendResponse";
// import config from "../../config";

const createAffiliate = catchAsync(async (req: Request, res: Response) => {
  const result = await AffiliateServices.createAffiliateIntoDB(req.body);

  sendResponse(res, {
    success: true,
    statusCode: status.OK,
    message: "Affiliate url generated successfully",
    data: result,
  });
});

// In affiliate.controller.ts
// const handleAffiliateUrl = catchAsync(async (req: Request, res: Response) => {
//   const { toolId } = req.params;
//   const { ref: influencerId } = req.query;

//   if (typeof influencerId !== "string") {
//     return res.redirect(`${config.client_url}/tool/${toolId}`);
//   }

//   await AffiliateServices.incrementClickCount(influencerId, toolId);

//   res.redirect(`${config.client_url}/tool/${toolId}`);
// });


const incrementClickApi = catchAsync(async (req: Request, res: Response) => {
  const { influencerId, toolId, source } = req.body;
  if (!influencerId || !toolId) {
    return res.status(400).json({ success: false, message: "Missing influencerId or toolId" });
  }
  const result = await AffiliateServices.incrementClickCount(influencerId, toolId, source);
  sendResponse(res, {
    success: true,
    statusCode: status.OK,
    message: "Click incremented",
    data: result,
  });
});


const getAffiliatesByInfluencerId = catchAsync(async (req: Request, res: Response) => {
  const { influencerId } = req.params;
  
  const result = await AffiliateServices.getAffiliatesByInfluencerId(influencerId);

  sendResponse(res, {
    success: true,
    statusCode: status.OK,
    message: "Affiliate data retrieved successfully",
    data: result,
  });
});


export const AffiliateControllers = {
  createAffiliate,
  // handleAffiliateUrl,
  incrementClickApi,
  getAffiliatesByInfluencerId
};
