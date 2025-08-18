import mongoose from "mongoose";

export interface IProof extends Document {
  PostId: mongoose.Types.ObjectId;
  proofSubmittedBy: mongoose.Types.ObjectId;
  proofApprovedBy: mongoose.Types.ObjectId;
  campaignId: mongoose.Types.ObjectId;
  proofType: "giveaway" | "gig-submission" | "referral" | "social-post" | "testimonial" | "payment" | "post" | "campaign";
  proofLink: string;
  proofAbout: string;
  status: "pending" | "approved" | "rejected";
  adminFeedback?: string;
  pointsEarned: number;
  rewardGiven: boolean;
  createdAt: Date;
  updatedAt: Date;
}