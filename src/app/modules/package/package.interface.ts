import { Document, Types } from "mongoose";

export enum Interval {
  DAY = "day",
  WEEK = "week",
  MONTH = "month",
  YEAR = "year",
}

export enum PaymentStatus {
  PENDING = "PENDING",
  COMPLETED = "COMPLETED",
  CANCELED = "CANCELED",
  REFUNDED = "REFUNDED",
}

export interface IWhyThisPackage {
  title: string;
  answer: string;
}

export interface IPackage extends Document {
  _id: Types.ObjectId;
  packageName: string;
  amount: number;
  currency: string;
  interval: Interval;
  intervalCount: number;
  freeTrialDays?: number;
  productId: string;
  priceId: string;
  active: boolean;
  description?: string;
  features?: any; // JSON-like object for features
  promotionalMessage?: string; // New optional field
  whyThisPackage?: IWhyThisPackage; // New optional field
  createdAt: Date;
  updatedAt: Date;
}

export interface ISubscription extends Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  packageId: Types.ObjectId;
  startDate: Date;
  endDate?: Date;
  amount: number;
  stripePaymentId: string;
  paymentStatus: PaymentStatus;
  createdAt: Date;
  updatedAt: Date;
}