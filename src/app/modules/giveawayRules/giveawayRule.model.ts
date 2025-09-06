import mongoose, { Schema, Document } from "mongoose";

export interface IRule extends Document {
  ruleTitle: string;
  imageUrl: null;
  createdAt?: Date;
  updatedAt?: Date;
}

const ruleSchema = new Schema<IRule>(
  {
    ruleTitle: {
      type: String,
      required: true,
      trim: true,
    },
    imageUrl: {
      type: String,
      default: null
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
    ruleTitle: "Follow Egale Hub all socials",
    imageUrl: "https://i.ibb.co/8DWKbzhw/111.png",
  },
  {
    _id: new mongoose.Types.ObjectId("507f1f77bcf86cd799439012"),
    ruleTitle: "No spamming",
    imageUrl: "https://i.ibb.co/8DWKbzhw/111.png"
  },
];
