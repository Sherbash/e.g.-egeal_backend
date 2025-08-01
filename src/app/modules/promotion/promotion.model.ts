import { Schema, model, Types } from "mongoose";
import { IPromotion } from "./promotion.interface";

const promotionSchema = new Schema<IPromotion>(
  {
    promotionName: { 
      type: String, 
      required: true 
    },
    influencerId: { 
      type: Schema.Types.ObjectId, 
      ref: "Influencer", 
      required: true 
    },
    founderId: { 
      type: Schema.Types.ObjectId, 
      ref: "Founder", 
      required: true 
    },
    toolId: { 
      type: String, 
      required: true 
    },
    promotionalContentUrl: { 
      type: String, 
      required: true 
    },
    isPerformed: { 
      type: Boolean, 
      default: false 
    },
    screenshotURL: { 
      type: String 
    },
    isVerifiedByFounder: { 
      type: Boolean, 
      default: false 
    },
    dealAmount: { 
      type: Number, 
      required: true 
    },
    isPaid: { 
      type: Boolean, 
      default: false 
    },
    isDeleted: { 
      type: Boolean, 
      default: false 
    }
  },
  { 
    timestamps: true  // Adds createdAt and updatedAt automatically
  }
);

export const Promotion = model<IPromotion>("Promotion", promotionSchema);