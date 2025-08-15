import mongoose, { Types } from "mongoose";
import { IProof } from "./proof.interface";

const ProofSchema = new mongoose.Schema<IProof>(
  {
    // Who submitted this proof?
    proofSubmittedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    campaignId: { type: mongoose.Schema.Types.ObjectId, ref: "Campaign" },
    proofType: {
      type: String,
      required: true,
      enum: [
        "giveaway",
        "gig-submission",
        "referral",
        "post",
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
    pointsEarned: { type: Number, default: 0 },
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
