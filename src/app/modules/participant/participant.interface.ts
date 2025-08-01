import { Types } from "mongoose";


export interface IProof {
  ruleTitle: string;
  imageUrl: string;
  verified?: boolean;
}

export interface IParticipant {
  _id?: Types.ObjectId;
  giveawayId: Types.ObjectId;
  userId: Types.ObjectId;
  socialUsername?: string;
  videoLink?: string;
  proofs: IProof[];
  isWinner?: boolean;
  submittedAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}
