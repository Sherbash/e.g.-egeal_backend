import mongoose, { model, Schema } from "mongoose";

// const pollChoiceSchema = new mongoose.Schema({
//   text: { type: String, required: true },
//   voters: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
// });

const storySchema = new mongoose.Schema(
  {
    authorId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    description: { type: String, required: true },
    imageLink: {type:String,required:false,default:null},
    videoLink: {type:String,required:false,default:null},
    comments: [{ type: Schema.Types.ObjectId, ref: "Comment", default: [] }], 
    // pollChoices: [pollChoiceSchema],
  },
  { timestamps: true }
);

export const StoryModel = model("Story", storySchema);
