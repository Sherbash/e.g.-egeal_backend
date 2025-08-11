import { z } from "zod";

const payoutRequestSchema = z.object({
  name: z.string().min(2, "Name must have at least 2 characters"),
  email: z.string().email("Invalid email address"),
  influencerId: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid influencerId"),
  amount: z.number().positive("Amount must be greater than zero"),
  date: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Invalid date format, must be ISO string",
  }),
  paymentMethod: z.enum(["bank", "paypal", "crypto", "stripe"]),
  accountDetails: z.object({
    bankName: z.string().optional(),
    accountNumber: z.string().optional(),
    accountHolderName: z.string().optional(),
    routingNumber: z.string().optional(),
    paypalEmail: z.string().email().optional(),
    cryptoAddress: z.string().optional(),
    cryptoNetwork: z.string().optional(),
  }),
  note: z.string().optional(),
  status: z.enum(["pending", "approved", "rejected", "paid"]).optional().default("pending"),
});

export const payoutValidation = {
  payoutRequestSchema,
};