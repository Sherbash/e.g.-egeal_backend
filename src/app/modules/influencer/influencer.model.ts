

import { Schema, model, Types } from "mongoose";
import { IInfluencer } from "./influencer.interface";

const influencerSchema = new Schema<IInfluencer>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    influencerId: { type: String, unique: true, required: true },
    // Embedded Gig Page
    gigPage: {
      type: Schema.Types.ObjectId,
      ref: "GigPage",
    },
    affiliations: [
      {
        type: String,
        ref: "Tool",
      },
    ],
    reputation: {
      score: {
        type: Number,
        default: 0,
        min: 0,
        max: 100,
      },
      isVerified: {
        type: Boolean,
        default: false,
      },
      lastUpdated: Date,
    },

    additionalNotes: {
      type: String,
      default: "empty",
    },
    // ✅ Optional Bank Details
    bankDetails: {
      bankName: { type: String },
      accountNumber: { type: String },
      accountHolderName: { type: String },
      routingNumber: { type: String },
      paypalEmail: { type: String },
      cryptoAddress: { type: String },
      cryptoNetwork: { type: String },
    },
  },
  { timestamps: true }
);

export const Influencer = model<IInfluencer>("Influencer", influencerSchema);
