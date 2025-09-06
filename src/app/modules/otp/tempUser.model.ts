import { Schema, model, Document } from "mongoose";
import { UserRole } from "../user/user.interface";

interface ITempUser extends Document {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: UserRole;
  verifiedDefaultRules?: boolean;
  additionalNotes?: string;
  referredBy?: Schema.Types.ObjectId;
  referralCode: string;
  referralLink: string;
  createdAt: Date;
}

const tempUserSchema = new Schema<ITempUser>({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  role: { type: String, enum: Object.values(UserRole), required: true },
  additionalNotes: { type: String },
  verifiedDefaultRules: { type: Boolean, default: false },
  referredBy: { type: Schema.Types.ObjectId, ref: "User" },
  referralCode: { type: String, required: true, unique: true },
  referralLink: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

export const TempUserModel = model<ITempUser>("TempUser", tempUserSchema);