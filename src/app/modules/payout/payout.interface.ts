import { Types } from "mongoose";

export interface IPayoutRequest {
  name: string;
  email: string;
  influencerId: Types.ObjectId;
  amount: number;
  date: string; // ISO string
  paymentMethod: "bank" | "paypal" | "crypto" | "stripe";
  accountDetails: {
    bankName?: string;
    accountNumber?: string;
    accountHolderName?: string;
    routingNumber?: string;
    paypalEmail?: string;
    cryptoAddress?: string;
    cryptoNetwork?: string;
  };
  note?: string;
  status: "pending" | "approved" | "rejected" | "paid";
}
