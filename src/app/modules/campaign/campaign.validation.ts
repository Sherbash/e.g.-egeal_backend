import { z } from "zod";

const createCampaignSchema = z.object({
  body: z.object({
    campaignName: z.string().min(1, "Campaign name is required"),
    description: z
      .string()
      .min(10, "Description must be at least 10 characters"),
    budget: z.number().min(10, "Minimum budget is $10"),
    startDate: z.date().optional(),
    endDate: z.date().optional(),
  }),
});

const updateCampaignSchema = z.object({
  body: z.object({
    campaignName: z.string().min(1, "Campaign name is required").optional(),
    description: z
      .string()
      .min(10, "Description must be at least 10 characters")
      .optional(),
    budget: z.number().min(100, "Minimum budget is $100").optional(),
    startDate: z.date().optional(),
    endDate: z.date().optional(),
  }),
});

const addInfluencerSchema = z.object({
  influencerId: z.string().min(1, "Influencer ID is required"),
});

const updateInfluencerStatusSchema = z.object({
  status: z.enum(["approved", "rejected", "completed"]),
});

export const CampaignValidation = {
  createCampaignSchema,
  updateCampaignSchema,
  addInfluencerSchema,
  updateInfluencerStatusSchema,
};
