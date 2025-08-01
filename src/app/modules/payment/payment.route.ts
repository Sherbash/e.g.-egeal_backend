import { Router } from "express";
import { paymentController } from "./payment.controller";

const router = Router();

router.post("/create-checkout-session", paymentController.createCheckoutSession);
router.get("/confirm", paymentController.confirmPayment);
router.get("/:userId", paymentController.getPaymentsByUserId);

export const PaymentRoutes = router;