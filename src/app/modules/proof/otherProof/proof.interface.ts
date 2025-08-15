import mongoose from "mongoose";

export interface IProof extends Document {
  proofSubmittedBy: mongoose.Types.ObjectId;
  campaignId: mongoose.Types.ObjectId;
  proofType: "giveaway" | "gig-submission" | "referral" | "social-post" | "testimonial" | "payment";
  proofLink: string;
  proofAbout: string;
  status: "pending" | "approved" | "rejected";
  adminFeedback?: string;
  pointsEarned: number;
  rewardGiven: boolean;
  createdAt: Date;
  updatedAt: Date;
}