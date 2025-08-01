import mongoose, { Schema } from "mongoose";
import { IFounder } from "./founder.interface";
import { string } from "zod";

const founderSchema = new Schema<IFounder>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  tools: {
    type: [String], // Array of toolId strings
    default: []
  },
  additionalNotes: {
    type: String,
    default: "empty",
  },
});

const Founder = mongoose.model<IFounder>("Founder", founderSchema);
export { Founder };
