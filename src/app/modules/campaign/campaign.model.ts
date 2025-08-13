import { Schema, model, Document, Types } from "mongoose";

export interface ICampaign extends Document {
  founderId: Types.ObjectId;        // Who created the campaign
  toolId: Types.ObjectId;           // The tool being promoted
  influencers: {                    // Influencers participating
    userId: Types.ObjectId;
    status: "pending" | "approved" | "completed" | "rejected";
  }[];
  campaignName: string;             // Campaign name
  description: string;              // Campaign details
  budget: number;                   // Total campaign budget
  startDate: Date;                  // When campaign goes live
  endDate?: Date;                   // Optional end date
  isActive: boolean;                // Campaign status
  createdAt: Date;
  updatedAt: Date;
}

const CampaignSchema = new Schema<ICampaign>(
  {
    founderId: { 
      type: Schema.Types.ObjectId, 
      ref: "User", 
      required: true 
    },
    toolId: {
      type: Schema.Types.ObjectId,
      ref: "Tool",
      required: true
    },

    influencers: [{
      userId: { 
        type: Schema.Types.ObjectId, 
        ref: "User"
      },
      status: { 
        type: String, 
        enum: ["pending", "approved", "completed", "rejected"],
        default: "pending"
      }
    }],
    campaignName: {
      type: String,
      required: true
    },
    description: { 
      type: String, 
      required: true
    },
    budget: { 
      type: Number, 
      required: true,
      default: 0
    },
    isActive: { 
      type: Boolean, 
      default: true 
    }
  },
  { timestamps: true }
);

export const Campaign = model<ICampaign>("Campaign", CampaignSchema);