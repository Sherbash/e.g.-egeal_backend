// models/DefaultRule.js
import mongoose from "mongoose";

const defaultRuleSchema = new mongoose.Schema(
  {
    rules: [
      {
        type: String,
        default: [
          "Follow egale hub all social link",
        //   "no spamming",
        //   "new rule added",
        ],
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Ensure only one document exists
defaultRuleSchema.statics.getDefaultRules = function () {
  return this.findOne().sort({ createdAt: -1 });
};

export const DefaultRule = mongoose.model("DefaultRule", defaultRuleSchema);


export const defaultRules: string[] = [
  "Follow egale hub all social link",
//   "No spamming",
//   "Engage with other participants",
];