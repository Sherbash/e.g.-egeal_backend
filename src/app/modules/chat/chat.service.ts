/* eslint-disable @typescript-eslint/no-explicit-any */
import httpStatus from "http-status";
import { Chat } from "./chat.model";
import { IChat } from "./chat.interface";
import mongoose, { Types } from "mongoose";
import { Influencer } from "../influencer/influencer.model";
import { Founder } from "../founder/founder.model";
import AppError from "../../errors/appError";

const createChatIntoDB = async (payload:any) => {
  console.log("check payload",payload)
  const { influencerId, founderId } = payload;

  // Validate influencer and founder existence
  const influencerExists = await Influencer.findById(influencerId);

  if (!influencerExists) {
    throw new AppError(httpStatus.NOT_FOUND, "Influencer not found");
  }

  const founderExists = await Founder.findById(founderId);
  if (!founderExists) {
    throw new AppError(httpStatus.NOT_FOUND, "Founder not found");
  }

  // Check if chat already exists between influencer and founder
  const existingChat = await Chat.findOne({
    influencerId: new Types.ObjectId(influencerId),
    founderId: new Types.ObjectId(founderId),
  });
  if (existingChat) {
    throw new AppError(httpStatus.CONFLICT, "Chat already exists between this influencer and founder");
  }

  const chatData: Partial<IChat> = {
    influencerId: new Types.ObjectId(influencerId),
    founderId: new Types.ObjectId(founderId),
    conversation: [],
  };

  const createdChat = await Chat.create(chatData);
  return createdChat;
};

const addMessageIntoDB = async (
  chatId: string,
  message: { messageText: string; sender: "influencer" | "founder"; timeStamp: string }
) => {
  const { messageText, sender, timeStamp } = message;

  // Validate chat existence
  const chat = await Chat.findById(chatId);
  if (!chat) {
    throw new AppError(httpStatus.NOT_FOUND, "Chat not found");
  }

  // Add message to conversation
  const updatedChat = await Chat.findByIdAndUpdate(
    chatId,
    {
      $push: {
        conversation: {
          messageText,
          sender,
          timeStamp,
        },
      },
    },
    { new: true, runValidators: true }
  ).lean();

  if (!updatedChat) {
    throw new AppError(httpStatus.NOT_FOUND, "Failed to add message to chat");
  }

  return updatedChat;
};

const getChatsFromDB = async (userId: string, userType: "influencer" | "founder") => {
  
  console.log(userId,"check userId")
  // Validate userType
  if (!["influencer", "founder"].includes(userType)) {
    throw new AppError(httpStatus.BAD_REQUEST, "Invalid user type. Must be 'influencer' or 'founder'");
  }
let user
  // Validate user existence
  if (userType === "influencer") {
    const influencerExists = await Influencer.findOne({userId:userId})
    console.log("check influencerExists", influencerExists)
    if (!influencerExists) {
      throw new AppError(httpStatus.NOT_FOUND, "Influencer not found");
    }
    user=influencerExists._id
  } 
 

  if (userType === "founder") {
  const founderExists = await Founder.findOne({userId:userId});
     console.log("check influencerExists", founderExists)
    if (!founderExists) {
      throw new AppError(httpStatus.NOT_FOUND, "Founder not found");
    }
    user=founderExists._id
  }
  console.log("check user data ", user)
 
  
  // Fetch chats for the user
  const query =
  userType === "influencer"
    ? { influencerId: new mongoose.Types.ObjectId(user) }
    : { founderId: new mongoose.Types.ObjectId(user) };

console.log("query", query);

const chats = await Chat.find(query)
    .populate({
      path: "influencerId",
      select: "influencerId",
      populate: {
        path: "userId",
        model: "User",
     select: "-password"
      }
    })
    .populate("founderId", "name email")
    .lean();

console.log("check chat", chats);

console.log('check chat',chats)
  return chats;
};

export const ChatServices = {
  createChatIntoDB,
  addMessageIntoDB,
  getChatsFromDB,
};