import { Request, Response } from "express";
import status from "http-status";
import catchAsync from "../../utils/catchAsync";
import { CampaignServices } from "./campaign.service";
import { IUser } from "../user/user.interface";
import pickOptions from "../../utils/pick";

const createCampaign = catchAsync(async (req: Request, res: Response) => {
  const result = await CampaignServices.createCampaign(
    req.body,
    req.user as IUser
  );

  res.status(status.CREATED).json({
    success: true,
    message: "Campaign created successfully",
    data: result,
  });
});

const getAllCampaigns = catchAsync(async (req: Request, res: Response) => {
  const options = pickOptions(req.query, [
    "limit",
    "page",
    "sortBy",
    "sortOrder",
  ]);
  const result = await CampaignServices.getAllCampaigns(options);

  res.status(status.OK).json({
    success: true,
    message: "Campaigns retrieved successfully",
    meta: result.meta,
    data: result.data,
  });
});

const getCampaignById = catchAsync(async (req: Request, res: Response) => {
  const campaign = await CampaignServices.getCampaignById(req.params.id);

  res.status(status.OK).json({
    success: true,
    message: "Campaign retrieved successfully",
    data: campaign,
  });
});

const updateCampaign = catchAsync(async (req: Request, res: Response) => {
  const result = await CampaignServices.updateCampaign(
    req.params.id,
    req.body,
    req.user as IUser
  );

  res.status(status.OK).json({
    success: true,
    message: "Campaign updated successfully",
    data: result,
  });
});

const deleteCampaign = catchAsync(async (req: Request, res: Response) => {
  const result = await CampaignServices.deleteCampaign(
    req.params.id,
    req.user as IUser
  );

  res.status(status.OK).json({
    success: true,
    message: result.message,
    data: null,
  });
});

const addInfluencer = catchAsync(async (req: Request, res: Response) => {
  const result = await CampaignServices.addInfluencerToCampaign(
    req.params.campaignId,
    req.body.influencerId,
    req.user as IUser
  );

  res.status(status.OK).json({
    success: true,
    message: "Influencer added to campaign successfully",
    data: result,
  });
});

const requestToJoinCampaign = catchAsync(
  async (req: Request, res: Response) => {
    const result = await CampaignServices.requestToJoinCampaign(req.params.campaignId, req.user as IUser);

    res.status(status.OK).json({
      success: true,
      message: "Request to join campaign sent successfully",
      data: result,
    });
  }
);

const updateInfluencerStatus = catchAsync(
  async (req: Request, res: Response) => {
    const result = await CampaignServices.updateInfluencerStatus(
      req.params.campaignId,
      req.params.influencerId,
      req.user as IUser
    );

    res.status(status.OK).json({
      success: true,
      message: "Influencer status updated successfully",
      data: result,
    });
  }
);

export const CampaignController = {
  createCampaign,
  getAllCampaigns,
  getCampaignById,
  updateCampaign,
  deleteCampaign,
  addInfluencer,
  updateInfluencerStatus,
  requestToJoinCampaign
};
