import mongoose from "mongoose";

const giveawaySchema = new mongoose.Schema(
  {
    authorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Founder",
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    priceMoney: {
      type: Number,
      required: true,
      default: 0, // Default value if not specified
    },
    description: String,
    rules: [String], // eg. "Post on TikTok", "Upload screenshot"
    deadline: Date, // optional: last date to participate
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
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

export const Giveaway = mongoose.model("Giveaway", giveawaySchema);
