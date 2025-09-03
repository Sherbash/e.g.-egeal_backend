import status from "http-status";

import { Request, Response, NextFunction } from "express";
import catchAsync from "../../utils/catchAsync";
import { UserServices } from "./user.service";
import sendResponse from "../../utils/sendResponse";
import { IJwtPayload } from "../auth/auth.interface";
import { IUser } from "./user.interface";

const registerUser = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const result = await UserServices.registerUser(req.body);

    sendResponse(res, {
      statusCode: status.OK,
      success: true,
      message: "OTP sent for verification",
      data: result,
    });
  }
);

const verifyOtp = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { email, otp } = req.body;
    const result = await UserServices.completeRegistration(email, otp);

    sendResponse(res, {
      statusCode: status.OK,
      success: true,
      message: "User registration completed successfully!",
      data: result,
    });
  }
);

const getAllUsers = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const result = await UserServices.getAllUsers(req.query);

    sendResponse(res, {
      statusCode: status.OK,
      success: true,
      message: "Users retrieved successfully!",
      data: result,
    });
  }
);

const getSingleUser = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const result = await UserServices.getSingleUser(id);

    sendResponse(res, {
      statusCode: status.OK,
      success: true,
      message: "User retrieved successfully!",
      data: result,
    });
  }
);

const updateUser = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const result = await UserServices.updateUser(id, req.body);

    sendResponse(res, {
      statusCode: status.OK,
      success: true,
      message: "User updated successfully!",
      data: result,
    });
  }
);

const deleteUser = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const result = await UserServices.deleteUser(id);

    sendResponse(res, {
      statusCode: status.OK,
      success: true,
      message: "User deleted successfully!",
      data: result,
    });
  }
);

const myProfile = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const result = await UserServices.myProfile(req.user as IJwtPayload);

    sendResponse(res, {
      statusCode: status.OK,
      success: true,
      message: "Profile retrieved successfully",
      data: result,
    });
  }
);

const getMeRoleBasedInfo = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const result = await UserServices.getMeRoleBasedInfo(req.user as IUser);
    sendResponse(res, {
      statusCode: status.OK,
      success: true,
      message: "Role-based info retrieved successfully",
      data: result,
    });
  }
);

const toggleUserStatus = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const result = await UserServices.toggleUserStatus(id);
    sendResponse(res, {
      statusCode: status.OK,
      success: true,
      message: "Banned user successfully",
      data: result,
    });
  }
);

export const UserController = {
  registerUser,
  verifyOtp,
  getAllUsers,
  getSingleUser,
  updateUser,
  deleteUser,
  myProfile,
  getMeRoleBasedInfo,
  toggleUserStatus,
};
