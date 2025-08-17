import { Types } from "mongoose";
// Interface for Social Link in Gig Page
interface ISocialLink {
  platform: string;
  url: string;
}

// Interface for Gig Page
interface IGigPage {
  username?: string; // optional because it's unique and might be set later
  title?: string;
  bio?: string;
  socialLinks: ISocialLink[];
  promoInfo?: string;
  layoutTemplate?: number;
  profileImage?: string;
  bannerImage?: string;
  isPublished?: boolean;
}

// Interface for Bank Details
interface IBankDetails {
  bankName?: string;
  accountNumber?: string;
  accountHolderName?: string;
  routingNumber?: string;
  paypalEmail?: string;
  cryptoAddress?: string;
  cryptoNetwork?: string;
}

//  reputation: {
//       score: {
//         type: Number,
//         default: 50,
//         min: 0,
//         max: 100,
//       },
//       isVerified: {
//         type: Boolean,
//         default: false,
//       },
//       badges: [String],
//       lastUpdated: Date,
//     },
interface IReputation {
  score: number;
  isVerified: boolean;
  badges: string[];
  lastUpdated: Date;
}

// Main Influencer Interface extending Mongoose Document
export interface IInfluencer extends Document {
  userId: Types.ObjectId;
  influencerId: string;
  affiliations: string[];
  additionalNotes?: string;
  createdAt: string;
  updatedAt: string;

  gigPage?: IGigPage;

  reputation?: IReputation;

  // Optional bankDetails object
  bankDetails?: IBankDetails;
}

// If you need a separate type for creating new influencers (without Mongoose props)
export type ICreateInfluencer = Omit<IInfluencer, keyof Document> & {
  userId: string | Types.ObjectId; // allow both string and ObjectId for creation
};

// If you need a type for updating influencers
export type IUpdateInfluencer = Partial<ICreateInfluencer>;
