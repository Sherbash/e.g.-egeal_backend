import { z } from "zod";

const createBadgeSchema = z.object({
  body: z.object({
    name: z.string().nonempty("Badge name is required"),
    minScore: z.number().min(0, "Minimum score must be non-negative"),
    maxScore: z.number().min(0, "Maximum score must be non-negative"),
    iconUrl: z.string().url("Invalid icon URL"),
  }),
});

const updateBadgeSchema = z.object({
  body: z.object({
    name: z.string().nonempty("Badge name is required").optional(),
    minScore: z.number().min(0, "Minimum score must be non-negative").optional(),
    maxScore: z.number().min(0, "Maximum score must be non-negative").optional(),
    iconUrl: z.string().url("Invalid icon URL").optional(),
  }),
});

export const badgeValidation = {
  createBadgeSchema,
  updateBadgeSchema,
};