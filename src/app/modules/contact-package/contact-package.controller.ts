import { Request, Response } from "express";
import catchAsync from "../../utils/catchAsync";
import { ContactPackageServices } from "./contact-package.service";
import sendResponse from "../../utils/sendResponse";
import status from "http-status";

const sendContactPackageEmail = catchAsync(async (req: Request, res: Response) => {
  const result = await ContactPackageServices.sendContactPackageEmail(req.body);
  sendResponse(res, {
    success: true,
    statusCode: status.OK,
    message: "Contact package email sent successfully",
    data: result,
  });
});

const storeInfoFromPackagePopup = catchAsync(async (req: Request, res: Response) => {
  const {name, email} = req.body;
  const result = await ContactPackageServices.storeInfoFromPackagePopup(name, email);
  sendResponse(res, {
    success: true,
    statusCode: status.OK,
    message: "Name and Email stored successfully",
    data: result,
  });
});

export const ContactPackageController = {
  sendContactPackageEmail,
  storeInfoFromPackagePopup,
};
