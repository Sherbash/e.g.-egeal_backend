import mongoose, { Schema, Document } from "mongoose";

export interface IRule extends Document {
  ruleTitle: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const ruleSchema = new Schema<IRule>(
  {
    ruleTitle: {
      type: String,
      required: true,
      trim: true,
    }
  },
  {
    timestamps: true,
  }
);

export const RuleModel = mongoose.model<IRule>("Rule", ruleSchema);

// Default rules data
export const defaultRules = [
  {
    _id: new mongoose.Types.ObjectId("507f1f77bcf86cd799439011"),
    ruleTitle: "Follow Egale Hub all socials"  },
  {
    _id: new mongoose.Types.ObjectId("507f1f77bcf86cd799439012"),
    ruleTitle: "No spamming"
  },
];
