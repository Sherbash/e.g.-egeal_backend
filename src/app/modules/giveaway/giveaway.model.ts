

import mongoose from "mongoose";

const giveawaySchema = new mongoose.Schema(
  {
    authorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    priceMoney: {
      type: Number,
      required: true,
      default: 0,
    },
    description: String,
    rules: [String],
    deadline: Date,
    winnerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Participant",
      },
    ],
    status: {
      type: String,
      enum: ["ongoing", "closed", "winner_selected"],
      default: "ongoing",
    },
    isPrivate: { type: Boolean, default: false },
    inviteCode: { type: String }, 
    maxParticipants: {
      type: Number,
      default: 30, 
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);
giveawaySchema.index({ authorId: 1 });
export const Giveaway = mongoose.model("Giveaway", giveawaySchema);