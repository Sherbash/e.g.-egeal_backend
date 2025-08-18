import mongoose from "mongoose";
import { IProof } from "./proof.interface";

const ProofSchema = new mongoose.Schema<IProof>(
  {
    PostId: { type: mongoose.Schema.Types.ObjectId, ref: "Post" },
    // Who submitted this proof?
    proofSubmittedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    proofApprovedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    campaignId: { type: mongoose.Schema.Types.ObjectId, ref: "Campaign" },
    proofType: {
      type: String,
      required: true,
      enum: [
        "giveaway",
        "gig-submission",
        "referral",
        "campaign",
        "post", // our egalehub post
        "social-post", // social media post and its related proof
        "testimonial",
        "payment",
      ],
    },

    proofLink: { type: String, required: true },
    proofAbout: { type: String, required: true },

    // Verification status
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    adminFeedback: { type: String },

    // Points/rewards
    // pointsEarned: { type: Number, default: 0 },
    rewardGiven: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Update the 'updatedAt' field before saving
ProofSchema.pre("save", function (next: any) {
  const proofModel = this;
  proofModel.updatedAt = new Date();
  next();
});

const ProofModel = mongoose.model("Proof", ProofSchema);

export default ProofModel;
