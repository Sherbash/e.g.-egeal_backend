// freePackage.model.ts
import { Schema, model, Types } from "mongoose";

export interface IFreePackage {
  status: "none" | "freegiftPending" | "paid";
  amount: number;
  type: string;
  userId: Types.ObjectId; // Reference to user
}

const freePackageSchema = new Schema<IFreePackage>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    status: {
      type: String,
      enum: ["none", "freegiftPending", "paid"],
      default: "none",
    },
    type:{
      type: String,
      enum: ["testimonialWall", "socialpost"],
      default: "",
    },
    // amount: {
    //   type: Number,
    //   default: 0,
    // }
  },
  { timestamps: true }
);

export const FreePackage = model<IFreePackage>("FreePackage", freePackageSchema);