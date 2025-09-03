import { sendEmail } from "../../utils/emailHelper";
import { IContactPackage } from "./contact-package.interface";

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

export const ContactPackageServices = {
  sendContactPackageEmail,
};
