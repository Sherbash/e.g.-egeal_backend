import { Types } from "mongoose";

export enum PaymentStatus {
  PENDING = "pending",
  COMPLETED = "completed",
  FAILED = "failed",
  REFUNDED = "refunded",
}

export interface IPayment {
  user: Types.ObjectId;
  toolName: string;
  toolId: string;
  influencerId?: string;
  price: number;
  stripeSessionId: string;
  paymentIntentId: string; // New field
  status: PaymentStatus;
}