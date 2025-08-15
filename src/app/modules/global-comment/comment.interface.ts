import { Types } from "mongoose";

export interface IComment {
  feedbackId: Types.ObjectId;
  userId: Types.ObjectId;
  text: string;
  parentId: Types.ObjectId | null;
}
