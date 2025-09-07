import { z } from "zod";

const SubscriptionValidationSchema = z.object({
  body: z.object({
    packageId: z.string().min(1, "Package ID is required"),
    couponCode: z.string().optional(),
  }),
});

export const SubscriptionValidation = {
  SubscriptionValidationSchema,
};