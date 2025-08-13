import { Schema, model, Document } from "mongoose";

interface IOtp extends Document {
  email: string;
  otp: string;
  expiresAt: Date;
}

const otpSchema = new Schema<IOtp>({
  email: { type: String, required: true, index: true },
  otp: { type: String, required: true },
  expiresAt: { type: Date, required: true },
});

export const OtpModel = model<IOtp>("Otp", otpSchema);