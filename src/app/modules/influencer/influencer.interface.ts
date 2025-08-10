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

// Main Influencer Interface extending Mongoose Document
export interface IInfluencer extends Document {
  userId: Types.ObjectId;
  influencerId: string;
  affiliations: string[];
  additionalNotes?: string;
  createdAt: string;
  updatedAt: string;

  gigPage?: IGigPage;
}

// If you need a separate type for creating new influencers (without Mongoose props)
export type ICreateInfluencer = Omit<IInfluencer, keyof Document> & {
  userId: string | Types.ObjectId; // allow both string and ObjectId for creation
};

// If you need a type for updating influencers
export type IUpdateInfluencer = Partial<ICreateInfluencer>;
