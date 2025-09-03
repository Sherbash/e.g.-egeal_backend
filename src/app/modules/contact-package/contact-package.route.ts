import auth from "../../middleware/auth";
import { Router } from "express";
import { UserRole } from "../user/user.interface";
import { ContactPackageController } from "./contact-package.controller";

const router = Router();

router.post(
  "/create-contact-package",
  auth(UserRole.FOUNDER, UserRole.INFLUENCER, UserRole.USER, UserRole.INVESTOR ),
  ContactPackageController.sendContactPackageEmail
);

router.post(
  "/store-info-from-package-popup",
  auth(UserRole.FOUNDER, UserRole.INFLUENCER, UserRole.USER, UserRole.INVESTOR ),
  ContactPackageController.storeInfoFromPackagePopup
);

export const ContactPackageRoutes = router;
