import { Types } from "mongoose";

export interface IPost {
  authorId: Types.ObjectId;
  title: string;
  description: string;
  proofs: Types.ObjectId[]; 
}