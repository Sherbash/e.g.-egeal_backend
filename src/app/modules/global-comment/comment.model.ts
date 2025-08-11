import { model, Schema, Types } from "mongoose";

const commentSchema = new Schema(
  {
    entityId: { type: Types.ObjectId, required: true }, // Story, Review, Blog etc.
    entityType: { type: String, required: true }, // story, review, blog...
    userId: { type: Types.ObjectId, ref: "User", required: true },
    userName: { type: String, required: true },
    text: { type: String, required: true },
    parentId: { type: Types.ObjectId, ref: "Comment", default: null }, 
  },
  { timestamps: true }
);

export const CommentModel = model("Comment", commentSchema);
