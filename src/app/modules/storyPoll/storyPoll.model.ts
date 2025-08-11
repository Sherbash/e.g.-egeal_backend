import mongoose, { model, Schema, Types } from "mongoose";

const pollChoiceSchema = new mongoose.Schema({
  text: { type: String, required: true },
  voters: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
});

const storySchema = new mongoose.Schema(
  {
    title: String,
    link: String,
    authorId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    pollChoices: [pollChoiceSchema],
  },
  { timestamps: true }
);

export const StoryModel = model("Story", storySchema);
