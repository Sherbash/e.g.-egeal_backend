import { Router } from "express";
import auth from "../../middleware/auth";
import { UserRole } from "../user/user.interface";
import { HypeWaitlistController } from "./hype-waitlist.controller";


const router = Router();

router.post(
  "/create-waitlist-lead",
  auth(UserRole.FOUNDER, UserRole.INFLUENCER),
  HypeWaitlistController.createHypeWaitList
)

export const HypeWaitlistRoutes = router;