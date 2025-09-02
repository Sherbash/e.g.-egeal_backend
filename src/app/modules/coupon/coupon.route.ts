import { Router } from "express";
import auth from "../../middleware/auth";
import { CouponControllers } from "./coupon.controller";
import { UserRole } from "../user/user.interface";
import validateRequest from "../../middleware/validateRequest";
import { CouponValidations } from "./coupon.validation";

const router = Router();

// Create coupon (Admin & Founder)
router.post(
  "/create-coupon",
  auth(UserRole.ADMIN, UserRole.FOUNDER),

  validateRequest(CouponValidations.createCouponSchema),
  CouponControllers.createCoupon
); 

// Get all coupons (Admin)
router.get("/", auth(UserRole.ADMIN), CouponControllers.getAllCoupons);

router.get(
  "/:id",
  auth(UserRole.ADMIN, UserRole.FOUNDER),
  CouponControllers.getMyCoupons
);

// Apply coupon (User applies at checkout)
router.post(
  "/apply",
//   auth(UserRole.USER, UserRole.ADMIN, UserRole.FOUNDER),
  CouponControllers.applyCoupon
);

export const CouponRoutes = router;
