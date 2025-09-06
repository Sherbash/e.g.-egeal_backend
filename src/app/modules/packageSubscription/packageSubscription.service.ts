import mongoose from "mongoose";
import UserModel from "../user/user.model";
import AppError from "../../errors/appError";
import status from "http-status";
import { PackageModel, SubscriptionModel } from "../package/package.model";
import { ISubscription, PackageType } from "../package/package.interface";
import { calculateEndDate, handlePaymentIntentFailed, handlePaymentIntentSucceeded } from "../../utils/webhook";
import { stripe } from "../../utils/stripe";
import Stripe from "stripe";
import { PaymentStatus } from "./packageSubscription.interface";

const createSubscription = async (userId: string, packageId: string) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // 1. Verify user exists
    const user = await UserModel.findById(userId).session(session);
    if (!user) {
      throw new AppError(status.NOT_FOUND, "User not found");
    }

    // 2. Verify package exists
    const pkg = await PackageModel.findById(packageId).session(session);
    if (!pkg) {
      throw new AppError(status.NOT_FOUND, "Package not found");
    }

    // 3. Check for existing active subscription for the same package
    const existingActiveSubscription = await SubscriptionModel.findOne({
      userId,
      packageId,
      paymentStatus: { $in: [PaymentStatus.PENDING, PaymentStatus.COMPLETED] },
      $or: [
        { endDate: { $gte: new Date() } }, // For monthly/yearly packages with valid endDate
        { endDate: null }, // For lifetime packages
      ],
    }).session(session);

    if (existingActiveSubscription) {
      throw new AppError(status.BAD_REQUEST, "You already have an active subscription for this package");
    }

    // 4. Calculate end date based on package type and interval
    const startDate = new Date();
    let endDate: Date | null = null;

    if (pkg.packageType === PackageType.MONTHLY || pkg.packageType === PackageType.YEARLY) {
      if (!pkg.interval || !pkg.intervalCount) {
        throw new AppError(status.BAD_REQUEST, "Package interval or intervalCount missing");
      }
      endDate = calculateEndDate(startDate, pkg.interval, pkg.intervalCount);
    } else if (pkg.packageType === PackageType.LIFETIME) {
      endDate = null; // Lifetime packages have no end date
    }

    // 5. Create payment intent in Stripe
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(pkg.amount * 100),
      currency: pkg.currency,
      metadata: {
        userId: user._id.toString(),
        packageId: pkg._id.toString(),
      },
      automatic_payment_methods: {
        enabled: true,
      },
    });

    // 6. Handle existing subscription
    const existingSubscription = await SubscriptionModel.findOne({ userId }).session(session);

    let subscription: ISubscription;
    if (existingSubscription && existingSubscription.paymentStatus === PaymentStatus.PENDING) {
      const updatedSubscription = await SubscriptionModel.findOneAndUpdate(
        { userId },
        {
          packageId,
          stripePaymentId: paymentIntent.id,
          startDate,
          amount: pkg.amount,
          endDate: existingSubscription.endDate || endDate,
          paymentStatus: PaymentStatus.PENDING,
        },
        { new: true, session }
      ).lean();

      if (!updatedSubscription) {
        throw new AppError(status.INTERNAL_SERVER_ERROR, "Failed to update existing subscription");
      }
      subscription = updatedSubscription as ISubscription;
    } else {
      // 7. Create new subscription
      const newSubscriptions = await SubscriptionModel.create(
        [
          {
            userId,
            packageId,
            startDate,
            amount: pkg.amount,
            stripePaymentId: paymentIntent.id,
            paymentStatus: PaymentStatus.PENDING,
            endDate,
          },
        ],
        { session }
      );

      if (!newSubscriptions || newSubscriptions.length === 0) {
        throw new AppError(status.INTERNAL_SERVER_ERROR, "Failed to create subscription");
      }
      subscription = newSubscriptions[0].toObject() as ISubscription;
    }

    // 8. Update user's subscriptions array
    await UserModel.findByIdAndUpdate(
      userId,
      { $addToSet: { subscriptions: subscription._id } },
      { session }
    );

    await session.commitTransaction();
    return {
      subscription,
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    };
  } catch (error) {
    await session.abortTransaction();
    throw error instanceof AppError ? error : new AppError(status.INTERNAL_SERVER_ERROR, "Failed to create subscription");
  } finally {
    session.endSession();
  }
};

const getAllSubscription = async (query: Record<string, any>) => {
  const page = parseInt(query.page as string) || 1;
  const limit = parseInt(query.limit as string) || 10;
  const skip = (page - 1) * limit;

  const filter: any = {};
  if (query.searchTerm) {
    filter.$or = [
      { paymentStatus: { $regex: query.searchTerm, $options: "i" } },
    ];
  }

  const subscriptions = await SubscriptionModel.find(filter)
    .populate({
      path: "userId",
      select: "_id fullName email profilePic role isSubscribed planExpiration",
    })
    .populate("packageId")
    .skip(skip)
    .limit(limit)
    .lean();

  const total = await SubscriptionModel.countDocuments(filter);

  return {
    meta: {
      page,
      limit,
      total,
      totalPage: Math.ceil(total / limit),
    },
    data: subscriptions,
  };
};

const getSingleSubscription = async (subscriptionId: string) => {
  const result = await SubscriptionModel.findById(subscriptionId)
    .populate({
      path: "userId",
      select: "_id fullName email profilePic role isSubscribed planExpiration",
    })
    .populate("packageId")
    .lean();

  if (!result) {
    throw new AppError(status.NOT_FOUND, "Subscription not found!");
  }

  return result;
};

const getMySubscription = async (userId: string) => {
  const user = await UserModel.findById(userId);
  if (!user) {
    throw new AppError(status.NOT_FOUND, "User not found");
  }

  const result = await SubscriptionModel.findOne({ userId })
    .populate({
      path: "userId",
      select: "_id fullName email profilePic role isSubscribed planExpiration",
    })
    .populate("packageId")
    .lean();

  if (!result) {
    throw new AppError(status.NOT_FOUND, "Subscription not found!");
  }

  return result;
};

const updateSubscription = async (subscriptionId: string, data: Partial<ISubscription>) => {
  const subscription = await SubscriptionModel.findById(subscriptionId);
  if (!subscription) {
    throw new AppError(status.NOT_FOUND, "Subscription not found");
  }

  const result = await SubscriptionModel.findByIdAndUpdate(subscriptionId, data, { new: true }).lean();
  return result;
};

const deleteSubscription = async (subscriptionId: string) => {
  const subscription = await SubscriptionModel.findById(subscriptionId);
  if (!subscription) {
    throw new AppError(status.NOT_FOUND, "Subscription not found");
  }

  await SubscriptionModel.findByIdAndUpdate(subscriptionId, {
    paymentStatus: PaymentStatus.CANCELED,
    endDate: new Date(),
  });

  return null;
};

const handleStripeWebhook = async (event: Stripe.Event) => {
  try {
    switch (event.type) {
      case "payment_intent.succeeded":
        await handlePaymentIntentSucceeded(event.data.object);
        break;
      case "payment_intent.payment_failed":
        await handlePaymentIntentFailed(event.data.object);
        break;
      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    return { received: true };
  } catch (error) {
    console.error("Error handling Stripe webhook:", error);
    throw new AppError(status.INTERNAL_SERVER_ERROR, "Webhook handling failed");
  }
};

export const SubscriptionServices = {
  createSubscription,
  getAllSubscription,
  getSingleSubscription,
  getMySubscription,
  updateSubscription,
  deleteSubscription,
  handleStripeWebhook,
};