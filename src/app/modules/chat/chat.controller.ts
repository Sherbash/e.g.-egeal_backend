import { Request, Response } from "express";
import httpStatus from "http-status";
import { ChatServices } from "./chat.service";
import AppError from "../../errors/appError";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";

const createChat = catchAsync(async (req: Request, res: Response) => {
  console.log("check body",req.body)
  const result = await ChatServices.createChatIntoDB(req.body);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Chat created successfully",
    data: result,
  });
});

const addMessage = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { messageText, sender, timeStamp } = req.body.data;
  console.log(req.body.data)
  const result = await ChatServices.addMessageIntoDB(id, { messageText, sender, timeStamp });

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Message added successfully",
    data: result,
  });
});

const getChats = catchAsync(async (req: Request, res: Response) => {
  const { id, role} = req.user
  const userss = req.user
  console.log('check chat', userss);
  if (!id || !role) {
     console.log('check chat', id,role);
    throw new AppError(httpStatus.BAD_REQUEST, "userId and userType query parameters are required");
  }

  const result = await ChatServices.getChatsFromDB(id as string, role as "influencer" | "founder");

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Chats retrieved successfully",
    data: result,
  });
});

export const ChatControllers = {
  createChat,
  addMessage,
  getChats,
};