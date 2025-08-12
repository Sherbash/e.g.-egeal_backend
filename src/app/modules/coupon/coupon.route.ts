import { Router } from "express";
import auth from "../../middleware/auth";
import { UserRole } from "../user/user.interface";
import { CouponControllers } from "./coupon.controller";

const router = Router();

// Create coupon (Admin & Founder)
router.post(
  "/",
  auth(UserRole.ADMIN, UserRole.FOUNDER),
  CouponControllers.createCoupon
);

// Get all coupons
router.get("/", auth(UserRole.ADMIN), CouponControllers.getAllCoupons);

// Apply coupon (User applies at checkout)
router.post(
  "/apply",
  auth(UserRole.USER, UserRole.ADMIN, UserRole.FOUNDER),
  CouponControllers.applyCoupon
);

export const CouponRoutes = router;
