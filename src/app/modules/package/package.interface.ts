import { Document, Types } from "mongoose";
import { UserRole } from "../user/user.interface";

export enum Interval {
  DAY = "day",
  WEEK = "week",
  MONTH = "month",
  YEAR = "year",
}

export enum PackageType {
  MONTHLY = "monthly",
  YEARLY = "yearly",
  LIFETIME = "lifetime",
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
  packageType: PackageType;
  interval?: Interval | null;
  intervalCount?: number | null;
  freeTrialDays?: number;
  productId: string;
  priceId: string;
  active: boolean;
  description?: string;
  features?: any;
  promotionalMessage?: string;
  whyThisPackage?: IWhyThisPackage;
  isForHome?: boolean;
  roles?: UserRole[];
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