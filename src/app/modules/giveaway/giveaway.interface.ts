import { Types } from "mongoose";


export interface IGiveaway {
  _id?: Types.ObjectId;
  authorId: Types.ObjectId;
  title: string;
  description?: string;
  rules: string[];
  deadline?: Date;
  winnerId?: Types.ObjectId | null;
  participants: Types.ObjectId[];
  status?: "ongoing" | "closed" | "winner_selected";
  createdAt?: Date;
  updatedAt?: Date;
}
