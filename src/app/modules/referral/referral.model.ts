// referral.model.ts
import { Schema, model, Types } from "mongoose";

interface IReferral {
  referrer: Types.ObjectId; // Who shared the link
  referredUser?: Types.ObjectId; // Who signed up
  status: "pending" | "verified"; // Payment or campaign launched
  createdAt: Date;
}

const referralSchema = new Schema<IReferral>(
  {
    referrer: { type: Schema.Types.ObjectId, ref: "User", required: true },
    referredUser: { type: Schema.Types.ObjectId, ref: "User" },
    status: { type: String, enum: ["pending", "verified"], default: "pending" }
  },
  { timestamps: true }
);

export const Referral = model<IReferral>("Referral", referralSchema);
