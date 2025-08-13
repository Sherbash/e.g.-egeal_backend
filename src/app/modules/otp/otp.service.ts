import crypto from "crypto";

import status from "http-status";
import { sendEmail } from "../../utils/emailHelper";
import { OtpModel } from "./otp.model";
import AppError from "../../errors/appError";

const generateOtp = () => {
  return crypto.randomInt(100000, 999999).toString(); // 6-digit OTP
};

const sendOtpEmail = async (email: string, firstName: string, otp: string) => {
  const subject = "Verify Your Email with OTP";
  const html = `
    <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px;">
      <h2>Marshall Team</h2>
      <p>Hi ${firstName},</p>
      <p>Your One-Time Password (OTP) for email verification is: <strong>${otp}</strong></p>
      <p>This OTP is valid for 15 minutes.</p>
      <p>Thank you,<br>The Marshall Team</p>
    </div>
  `;
  await sendEmail(email, subject, html);
};

export const createAndSendOtp = async (email: string, firstName: string) => {
  const otp = generateOtp();
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

  // Delete any existing OTPs for this email
  await OtpModel.deleteMany({ email });

  // Store new OTP
  await OtpModel.create({ email, otp, expiresAt });

  // Send OTP email
  await sendOtpEmail(email, firstName, otp);
};

export const verifyOtp = async (email: string, otp: string) => {
  const otpRecord = await OtpModel.findOne({ email, otp });

  if (!otpRecord) {
    throw new AppError(status.BAD_REQUEST, "Invalid OTP");
  }

  if (otpRecord.expiresAt < new Date()) {
    throw new AppError(status.BAD_REQUEST, "OTP has expired");
  }

  // Delete OTP to prevent reuse
  await OtpModel.deleteOne({ email, otp });

  return true;
};
