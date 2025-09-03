// import axios from "axios";
// import status from "http-status";
// import AppError from "../../errors/appError";

// const STEINHQ_URL =
//   "https://api.steinhq.com/v1/storages/6899386bc088333365ca37f4";
// const SHEET_NAME = "InvestorWaitlist";

// const addToInvestorWaitlist = async (
//   email: string,
//   toolId: string,
//   investmentAmount: number
// ) => {
//   if (!email || !toolId) {
//     throw new AppError(status.BAD_REQUEST, "Email and Tool ID are required");
//   }

//   if (investmentAmount <= 0) {
//     throw new AppError(
//       status.BAD_REQUEST,
//       "Investment amount must be positive"
//     );
//   }

//   const joinedAt = new Date().toLocaleDateString("en-US", {
//     year: "numeric",
//     month: "long",
//     day: "numeric",
//   });

//   const payload = {
//     email,
//     toolId,
//     investmentAmount,
//     joinedAt,
//   };

//   const res = await axios.post(`${STEINHQ_URL}/${SHEET_NAME}`, [payload]);

//   if (res.status !== 200) {
//     throw new AppError(
//       status.INTERNAL_SERVER_ERROR,
//       "Failed to add to investor waitlist"
//     );
//   }

//   return {
//     success: true,
//     message: "You have been added to the investor waitlist",
//   };
// };

// export const InvestorWaitlistService = {
//   addToInvestorWaitlist,
// };





import axios from "axios";
import status from "http-status";
import AppError from "../../errors/appError";

const STEINHQ_URL =
  "https://api.steinhq.com/v1/storages/6899386bc088333365ca37f4";
const SHEET_NAME = "InvestorWaitlist";

const addToInvestorWaitlist = async (
  name: string,
  company: string,
  email: string,
  aboutYou: string,
  niche: string,
  range: string,
  type: string,
  stage: string,
  region: string,
  linkedIn: string,
  source: string
) => {
  if (!email || !name || !company) {
    throw new AppError(status.BAD_REQUEST, "Name, Company, and Email are required");
  }

  const joinedAt = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const payload = {
    name,
    company,
    email,
    aboutYou,
    niche,
    range,
    type,
    stage,
    region,
    linkedIn,
    source,
    joinedAt,
  };

  const res = await axios.post(`${STEINHQ_URL}/${SHEET_NAME}`, [payload]);

  if (res.status !== 200) {
    throw new AppError(
      status.INTERNAL_SERVER_ERROR,
      "Failed to add to investor waitlist"
    );
  }

  return {
    success: true,
    message: "You have been added to the investor waitlist",
  };
};

export const InvestorWaitlistService = {
  addToInvestorWaitlist,
};