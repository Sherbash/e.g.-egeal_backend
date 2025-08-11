import { Schema, model, Types } from "mongoose";

// Interface for Social Link
interface ISocialLink {
  platform: string;
  url: string;
  icon?: string;
  clickCount?: number;
}

//  affiliateLinks: [
//       {
//         toolName: { type: String, required: true },
//         affiliateUrl: { type: String, required: true },
//         clickCount: { type: Number, default: 0 },
//       },
//     ],



// Interface for Gig Page
export interface IGigPage {
  username: string;
  title?: string;
  bio?: string;
  socialLinks: ISocialLink[];
  affiliates: Types.ObjectId[];
  promoInfo?: string;
  layoutTemplate?: number;
  profileImage?: string;
  bannerImage?: string;
  isPublished?: boolean;
  influencerId: Types.ObjectId; // Reference to parent Influencer
}

const gigPageSchema = new Schema<IGigPage>(
  {
    influencerId: {
      type: Schema.Types.ObjectId,
      ref: "Influencer",
      required: true,
    },
    username: { type: String, unique: true },
    title: String,
    bio: String,
    socialLinks: [
      {
        platform: { type: String, required: true },
        url: { type: String, required: true },
        icon: { type: String, default: "" },
        clickCount: { type: Number, default: 0 },
      },
    ],
    affiliates: [{ type: Schema.Types.ObjectId, ref: "Affiliate" }],
    promoInfo: String,
    layoutTemplate: { type: Number, default: 1 },
    profileImage: String,
    bannerImage: String,
    isPublished: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const GigPage = model<IGigPage>("GigPage", gigPageSchema);
