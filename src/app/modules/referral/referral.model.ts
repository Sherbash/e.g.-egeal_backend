// // referral.model.ts
// import { Schema, model, Types } from "mongoose";

// interface IReferral {
//   referrer: Types.ObjectId; // Who shared the link
//   referredUser?: Types.ObjectId; // Who signed up
//   status: "pending" | "verified"; // Payment or campaign launched
//   createdAt: Date;
// }

// const referralSchema = new Schema<IReferral>(
//   {
//     referrer: { type: Schema.Types.ObjectId, ref: "User", required: true },
//     referredUser: { type: Schema.Types.ObjectId, ref: "User" },
//     status: { type: String, enum: ["pending", "verified"], default: "pending" }
//   },
//   { timestamps: true }
// );

// export const Referral = model<IReferral>("Referral", referralSchema);


import { Schema, model, Types } from "mongoose";
import { IPayoutDetails, IReferral } from "./referral.interface";


const payoutDetailsSchema = new Schema<IPayoutDetails>({
  method: { type: String, enum: ["bank", "paypal", "crypto", "credit"], required: true },
  accountInfo: { type: String, required: true },
  minimumPayout: { type: Number, default: 50 } // $50 minimum example
}, { _id: false });

const referralSchema = new Schema<IReferral>(
  {
    referrer: { 
      type: Schema.Types.ObjectId, 
      ref: "User", 
      required: true,
      index: true 
    },
    referredUser: { 
      type: Schema.Types.ObjectId, 
      ref: "User",
      index: true 
    },
    status: { 
      type: String, 
      enum: ["pending", "verified", "paid"], 
      default: "pending" 
    },
    rewardAmount: { 
      type: Number, 
      default: null // $0 reward example
    },
    campaignId: {
      type: Schema.Types.ObjectId,
      ref: "Campaign"
    },
    payoutDetails: payoutDetailsSchema,
    verifiedAt: Date,
    paidAt: Date
  },
  { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true } 
  }
);

// Indexes for faster queries
referralSchema.index({ referrer: 1, status: 1 });
referralSchema.index({ referredUser: 1, status: 1 });
referralSchema.index({ referredUser: 1, status: 1 });


export const Referral = model<IReferral>("Referral", referralSchema);