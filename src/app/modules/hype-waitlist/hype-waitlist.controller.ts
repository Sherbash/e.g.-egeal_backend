import { Request, Response } from "express";
import catchAsync from "../../utils/catchAsync";
import { HypeWaitlistServices } from "./hype-waitlist.service";
import sendResponse from "../../utils/sendResponse";



const createHypeWaitList = catchAsync(async(req: Request, res: Response) => {
  const {name, email, interest, userRole} = req.body;

  const result = await HypeWaitlistServices.createHypeWaitList(name, email, interest, userRole);

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: "Hype waitlist created successfully",
    data: result,
  });
})

export const HypeWaitlistController = {
  createHypeWaitList
}