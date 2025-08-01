import { Schema, model } from "mongoose";
import { ICourse } from "./course.interface";

const courseSchema = new Schema<ICourse>(
  {
    authorId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    courseName: { type: String, required: true },
    courseDescription: { type: String, required: true },
    courseTopics: { type: [String], default: [] },
    courseContents: { type: [String], default: [] },
  },
  {
    timestamps: true,
  }
);

export const Course = model<ICourse>("Course", courseSchema);
