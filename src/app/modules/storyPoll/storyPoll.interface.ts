import { Document, Types } from "mongoose";

export interface IPollChoice {
  text: string;
  votes: number;
  voters: Types.ObjectId[]; // ✅ Added voters
}

export interface IStory extends Document {
  authorId: Types.ObjectId | string;
  title: string;
  link?: string;
  pollChoices?: IPollChoice[];
}