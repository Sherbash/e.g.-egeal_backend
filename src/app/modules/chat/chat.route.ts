import { Router } from "express";
import { ChatControllers } from "./chat.controller";
import auth from "../../middleware/auth";
import { UserRole } from "../user/user.interface";

const router = Router();

router.post(
  "/",
  auth(UserRole.INFLUENCER, UserRole.FOUNDER, UserRole.INVESTOR),
  ChatControllers.createChat
);

router.post(
  "/:id/messages",
  auth(UserRole.INFLUENCER, UserRole.FOUNDER, UserRole.INVESTOR),
  ChatControllers.addMessage
);

router.get(
  "/",
  auth(UserRole.INFLUENCER, UserRole.FOUNDER, UserRole.INVESTOR),
  ChatControllers.getChats
);

export const ChatRoutes = router;
