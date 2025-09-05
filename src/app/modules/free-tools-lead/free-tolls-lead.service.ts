import axios from "axios";


const STEINHQ_URL =
  "https://api.steinhq.com/v1/storages/6899386bc088333365ca37f4";
const SHEET_NAME = "FreeToolsLead";

const createFreeToolsLead = async (
  name: string,
  email: string,
  toolId: string
) => {
  if (!name || !email || !toolId) {
    throw new Error("Name, email and toolId are required");
  }

  const joinedAt = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const payload = { name, email, toolId, joinedAt };

  
  const searchUrl = `${STEINHQ_URL}/${SHEET_NAME}?search=${encodeURIComponent(
    JSON.stringify({ email, toolId })
  )}`;

  const existing = await axios.get(searchUrl);

  if (existing.data && existing.data.length > 0) {
    return {
      success: false,
      message: "This email already exists for this tool",
    };
  }
  
  await axios.post(`${STEINHQ_URL}/${SHEET_NAME}`, [payload]);

  return {
    success: true,
    message: "Email and name added successfully",
  };
};

export const FreeToolsLeadService = {
  createFreeToolsLead,
};
