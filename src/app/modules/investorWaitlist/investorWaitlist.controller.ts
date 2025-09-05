// import { Request, Response } from "express";
// import catchAsync from "../../utils/catchAsync";
// import sendResponse from "../../utils/sendResponse";
// import { InvestorWaitlistService } from "./investorWaitlist.service";


// const joinInvestorWaitlist = catchAsync(async (req: Request, res: Response) => {
//   const { email, toolId, investmentAmount } = req.body;

//   const result = await InvestorWaitlistService.addToInvestorWaitlist(email, toolId, investmentAmount);

//   sendResponse(res, {
//     success: true,
//     statusCode: 200,
//     message: "Added to investor waitlist successfully",
//     data: result,
//   }); 
// });

// export const InvestorWaitlistController = {
//   joinInvestorWaitlist,
// };


import { Request, Response } from "express";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { InvestorWaitlistService } from "./investorWaitlist.service";

const joinInvestorWaitlist = catchAsync(async (req: Request, res: Response) => {
  const { name, company, email, aboutYou, niche, range, type, stage, region, linkedIn, source } = req.body;

  const result = await InvestorWaitlistService.addToInvestorWaitlist(
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
    source
  );

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: "Added to investor waitlist successfully",
    data: result,
  });
});

export const InvestorWaitlistController = {
  joinInvestorWaitlist,
};