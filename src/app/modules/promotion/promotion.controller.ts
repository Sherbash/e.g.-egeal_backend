import { Request, Response } from "express";
import { PromotionService } from "./promotion.service";
import { IPromotion } from "./promotion.interface";
import catchAsync from "../../utils/catchAsync";

const createPromotion = catchAsync(async (req: Request, res: Response) => {
  const promotionData: IPromotion = req.body;
  const promotion = await PromotionService.createPromotion(promotionData);
  res.status(201).json({
    success: true,
    data: promotion,
    message: "Promotion created successfully",
  });
});

const getAllPromotions = catchAsync(async (req: Request, res: Response) => {
  const promotions = await PromotionService.getAllPromotions();
  res.status(200).json({
    success: true,
    data: promotions,
    message: "Promotions retrieved successfully",
  });
});

const getPromotionById = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const promotion = await PromotionService.getPromotionById(id);
  if (!promotion) {
    return res.status(404).json({
      success: false,
      message: "Promotion not found",
    });
  }
  res.status(200).json({
    success: true,
    data: promotion,
    message: "Promotion retrieved successfully",
  });
});

const updatePromotion = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const updateData: Partial<IPromotion> = req.body;
  const promotion = await PromotionService.updatePromotion(id, updateData);
  if (!promotion) {
    return res.status(404).json({
      success: false,
      message: "Promotion not found",
    });
  }
  res.status(200).json({
    success: true,
    data: promotion,
    message: "Promotion updated successfully",
  });
});

const deletePromotion = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const promotion = await PromotionService.deletePromotion(id);
  if (!promotion) {
    return res.status(404).json({
      success: false,
      message: "Promotion not found",
    });
  }
  res.status(200).json({
    success: true,
    message: "Promotion deleted successfully",
  });
});

export const PromotionController = {
  createPromotion,
  getAllPromotions,
  getPromotionById,
  updatePromotion,
  deletePromotion,
};