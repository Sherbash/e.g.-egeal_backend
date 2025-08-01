import { Request, Response } from "express";
import status from "http-status";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { paymentService } from "./payment.service";

const createCheckoutSession = catchAsync(async (req: Request, res: Response) => {
  const result = await paymentService.createCheckoutSession(req.body);
  
  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: "Checkout session created successfully",
    data: {
      checkoutUrl: result.url,
      sessionId: result.sessionId,
      // paymentIntentId: result.paymentIntentId
    },
  });
});

const confirmPayment = catchAsync(async (req: Request, res: Response) => {
  const sessionId = req.query.session_id as string;
  const payment = await paymentService.confirmPaymentAndSave(sessionId);

  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: "Payment confirmed successfully",
    data: {
      paymentId: payment._id,
      paymentIntentId: payment.paymentIntentId,
      amount: payment.price,
      status: payment.status
    },
  });
});

const getPaymentsByUserId = catchAsync(async (req: Request, res: Response) => {
  const payments = await paymentService.getPaymentsByUserId(req.params.userId);
  
  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: "Payments retrieved successfully",
    data: payments,
  });
});

export const paymentController = {
  createCheckoutSession,
  confirmPayment,
  getPaymentsByUserId,
};