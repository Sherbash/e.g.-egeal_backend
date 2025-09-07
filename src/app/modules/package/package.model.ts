import mongoose, { model, Schema } from "mongoose";
import { IPackage, ISubscription, Interval, PaymentStatus, PackageType } from "./package.interface";
import { UserRole } from "../user/user.interface";

const packageSchema = new Schema<IPackage>(
  {
    packageName: { type: String, required: true },
    amount: { type: Number, required: true, min: 0 },
    currency: { type: String, required: true, length: 3 },
    packageType: { type: String, enum: Object.values(PackageType), required: true },
    interval: { type: String, enum: Object.values(Interval), required: false },
    intervalCount: { type: Number, min: 1, required: false },
    freeTrialDays: { type: Number, min: 0, default: 0 },
    productId: { type: String, required: true },
    priceId: { type: String, required: true },
    active: { type: Boolean, default: true },
    description: { type: String, maxLength: 500, default: null },
    features: { type: Schema.Types.Mixed, default: [] },
    promotionalMessage: { type: String, maxLength: 1000, default: null },
    whyThisPackage: {
      type: {
        title: { type: String, required: true },
        answer: { type: String, required: true },
      },
      required: false,
      default: null,
    },
    isForHome: { type: Boolean, default: false },
    roles: [{ type: String, enum: Object.values(UserRole), default: [] }],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

const SubscriptionSchema = new Schema<ISubscription>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    packageId: { type: Schema.Types.ObjectId, ref: "Package", required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date },
    amount: { type: Number, required: true },
    originalAmount: { type: Number }, // New field
    stripePaymentId: { type: String, required: true, unique: true },
    paymentStatus: { type: String, enum: Object.values(PaymentStatus), required: true },
    appliedCouponId: { type: Schema.Types.ObjectId, ref: "Coupon" }, // New field
    couponCode: { type: String }, // New field
    discountAmount: { type: Number }, // New field
  },
  { timestamps: true }
);

export const PackageModel = mongoose.model<IPackage>("Package", packageSchema);
export const SubscriptionModel = model<ISubscription>("Subscription", SubscriptionSchema);