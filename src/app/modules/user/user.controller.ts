import status from "http-status";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { Request, Response } from "express";
import { UserServices } from "./user.service";
import { IJwtPayload } from "../auth/auth.interface";
import { IUser } from "./user.interface";

const registerUser = catchAsync(async (req: Request, res: Response) => {
  const result = await UserServices.registerUser(req.body);

  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: "User registration completed successfully!",
    data: result,
  });
});

// Add to user.controller.ts
const getAllUsers = catchAsync(async (req: Request, res: Response) => {
  const result = await UserServices.getAllUsers(req.query);

  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: "Users retrieved successfully!",
    data: result,
  });
});

// Add to user.controller.ts
const getSingleUser = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await UserServices.getSingleUser(id);

  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: "User retrieved successfully!",
    data: result,
  });
});

// Add to user.controller.ts
const updateUser = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await UserServices.updateUser(id, req.body);

  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: "User updated successfully!",
    data: result,
  });
});

// Add to user.controller.ts
const deleteUser = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await UserServices.deleteUser(id);

  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: "User deleted successfully!",
    data: result,
  });
});

const myProfile = catchAsync(async (req, res) => {
  const result = await UserServices.myProfile(req.user as IJwtPayload);

  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: "Profile retrieved successfully",
    data: result,
  });
});
const getMeRoleBasedInfo = catchAsync(async (req, res) => {
  const result = await UserServices.getMeRoleBasedInfo(req.user as IUser);
  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: "Role-based info retrieved successfully",
    data: result,
  });
});

export const UserController = {
  registerUser,
  getAllUsers,
  getSingleUser,
  updateUser,
  deleteUser,
  myProfile,
  getMeRoleBasedInfo
};
