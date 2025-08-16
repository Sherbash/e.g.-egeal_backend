import { model, Schema, Types } from "mongoose";

const commentSchema = new Schema(
  {
    entityId: { type: Types.ObjectId, required: true },
    entityType: { type: String, enum: ["story", "review"], required: true },
    userId: { type: Types.ObjectId, ref: "User", required: true },
    comment: { type: String,  },
    parentId: { type: Types.ObjectId, ref: "Comment", default: null },
  },
  { timestamps: true }
);

// Index for performance
commentSchema.index({ reviewId: 1 });

export const CommentModel = model("Comment", commentSchema);
