import mongoose, { model, Schema } from "mongoose";

// const pollChoiceSchema = new mongoose.Schema({
//   text: { type: String, required: true },
//   voters: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
// });

const storySchema = new mongoose.Schema(
  {
    authorId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true },
    link: String,
    // pollChoices: [pollChoiceSchema],
  },
  { timestamps: true }
);

export const StoryModel = model("Story", storySchema);
