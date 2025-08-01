import { z } from "zod";

const createAffiliateZodSchema = z.object({
  body: z.object({
    influencerId: z.string().min(1, "Influencer ID is required"),
    toolId: z.string().min(1, "Tools ID is required"),
  }),
});


const incrementClickZodSchema = z.object({
  body: z.object({
    influencerId: z.string().min(1, "Influencer ID is required"),
    toolId: z.string().min(1, "Tool ID is required"),
    source: z.string().optional(), // NEW: optional
  }),
});

export const affiliateValidation = {
  createAffiliateZodSchema,
  incrementClickZodSchema,
};
