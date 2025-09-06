import { Document, Types } from "mongoose";

export enum UserRole {
  INFLUENCER = "influencer",
  FOUNDER = "founder",
  INVESTOR = "investor",
  USER = "user",
  ADMIN = "admin",
}

// {
//         ruleTitle: String,
//         verifiedAt: Date,
//       },


export interface IUser extends Document {
  _id: Types.ObjectId;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: UserRole;
  verified: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  additionalNotes?: string;
  referralCode?: string;
  referredBy?: Types.ObjectId;
  referralLink?: string;
  points: number;
  verifiedDefaultRules: boolean;
  invitedUserCount: number;
  freePackages: Types.ObjectId[];
  earnedBadges?: Types.ObjectId[]; // Changed from currentBadge to earnedBadges
  autoAssignBadge?: boolean;
  subscriptions: Types.ObjectId[];
  isCodeSend?: boolean;
}