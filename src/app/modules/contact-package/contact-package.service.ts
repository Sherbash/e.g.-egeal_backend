import axios from "axios";
import { sendEmail } from "../../utils/emailHelper";
import { IContactPackage } from "./contact-package.interface";

const STEINHQ_URL =
  "https://api.steinhq.com/v1/storages/6899386bc088333365ca37f4";
const SHEET_NAME = "EmailPackagePopup";

const sendContactPackageEmail = async (payload: IContactPackage) => {
  await sendEmail(
    process.env.ADMIN_EMAIL!,
    "Contact Package",
    `
      <p>Hey Eagle,</p>
      <p>${payload.name} would like to connect with you regarding Egeal’s packages.</p>
      <p>Here are the details:</p>

      <p><strong>Name:</strong> ${payload.name}</p>
      <p><strong>Email:</strong> ${payload.email}</p>
      <p><strong>Message:</strong> ${payload.message}</p>
    `
  );

  // return a simple message or the payload for response
  return { message: "Email sent successfully" };
};

const storeInfoFromPackagePopup = async (
  name: string,
  email: string
) => {
  if(!name || !email){
    throw new Error("Name and email are required");
  }

  const joinedAt = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const payload = { name, email, joinedAt };
  const response = await axios.post(`${STEINHQ_URL}/${SHEET_NAME}`, [payload]);

  if (response.status !== 200) {
    throw new Error("Failed to add to email and name");
  }

  return {
    success: true,
    message: "Email and name added successfully",
  }
}



export const ContactPackageServices = {
  sendContactPackageEmail,
  storeInfoFromPackagePopup,
};
