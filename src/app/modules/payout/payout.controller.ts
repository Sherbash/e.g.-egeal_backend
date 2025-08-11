// payout.controller.ts
import { Request, Response } from "express";
import status from "http-status";
import catchAsync from "../../utils/catchAsync";
import { PayoutServices } from "./payout.service";
import sendResponse from "../../utils/sendResponse";

const createPayoutRequest = catchAsync(async (req: Request, res: Response) => {
  const payload = req.body;

  const result = await PayoutServices.createPayoutRequest(payload);

  sendResponse(res, {
    success: true,
    statusCode: status.OK,
    message: "Payout request submitted",
    data: result,
  });
});

export const PayoutControllers = {
  createPayoutRequest,
};
