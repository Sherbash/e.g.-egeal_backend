import { Router } from "express";
import { FounderController } from "./founder.controller";
import auth from "../../middleware/auth";
import { UserRole } from "../user/user.interface";

const router = Router();

router.get("/",FounderController.getAllFounder);
router.get("/get-founder--referral",auth(UserRole.ADMIN),FounderController.getAllFoundersByRefer);
router.post("/send-coupon-code",auth(UserRole.ADMIN),FounderController.sendCouponCodeController);

export const FounderRoutes = router;
