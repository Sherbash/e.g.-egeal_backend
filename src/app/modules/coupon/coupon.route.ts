import { Router } from "express";
import auth from "../../middleware/auth";
import { CouponControllers } from "./coupon.controller";
import { UserRole } from "../user/user.interface";
import validateRequest from "../../middleware/validateRequest";
import { CouponValidations } from "./coupon.validation";

const router = Router();

//! Create coupon (Admin & Founder)
router.post(
  "/create-coupon",
  auth(UserRole.ADMIN, UserRole.FOUNDER),

  validateRequest(CouponValidations.createCouponSchema),
  CouponControllers.createCoupon
); 

//! Get all coupons by Admin or Founder
router.get(
  "/get-all-coupons/:userId",
  auth(UserRole.ADMIN, UserRole.FOUNDER),
  CouponControllers.getAllCouponsByUserIdFromDB
);

//! Get Single Coupon by Id with AdminId or FounderId
router.get(
  "/get-single-coupon/:couponId/:userId",
  auth(UserRole.ADMIN, UserRole.FOUNDER),
  CouponControllers.getSingleCouponByIdWithUserIdFromDB
);

//! Update coupon (Admin or Founder)
router.patch(
  "/update-single-coupon/:couponId/:userId",
  auth(UserRole.ADMIN, UserRole.FOUNDER),
  CouponControllers.updateSingleCouponByIdWithUserIdIntoDB
);

//! Soft Delete coupon (Admin or Founder)
router.patch(
  "/soft-delete-single-coupon/:couponId/:userId",
  auth(UserRole.ADMIN, UserRole.FOUNDER),
  CouponControllers.softDeleteSingleCouponByIdWithUserIdIntoDB
);


router.post(
  "/get-package-coupon",
  // auth(UserRole.USER, UserRole.INFLUENCER, UserRole.FOUNDER),
  validateRequest(CouponValidations.getPackageCouponSchema),
  CouponControllers.getPackageCouponByCode
);


router.get(
  "/:id",
  auth(UserRole.ADMIN, UserRole.FOUNDER),
  CouponControllers.getMyCoupons
);

//! Apply coupon (User applies at checkout)
router.post(
  "/apply",
  auth(UserRole.USER, UserRole.INFLUENCER, UserRole.FOUNDER),
  CouponControllers.applyCoupon
);

router.post(
  "/admin-coupon-apply",
  auth(UserRole.USER, UserRole.INFLUENCER, UserRole.FOUNDER),
  CouponControllers.applyCouponForAdmin
)

export const CouponRoutes = router;
