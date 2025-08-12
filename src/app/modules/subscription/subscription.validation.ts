import { z } from "zod";

const emailSubscriptionSchema = z.object({
  body: z.object({
    email: z.string().email("Invalid email address"),
  }),
});

export const subscriptionValidation = {
  emailSubscriptionSchema,
};
