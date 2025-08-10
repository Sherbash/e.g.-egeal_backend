import { Types } from "mongoose";

export interface IGiveaway {
  _id?: Types.ObjectId;
  authorId: Types.ObjectId;
  title: string;
  priceMoney: number;
  description?: string;
  rules: string[];
  deadline?: Date;
  winnerId?: Types.ObjectId | null;
  participants: Types.ObjectId[];
  status?: "ongoing" | "closed" | "winner_selected";
  isPrivate: boolean;
  inviteCode: string;
  allowedUsers: Types.ObjectId[];
  maxParticipants: number;
  createdAt?: Date;
  updatedAt?: Date;
}
