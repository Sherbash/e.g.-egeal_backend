import { Schema, model, Document, Types } from "mongoose";

export enum CampaignType {
  EMAIL = "EMAIL",
  SOCIAL = "SOCIAL",
  AFFILIATE = "AFFILIATE",
  FUNNEL = "FUNNEL",
  GIVEAWAY = "GIVEAWAY",
  JOB = "JOB",
}

export interface ICampaign extends Document {
  founderId: Types.ObjectId;
  influencers: Types.ObjectId[];
  name: string;
  description?: string;
  type: CampaignType;
  startDate: Date;
  endDate?: Date;
  isActive: boolean;
  tools: Types.ObjectId[];
  createdBy: Types.ObjectId;
  updatedBy?: Types.ObjectId;
  bonusThreshold?: number;
  bonusGift?: Types.ObjectId;
  testimonials: Types.ObjectId[];
}
const CampaignSchema = new Schema(
  {
    founderId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    influencers: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
        status: {
          type: String,
          enum: ["joined", "completed", "rejected"],
          default: "joined",
        },
      },
    ],
    name: { type: String, required: true },
    description: { type: String },
    type: { type: String, enum: Object.values(CampaignType), required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date },
    isActive: { type: Boolean, default: true },
    products: [{ type: Schema.Types.ObjectId, ref: "Product" }],
    tools: [{ type: Schema.Types.ObjectId, ref: "Tool" }],
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    updatedBy: { type: Schema.Types.ObjectId, ref: "User" },
    bonusThreshold: { type: Number, default: 0 },
    bonusGift: { type: Schema.Types.ObjectId, ref: "Gift" },
    testimonials: [{ type: Schema.Types.ObjectId, ref: "AllReview" }],
  },
  { timestamps: true }
);

export const Campaign = model<ICampaign>("Campaign", CampaignSchema);
