import axios from "axios";


const STEINHQ_URL =
  "https://api.steinhq.com/v1/storages/6899386bc088333365ca37f4";
const SHEET_NAME = "HypeWaitList";

const createHypeWaitList = async(
  name: string,
  email: string,
  interest: string,
  userRole: string
) => {
  if(!name || !email || !interest || !userRole){
    throw new Error("Name, email, interest and userRole are required");
  }

  const joinedAt = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const payload = { name, email, interest, userRole, joinedAt };
  
  const searchUrl = `${STEINHQ_URL}/${SHEET_NAME}?search=${encodeURIComponent(
    JSON.stringify({ email })
  )}`;

  const existing = await axios.get(searchUrl);

  if (existing.data && existing.data.length > 0) {
    return {
      success: false,
      message: "This email already exists",
    };
  }

  const response = await axios.post(`${STEINHQ_URL}/${SHEET_NAME}`, [payload]);

  if (response.status !== 200) {
    throw new Error("Failed to add to email and name");
  }

  return {
    success: true,
    message: "HypeWaitList added successfully",
  }
}

export const HypeWaitlistServices = {
  createHypeWaitList
}