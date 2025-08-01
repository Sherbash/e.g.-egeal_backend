import mongoose, { Schema, Document } from "mongoose";
import { IInvestor } from "./investor.interface";

const investorSchema = new Schema<IInvestor>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  investIn: [
    {
      type: Schema.Types.ObjectId,
      ref: "Tool",
    },
  ],
  projectPreference: {
    type: String,
    default: "unspecified",
  },
  investmentRange: {
    type: String,
    default: "$-$(unspecified)",
  },
  additionalNotes: {
    type: String,
    default: "empty",
  },
});

const Investor = mongoose.model<IInvestor>("Investor", investorSchema);
export { Investor };