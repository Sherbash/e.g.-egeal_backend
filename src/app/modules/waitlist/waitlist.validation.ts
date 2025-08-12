import { z } from "zod";

const waitlistSchema = z.object({
  body: z.object({
    email: z.string().email("Invalid email address"),
    name: z.string().optional(),
  }),
});

export const waitlistValidation = {
  waitlistSchema,
};
