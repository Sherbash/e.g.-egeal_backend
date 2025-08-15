import mongoose from "mongoose";

export interface IProofUserInvite extends Document {
  inviter: mongoose.Types.ObjectId; 
  invitedUsers: { name: string; email: string }[]; 
  proofScreenshot?: string;
  confirmed: boolean; 
  rewardGiven: boolean;
}