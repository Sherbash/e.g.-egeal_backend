import mongoose, { Schema, model, Document, Types } from "mongoose";

export interface ICampaign extends Document {
  authorId: Types.ObjectId; // Who created the campaign
  toolId: string; // The tool being promoted
  campaignType: "JOB";
  influencers: {
    // Influencers participating
    influencerId: Types.ObjectId;
    status: "pending" | "approved" |  "rejected";
    proofs?: Types.ObjectId[];
  }[];
  campaignName: string; // Campaign name
  description: string; // Campaign details
  budget: number; // Total campaign budget
  startDate: Date; // When campaign goes live
  endDate?: Date; // Optional end date
  isActive: boolean; // Campaign status
  createdAt: Date;
  updatedAt: Date;
}

const CampaignSchema = new Schema<ICampaign>(
  {
    authorId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    toolId: {
      type: String,
      required: true,
    },
    campaignType: {
      type: String,
      enum: ["JOB"],
      default: "JOB",
    },
    influencers: [
      {
        influencerId: {
          type: Schema.Types.ObjectId,
          ref: "Influencer",
        },
        status: {
          type: String,
          enum: ["pending", "approved", "rejected"],
          default: "pending",
        },
        proofs: [{ type: Schema.Types.ObjectId, ref: "Proof" }],
      },
    ],
    campaignName: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    budget: {
      type: Number,
      required: true,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

export const Campaign = model<ICampaign>("Campaign", CampaignSchema);

const RejectProfSchema = new Schema(
  {
    proofId: {
      type: Schema.Types.ObjectId,
      ref: "Proof",
      required: true,
    },
    founderId: {
      type: Schema.Types.ObjectId,
      ref: "Founder",
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

export const rejectedProfModel=model("reject-prof",RejectProfSchema)

