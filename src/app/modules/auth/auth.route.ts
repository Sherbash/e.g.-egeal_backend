import { Router } from "express";
import { AuthController } from "./auth.controller";
import validateRequest from "../../middleware/validateRequest";
import { AuthValidation } from "./auth.validation";

const router = Router();

router.post(
  "/login",
  validateRequest(AuthValidation.authValidationSchema),
  AuthController.loginUser
);

export const AuthRoutes = router;
