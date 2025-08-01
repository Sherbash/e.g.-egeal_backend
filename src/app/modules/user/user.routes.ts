import { Router } from "express";
import { UserController } from "./user.controller";
import validateRequest from "../../middleware/validateRequest";
import { UserValidation } from "./user.validation";
import auth from "../../middleware/auth";
import { UserRole } from "./user.interface";

const router = Router();

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
  auth(UserRole.ADMIN, UserRole.USER, UserRole.FOUNDER, UserRole.INFLUENCER, UserRole.INVESTOR),
  UserController.getSingleUser
);

router.post(
  "/",
  validateRequest(UserValidation.userValidationSchema),
  UserController.registerUser
);
router.get(
  "/",
  // validateRequest(UserValidation.userValidationSchema),
  UserController.getAllUsers
);

router.get(
  "/",
  // auth(),
  UserController.getAllUsers
);

router.get(
  "/:id",
  // auth(),
  UserController.getSingleUser
);

router.patch(
  "/:id",
  // auth(),
  validateRequest(UserValidation.userUpdateValidationSchema),
  UserController.updateUser
);

router.delete(
  "/:id",
  // auth(),
  UserController.deleteUser
);

export const UserRoutes = router;
