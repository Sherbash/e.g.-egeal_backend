// test-email.ts

import { sendEmail } from "./app/utils/emailHelper";

async function testEmail() {
  try {
    await sendEmail(
      "test@example.com",
      "Test Email",
      "<p>This is a test email</p>"
    );
    console.log("Email sent successfully");
  } catch (error) {
    console.error("Email error:", error);
  }
}

testEmail();