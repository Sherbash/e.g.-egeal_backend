import { Schema, model, Types } from "mongoose";

export type ReferralStatus = "pending" | "verified" | "paid";
export type PayoutMethod = "bank" | "paypal" | "crypto" | "credit";
export interface IPayoutDetails {
  method: PayoutMethod;
  accountInfo: string;
  minimumPayout: number;
}

export interface IReferral {
  referrer: Types.ObjectId; // Who shared the link
  referredUser: Types.ObjectId; // Who signed up
  status: ReferralStatus;
  rewardAmount: number | null;
  campaignId?: Types.ObjectId; // Optional campaign reference
  payoutDetails?: IPayoutDetails;
  verifiedAt?: Date;
  paidAt?: Date;
}
