import { Router } from "express";
import { AffiliateControllers } from "./affiliate.controller";
import validateRequest from "../../middleware/validateRequest";
import { affiliateValidation } from "./affiliate.validation";
import auth from "../../middleware/auth";
import { UserRole } from "../user/user.interface";

const router = Router();

router.post(
  "/",
  // auth(UserRole.ADMIN, UserRole.INFLUENCER),
  validateRequest(affiliateValidation.createAffiliateZodSchema),
  AffiliateControllers.createAffiliate
);

router.post(
  "/increment-click",
  validateRequest(affiliateValidation.incrementClickZodSchema),
  AffiliateControllers.incrementClickApi
);

router.get(
  "/influencer/:influencerId",
  // auth(UserRole.ADMIN, UserRole.INFLUENCER),
  AffiliateControllers.getAffiliatesByInfluencerId
);

// router.get("/tool/:toolId", AffiliateControllers.handleAffiliateUrl);

export const AffiliateRoutes = router;
