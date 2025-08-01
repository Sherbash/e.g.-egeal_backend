import { Types } from "mongoose";
import { Promotion } from "./promotion.model";
import { IPromotion } from "./promotion.interface";

const createPromotion = async (promotionData: IPromotion) => {
  const promotion = new Promotion(promotionData);
  return await promotion.save();
};

const getAllPromotions = async () => {
  return await Promotion.find({ isDeleted: false })
    .populate("influencerId")
    .populate("founderId");
};

const getPromotionById = async (id: string) => {
  if (!Types.ObjectId.isValid(id)) {
    throw new Error("Invalid promotion ID");
  }
  return await Promotion.findOne({ _id: id, isDeleted: false })
    .populate("influencerId")
    .populate("founderId");
};

const updatePromotion = async (id: string, updateData: Partial<IPromotion>) => {
  if (!Types.ObjectId.isValid(id)) {
    throw new Error("Invalid promotion ID");
  }
  return await Promotion.findOneAndUpdate(
    { _id: id, isDeleted: false },
    { $set: updateData },
    { new: true, runValidators: true }
  )
    .populate("influencerId")
    .populate("founderId");
};

const deletePromotion = async (id: string) => {
  if (!Types.ObjectId.isValid(id)) {
    throw new Error("Invalid promotion ID");
  }
  return await Promotion.findOneAndUpdate(
    { _id: id, isDeleted: false },
    { $set: { isDeleted: true } },
    { new: true }
  );
};

export const PromotionService = {
  createPromotion,
  getAllPromotions,
  getPromotionById,
  updatePromotion,
  deletePromotion,
};