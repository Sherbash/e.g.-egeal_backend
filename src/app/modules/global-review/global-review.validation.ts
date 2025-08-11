import { Types } from "mongoose";
import z from "zod";

// Zod schema for runtime validation
const ReviewZodSchema = z.object({
  body: z.object({
    entityId: z.instanceof(Types.ObjectId, {
      message: "entityId must be a valid MongoDB ObjectId",
    }),
    entityType: z.enum(["story", "tool", "product", "influencer"], {
      message: "entityType must be one of: story, tool, product, influencer",
    }),
    rating: z.number().int().min(1).max(5, {
      message: "rating must be an integer between 1 and 5",
    }),
    reviewText: z.string().min(1, {
      message: "reviewText is required and cannot be empty",
    }),
    reviewVideoUrl: z.string().url().optional().or(z.literal("")),
    proofUrl: z.string().url().optional().or(z.literal("")),
  }),
});

export const ReviewValidation = {
  ReviewZodSchema,
};
