import { Types } from "mongoose";

export interface IPromotion {
  promotionName: string;
  influencerId: Types.ObjectId;
  founderId: Types.ObjectId;
  toolId: string;
  promotionalContentUrl: string;
  isPerformed: boolean;
  screenshotURL: string;
  isVerifiedByFounder: boolean;
  dealAmount: number;
  isPaid: boolean;
  isDeleted: boolean;
}