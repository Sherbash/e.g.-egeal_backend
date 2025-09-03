import mongoose, { Schema } from "mongoose";
import { IBadge } from "./badge.interface";

const badgeSchema = new Schema<IBadge>(
  {
    name: { type: String, required: true, unique: true },
    minScore: { type: Number, required: true, min: 0 },
    maxScore: { type: Number, required: true, min: 0 },
    iconUrl: { type: String, required: true },
  },
  {
    timestamps: true,
  }
);

// Ensure maxScore is greater than minScore
badgeSchema.pre("save", function (next) {
  if (this.maxScore <= this.minScore) {
    throw new Error("Max Score must be greater than Minimum Score");
  }
  next();
});

const Badge = mongoose.model<IBadge>("Badge", badgeSchema);
export { Badge };