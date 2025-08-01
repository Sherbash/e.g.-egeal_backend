import { Schema, model, Types } from "mongoose";
import { IPayment, PaymentStatus } from "./payment.interface";

const paymentSchema = new Schema<IPayment>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    toolName: { type: String, required: true },
    toolId: { type: String, required: true },
    influencerId: String,
    price: { type: Number, required: true },
    stripeSessionId: { type: String, required: true, unique: true },
    paymentIntentId: { type: String, required: true, unique: true }, // New field
    status: {
      type: String,
      enum: Object.values(PaymentStatus),
      default: PaymentStatus.PENDING,
      required: true,
    },
  },
  { timestamps: true }
);

export const Payment = model<IPayment>("Payment", paymentSchema);