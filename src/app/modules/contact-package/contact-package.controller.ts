import { Request, Response } from "express";
import catchAsync from "../../utils/catchAsync";
import { ContactPackageServices } from "./contact-package.service";
import sendResponse from "../../utils/sendResponse";
import status from "http-status";
import { StoreInfoFromPackagePopup } from "./contact-package.model";

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
  const result = await StoreInfoFromPackagePopup.create(req.body);
  sendResponse(res, {
    success: true,
    statusCode: status.OK,
    message: "Info stored successfully",
    data: result,
  });
});

export const ContactPackageController = {
  sendContactPackageEmail,
  storeInfoFromPackagePopup,
};
