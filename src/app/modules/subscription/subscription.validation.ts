import { z } from "zod";

const emailSubscriptionSchema = z.object({
  body: z.object({
    email: z.string().email("Invalid email address"),
    name: z.string().optional(),
  }),
});

export const subscriptionValidation = {
  emailSubscriptionSchema,
};
