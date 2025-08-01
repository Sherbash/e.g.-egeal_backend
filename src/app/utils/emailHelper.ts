import nodemailer from "nodemailer";
import config from "../config";

export const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: config.gmail, // Your Gmail
    pass: config.gmail_pass, // App password from Gmail
  },
});

export const sendEmail = async (to: string, subject: string, html: string) => {
  await transporter.sendMail({
    from: `"Marshall Team" <${config.gmail}>`,
    to,
    subject,
    html,
  });
};
