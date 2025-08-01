import { Types } from "mongoose";

export interface TMessage {
  messageText: string;
  sender: "influencer" | "founder";
  timeStamp: string;
}

export interface IChat {
  influencerId: Types.ObjectId;
  founderId: Types.ObjectId;
  conversation: TMessage[];
  promotions: Types.ObjectId[]
  createdAt?: Date;
  updatedAt?: Date;
}