import { Types } from "mongoose";

export interface IComment {
  entityId: Types.ObjectId | string;
  entityType: "story" | "review";
  userId: Types.ObjectId | string;
  comment: string;
  parentId: Types.ObjectId | null;
}
