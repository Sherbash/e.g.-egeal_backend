import { Request, Response } from "express";

import status from "http-status";
import catchAsync from "../../utils/catchAsync";
import { HomePopupService } from "./homePopUp.service";
import sendResponse from "../../utils/sendResponse";

const joinPopup = catchAsync(async (req: Request, res: Response) => {
  const { firstAnswer, secondAnswer } = req.body;

  const result = await HomePopupService.joinPopup(firstAnswer, secondAnswer);

  sendResponse(res, {
    success: true,
    statusCode: status.OK,
    message: "Added data successfully",
    data: result,
  });
});

// const getAllPopupEntries = catchAsync(async (req: Request, res: Response) => {
//   const result = await HomePopupService.getAllPopupEntries();

//   sendResponse(res, {
//     success: true,
//     statusCode: status.OK,
//     message: "Data entries retrieved successfully",
//     data: result,
//   });
// });

export const HomePopupController = {
  joinPopup,
//   getAllPopupEntries,
};