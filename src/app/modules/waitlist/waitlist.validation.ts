// waitlist.validation.ts
import { z } from "zod";

const waitlistSchema = z.object({
  body: z.object({
    email: z.string().email("Invalid email address"),
    name: z.string().optional(),
    toolId: z.string().min(1, "Tool ID is required"),
  }),
});

const waitlistResponseSchema = z.array(
  z.object({
    email: z.string().email(),
    name: z.string().optional(),
    toolId: z.string(),
    joinedAt: z.string(),
  })
);

export const waitlistValidation = {
  waitlistSchema,
  waitlistResponseSchema,
};