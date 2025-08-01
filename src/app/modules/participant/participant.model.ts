// models/Participant.js
import mongoose from "mongoose";

const proofSchema = new mongoose.Schema({
  ruleTitle: String, // title of the rule
  imageUrl: String,  // image URL 
  verified: {
    type: Boolean,
    default: false,  
  },
});

const participantSchema = new mongoose.Schema(
  {
    giveawayId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Giveaway',
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    socialUsername: String, // Instagram/TikTok username
    videoLink: String, // their promo video
    proofs: [proofSchema], // multiple rule/image pair
    // status: {
    //   type: String,
    //   enum: ['pending', 'approved', 'rejected'],
    //   default: 'pending',
    // },
    isWinner: {
      type: Boolean,
      default: false,
    },
    submittedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

export const Participant = mongoose.model('Participant', participantSchema);
