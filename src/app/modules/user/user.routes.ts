import { Router } from "express";
import validateRequest from "../../middleware/validateRequest";
import { UserValidation } from "./user.validation";
import { UserController } from "./user.controller";
import auth from "../../middleware/auth";
import { UserRole } from "./user.interface";

const router = Router();

router.post(
  "/",
  validateRequest(UserValidation.userValidationSchema),
  UserController.registerUser
);

router.post(
  "/verify-otp",
  validateRequest(UserValidation.verifyOtpValidationSchema),
  UserController.verifyOtp
);

router.get(
  "/me",
  auth(
    UserRole.ADMIN,
    UserRole.USER,
    UserRole.FOUNDER,
    UserRole.INFLUENCER,
    UserRole.INVESTOR
  ),
  UserController.myProfile
);

router.get(
  "/get-roleBase-info/:id",
  auth(
    UserRole.ADMIN,
    UserRole.USER,
    UserRole.FOUNDER,
    UserRole.INFLUENCER,
    UserRole.INVESTOR
  ),
  UserController.getSingleUser
);

router.get("/", UserController.getAllUsers);
router.get("/get-all-users", auth(UserRole.ADMIN), UserController.getAllUsersNeedForFrontendDeveloper);

router.patch(
  "/banned-user/:id",
  auth(UserRole.ADMIN),
  UserController.toggleUserStatus
);

router.get("/:id", UserController.getSingleUser);

router.patch(
  "/:id",
  validateRequest(UserValidation.userUpdateValidationSchema),
  UserController.updateUser
);

router.delete("/:id", UserController.deleteUser);

export const UserRoutes = router;
