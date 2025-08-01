import { Request, Response } from "express";
import status from "http-status";
import catchAsync from "../../utils/catchAsync";
import { GiveawayServices } from "./giveaway.service";
import { Founder } from "../founder/founder.model";
import { IUser } from "../user/user.interface";

const createGiveaway = catchAsync(async (req: Request, res: Response) => {
  const giveawayData = req.body;

  const result = await GiveawayServices.createGiveaway(giveawayData,req.user as IUser);
  
  res.status(status.CREATED).json({
    success: true,
    message: "Giveaway created successfully",
    data: result,
  });
});

const getAllGiveaways = catchAsync(async (req: Request, res: Response) => {
  const giveaways = await GiveawayServices.getAllGiveaways();
  
  res.status(status.OK).json({
    success: true,
    message: "All giveaways retrieved successfully",
    data: giveaways,
  });
});

const getGiveawayById = catchAsync(async (req: Request, res: Response) => {
  const { giveawayId } = req.params;
  const giveaway = await GiveawayServices.getGiveawayById(giveawayId);
  
  res.status(status.OK).json({
    success: true,
    message: "Giveaway retrieved successfully",
    data: giveaway,
  });
});

const updateGiveaway = catchAsync(async (req: Request, res: Response) => {
  const { giveawayId } = req.params;
  const updateData = req.body;
  
  const result = await GiveawayServices.updateGiveaway(
    giveawayId, 
    updateData,
    req.user as IUser
  );
  
  res.status(status.OK).json({
    success: true,
    message: "Giveaway updated successfully",
    data: result,
  });
});

const cancelGiveaway = catchAsync(async (req: Request, res: Response) => {
  const { giveawayId } = req.params;
  
  const result = await GiveawayServices.cancelGiveaway(
    giveawayId,
    req.user.id
  );
  
  res.status(status.OK).json({
    success: true,
    message: "Giveaway cancelled successfully",
    data: result,
  });
});

const getGiveawayStats = catchAsync(async (req: Request, res: Response) => {

  const stats = await GiveawayServices.getGiveawayStats();
  
  res.status(status.OK).json({
    success: true,
    message: "Giveaway statistics retrieved successfully",
    data: stats,
  });
});

const getCurrentGiveaways = catchAsync(async (req: Request, res: Response) => {
  const giveaways = await GiveawayServices.getCurrentGiveaways();

  res.status(status.OK).json({
    success: true,
    message: "Current giveaways retrieved successfully",
    data: giveaways,
  });
});

const getAllOngoingGiveaways = catchAsync(async (req: Request, res: Response) => {
  const giveaways = await GiveawayServices.getAllOngoingGiveaways();

  res.status(status.OK).json({
    success: true,
    message: "Ongoing giveaway IDs retrieved successfully",
    data: giveaways,
  });
});

export const GiveawayController = {
  createGiveaway,
  updateGiveaway,
  cancelGiveaway,
  getAllGiveaways,
  getGiveawayById,
  getGiveawayStats,
  getCurrentGiveaways,
  getAllOngoingGiveaways
};