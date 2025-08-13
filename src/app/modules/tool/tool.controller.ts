import status from "http-status";
import sendResponse from "../../utils/sendResponse";
import { ToolServices } from "./tool.service";
import catchAsync from "../../utils/catchAsync";
import { Request, Response } from "express";
import AppError from "../../errors/appError";
import { ToolModel } from "./tool.model";
import { IUser } from "../user/user.interface";

const createTool = catchAsync(async (req: Request, res: Response) => {
  const body = req.body;

  console.log("body", body)
  

  const result = await ToolServices.createToolIntoDB(body, req.user as IUser);

  sendResponse(res, {
    success: true,
    statusCode: status.OK,
    message: "Tool created successfully",
    data: result,
  });
});

const getAllTools = catchAsync(async (req: Request, res: Response) => {
  const result = await ToolServices.getAllToolsFromDB();

  sendResponse(res, {
    success: true,
    statusCode: status.OK,
    message: "Tools fetched successfully",
    data: result,
  });
});

const getSingleTool = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;

  const result = await ToolServices.getSingleToolFromDB(id);

  sendResponse(res, {
    success: true,
    statusCode: status.OK,
    message: "Tool fetched successfully",
    data: result,
  });
});

const getSingleToolByToolId = catchAsync(
  async (req: Request, res: Response) => {
    const { toolId } = req.params;

    const result = await ToolServices.getSingleToolByToolIdFromDB(toolId);

    sendResponse(res, {
      success: true,
      statusCode: status.OK,
      message: "Tool fetched successfully",
      data: result,
    });
  }
);

const updateTool = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const updatePayload = req.body;

  if (updatePayload.price != null && updatePayload.price < 0) {
    throw new AppError(status.BAD_REQUEST, "Price must be non-negative");
  }

  if (updatePayload.name) {
    const existingTool = await ToolModel.findOne({
      name: updatePayload.name,
      isActive: true,
      _id: { $ne: id },
    });
    if (existingTool) {
      throw new AppError(
        status.BAD_REQUEST,
        "A tool with this name already exists"
      );
    }
  }

  const result = await ToolServices.updateToolIntoDB(id, updatePayload);

  sendResponse(res, {
    success: true,
    statusCode: status.OK,
    message: "Tool updated successfully",
    data: result,
  });
});

const deleteTool = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;

  const result = await ToolServices.deleteToolIntoDB(id);

  sendResponse(res, {
    success: true,
    statusCode: status.OK,
    message: "Tool deleted successfully",
    data: result,
  });
});

export const ToolControllers = {
  createTool,
  getAllTools,
  getSingleTool,
  updateTool,
  deleteTool,
  getSingleToolByToolId,
};
