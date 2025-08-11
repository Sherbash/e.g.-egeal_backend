import { Types } from "mongoose";

export interface IComment {
  reviewId: Types.ObjectId;
  userId: Types.ObjectId;
  text: string;
  parentId: Types.ObjectId | null;
}
