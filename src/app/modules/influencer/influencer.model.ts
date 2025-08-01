import { Schema, model, Types } from "mongoose";
import { IInfluencer } from "./influencer.interface";

const influencerSchema = new Schema<IInfluencer>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    affiliations: [
      {
        type: String,
        ref: "Tool",
      },
    ],
    influencerId: { type: String, unique: true, required: true },
    additionalNotes: {
      type: String,
      default: "empty",
    },
  },
  { timestamps: true }
);

export const Influencer = model<IInfluencer>("Influencer", influencerSchema);
