import { model, Schema, Types } from "mongoose";

const reviewSchema = new Schema(
  {
    entityId: { type: Types.ObjectId, required: true }, // Story, Tool, Product etc.
    entityType: { type: String, enum: ["story", "tool", "product", "influencer"], required: true },
    userId: { type: Types.ObjectId, ref: "User", required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true },
  },
  { timestamps: true }
);

export const ReviewModel = model("AllReview", reviewSchema);
