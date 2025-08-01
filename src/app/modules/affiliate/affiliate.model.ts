import { Schema, model } from "mongoose";
import { IAffiliate } from "./affiliate.interface";

const affiliateSchema = new Schema<IAffiliate>(
  {
    influencerId: {
      type: String,
      required: true,
    },
    toolId: {
      type: String,
      required: true,
    },
    affiliateUrl: {
      type: String,
      required: true,
    },
    clicks: {
      type: Number,
      default: 0,
    },
    conversions: {
      type: Number,
      default: 0,
    },
    commissionRate: {
      type: Number,
      required: true,
    },
    earning: {
      type: Number,
      default: 0,
    },
    sourceClicks: { type: Map, of: Number, default: {} },
  },
  {
    timestamps: true,
  }
);

export const Affiliate = model<IAffiliate>("Affiliate", affiliateSchema);
