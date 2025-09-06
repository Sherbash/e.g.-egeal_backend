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



export const defaultRules = [
  {
    _id: new mongoose.Types.ObjectId("507f1f77bcf86cd799439011"),
    ruleTitle: "Follow Egale Hub all socials",
    imageUrl: "https://i.ibb.co/8DWKbzhw/111.png",
  },
  {
    _id: new mongoose.Types.ObjectId("507f1f77bcf86cd799439012"),
    ruleTitle: "No spamming",
    imageUrl: "https://i.ibb.co/8DWKbzhw/111.png",
  },
];