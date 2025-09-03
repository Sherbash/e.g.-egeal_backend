import auth from "../../middleware/auth";
import { Router } from "express";
import { UserRole } from "../user/user.interface";
import { ContactPackageController } from "./contact-package.controller";

const router = Router();

router.post(
  "/create-contact-package",
  auth(UserRole.FOUNDER, UserRole.INFLUENCER),
  ContactPackageController.sendContactPackageEmail
);

export const ContactPackageRoutes = router;
