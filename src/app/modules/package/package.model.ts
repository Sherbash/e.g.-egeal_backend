import mongoose, { Schema } from "mongoose";
import { Interval, IPackage, ISubscription, PaymentStatus } from "./package.interface";

const packageSchema = new Schema<IPackage>(
  {
    packageName: { type: String, required: true },
    amount: { type: Number, required: true, min: 0 },
    currency: { type: String, required: true, length: 3 },
    interval: { type: String, enum: Object.values(Interval), default: Interval.MONTH },
    intervalCount: { type: Number, required: true, min: 1 },
    freeTrialDays: { type: Number, min: 0, default: 0 },
    productId: { type: String, required: true },
    priceId: { type: String, required: true },
    active: { type: Boolean, default: true },
    description: { type: String, maxLength: 500, default: null },
    features: { type: Schema.Types.Mixed, default: [] },
    promotionalMessage: { type: String, maxLength: 1000, default: null }, // New optional field
    whyThisPackage: {
      type: {
        title: { type: String, required: true },
        answer: { type: String, required: true },
      },
      required: false,
      default: null,
    }, // New optional field
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

const subscriptionSchema = new Schema<ISubscription>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    packageId: { type: Schema.Types.ObjectId, ref: "Package", required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, default: null },
    amount: { type: Number, required: true, min: 0 },
    stripePaymentId: { type: String, required: true, unique: true },
    paymentStatus: {
      type: String,
      enum: Object.values(PaymentStatus),
      default: PaymentStatus.PENDING,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

export const PackageModel = mongoose.model<IPackage>("Package", packageSchema);
export const SubscriptionModel = mongoose.model<ISubscription>("Subscription", subscriptionSchema);