import { Schema, model } from "mongoose";
import { IPost } from "./post.interface";

const PostSchema = new Schema<IPost>(
  {
    authorId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String },
    description: { type: String },
    proofs: [{ type: Schema.Types.ObjectId, ref: "Proof" }],
  },
  { timestamps: true }
);

export const PostModel = model<IPost>("Post", PostSchema);
