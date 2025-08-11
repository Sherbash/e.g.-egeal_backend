
import { model, Schema } from "mongoose";
import { IGlobalReview } from "./global-review.interface";


// Mongoose schema for Review
const reviewSchema = new Schema<IGlobalReview>(
  {
    entityId: { type: Schema.Types.ObjectId, required: false }, // Story, Tool, Product, etc.
    entityType: {
      type: String,
      enum: ["story", "tool", "product", "influencer", "testimonialWall"] as const, // Explicitly cast as const for TypeScript
      required: false,
    },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    reviewText: { type: String, required: true },
    reviewVideoUrl: { type: String, required: false },
    proofUrl: { type: String, required: false },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"] as const, // Explicitly cast as const for TypeScript
      default: "pending",
    },
    isApproved: { type: Boolean, default: false },
    isEditorPicked: { type: Boolean, default: false },
    rewardGiven: { type: Boolean, default: false },
    comments: [{ type: Schema.Types.ObjectId, ref: "Comment", default: [] }], // Default to empty array
  },
  { timestamps: true }
);

export const ReviewModel = model("AllReview", reviewSchema);

// Index for performance