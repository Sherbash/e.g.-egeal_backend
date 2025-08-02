import { model, Schema, Types } from "mongoose";
import { IReview } from "./review.interface";

const reviewSchema = new Schema(
  {
    userId: {
      type: Types.ObjectId,
      ref: "User",        
      required: true,
    },
    toolId: {
      type: Types.ObjectId,
      ref: "Tool",       
      required: true,
    },
    userName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      require:false
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

export const ReviewModel=model<IReview>("Review",reviewSchema)