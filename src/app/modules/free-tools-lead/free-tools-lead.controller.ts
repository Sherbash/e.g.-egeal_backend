import { Request, Response } from "express";
import catchAsync from "../../utils/catchAsync";
import { FreeToolsLeadService } from "./free-tolls-lead.service";
import sendResponse from "../../utils/sendResponse";
import status from "http-status";


const createFreeToolsLead = catchAsync(async (req: Request, res: Response) => {
  const { name, email, toolId } = req.body;
  const result = await FreeToolsLeadService.createFreeToolsLead(
    name,
    email,
    toolId
  );

  sendResponse(res, {
    success: true,
    statusCode: status.OK,
    message: "Free tools lead created successfully",
    data: result,
  });
});

export const FreeToolsLeadController = {
  createFreeToolsLead,
};