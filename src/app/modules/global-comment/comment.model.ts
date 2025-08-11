import { model, Schema, Types } from "mongoose";

const commentSchema = new Schema(
  {
    reviewId: { type: Types.ObjectId, ref: "AllReview", required: true },
    userId: { type: Types.ObjectId, ref: "User", required: true },
    text: { type: String, required: true },
    parentId: { type: Types.ObjectId, ref: "Comment", default: null },
  },
  { timestamps: true }
);

// Index for performance
commentSchema.index({ reviewId: 1 });

export const CommentModel = model("Comment", commentSchema);
