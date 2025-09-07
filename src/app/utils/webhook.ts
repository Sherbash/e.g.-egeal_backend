import Stripe from "stripe";
import status from "http-status";
import { Interval, IPackage } from "../modules/package/package.interface";
import AppError from "../errors/appError";
import mongoose from "mongoose";
import { SubscriptionModel } from "../modules/package/package.model";
import UserModel from "../modules/user/user.model";
import { PaymentStatus } from "../modules/packageSubscription/packageSubscription.interface";
// import { PaymentStatus } from "../modules/payment/payment.interface";
// Helper function to calculate end date based on package interval
// Helper function to calculate end date based on package interval
const calculateEndDate = (startDate: Date, interval: Interval, intervalCount: number): Date => {
  const endDate = new Date(startDate);

  switch (interval) {
    case Interval.DAY:
      endDate.setDate(endDate.getDate() + intervalCount);
      break;
    case Interval.WEEK:
      endDate.setDate(endDate.getDate() + 7 * intervalCount);
      break;
    case Interval.MONTH:
      endDate.setMonth(endDate.getMonth() + intervalCount);
      if (endDate.getDate() !== startDate.getDate()) {
        endDate.setDate(0); // Set to last day of previous month
      }
      break;
    case Interval.YEAR:
      endDate.setFullYear(endDate.getFullYear() + intervalCount);
      break;
    default:
      throw new AppError(status.BAD_REQUEST, `Unsupported interval: ${interval}`);
  }

  return endDate;
};

const handlePaymentIntentSucceeded = async (paymentIntent: Stripe.PaymentIntent) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Find subscription with package details
    const subscription = await SubscriptionModel.findOne({ stripePaymentId: paymentIntent.id })
      .populate("packageId")
      .session(session);

    if (!subscription) {
      throw new AppError(status.NOT_FOUND, `Subscription not found for payment ID: ${paymentIntent.id}`);
    }

    const pkg = subscription.packageId as unknown as IPackage;
    if (!pkg) {
      throw new AppError(status.NOT_FOUND, "Package not found for this subscription");
    }

    if (paymentIntent.status !== "succeeded") {
      throw new AppError(status.BAD_REQUEST, "Payment intent is not in succeeded state");
    }

    const startDate = new Date();
    let endDate: Date | null = null;
    if (pkg.packageType !== "lifetime" && pkg.interval && pkg.intervalCount) {
      endDate = calculateEndDate(startDate, pkg.interval, pkg.intervalCount);
    }

    // Update subscription
    await SubscriptionModel.updateOne(
      { _id: subscription._id },
      {
        paymentStatus: PaymentStatus.COMPLETED,
        startDate,
        endDate,
      },
      { session }
    );

    // Find all active subscriptions to determine the latest endDate
    const activeSubscriptions = await SubscriptionModel.find({
      userId: subscription.userId,
      paymentStatus: PaymentStatus.COMPLETED,
      $or: [{ endDate: { $gte: new Date() } }, { endDate: null }],
    }).session(session);

    const latestEndDate = activeSubscriptions.reduce((latest: Date | null, sub) => {
      if (!sub.endDate) return null; // Lifetime subscriptions have no end date
      if (!latest || (sub.endDate && sub.endDate > latest)) return sub.endDate;
      return latest;
    }, endDate);

    // Update user's subscriptions array and planExpiration
    await UserModel.updateOne(
      { _id: subscription.userId },
      { 
        $addToSet: { subscriptions: subscription._id },
        $set: {
          isSubscribed: true,
          planExpiration: latestEndDate || undefined, // Use undefined for lifetime packages
        },
      },
      { session }
    );

    await session.commitTransaction();
  } catch (error: any) {
    await session.abortTransaction();
    console.error("Error in handlePaymentIntentSucceeded:", {
      error: error.message,
      stack: error.stack,
      paymentIntentId: paymentIntent.id,
    });
    throw error instanceof AppError ? error : new AppError(status.INTERNAL_SERVER_ERROR, `Failed to handle payment success: ${error.message}`);
  } finally {
    session.endSession();
  }
};

const handlePaymentIntentFailed = async (paymentIntent: Stripe.PaymentIntent) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Find subscription
    const subscription = await SubscriptionModel.findOne({ stripePaymentId: paymentIntent.id }).session(session);
    if (!subscription) {
      throw new AppError(status.NOT_FOUND, `Subscription not found for payment ID: ${paymentIntent.id}`);
    }

    // Update subscription status to CANCELED
    await SubscriptionModel.updateOne(
      { _id: subscription._id },
      {
        paymentStatus: PaymentStatus.CANCELED,
        endDate: new Date(),
      },
      { session }
    );

    await session.commitTransaction();
  } catch (error: any) {
    await session.abortTransaction();
    console.error("Error in handlePaymentIntentFailed:", {
      error: error.message,
      stack: error.stack,
      paymentIntentId: paymentIntent.id,
    });
    throw error instanceof AppError ? error : new AppError(status.INTERNAL_SERVER_ERROR, `Failed to handle payment failure: ${error.message}`);
  } finally {
    session.endSession();
  }
};

export { calculateEndDate, handlePaymentIntentSucceeded, handlePaymentIntentFailed };