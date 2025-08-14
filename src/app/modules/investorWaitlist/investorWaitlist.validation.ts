import { z } from "zod";

const investorWaitlistSchema = z.object({
  body: z.object({
    email: z.string().email("Invalid email address"),
    toolId: z.string().nonempty("Tool ID is required"),
    investmentAmount: z.number().positive("Investment amount must be positive"),
  }),
});

export const investorWaitlistValidation = {
  investorWaitlistSchema,
};
