import { z } from "zod";

const CreateGiveawaySchema = z.object({
  body: z.object({
    title: z.string().min(3, "Title is too short"),
    priceMoney: z.number().min(0, "Price money must be a non-negative number"),
    description: z.string().optional(),
    rules: z.array(z.string().min(1)).min(1, "At least one rule is required"),
    deadline: z.coerce.date().optional(),
    winnerId: z.string().nullable().optional(),
    participants: z.array(z.string()).optional(), // ObjectIds
    status: z.enum(["ongoing", "closed", "winner_selected"]).optional(),
  }),
});

const updateGiveawaySchema = z.object({
  body: z.object({
    title: z.string().min(1).optional(),
    priceMoney: z.number().min(0, "Price money must be a non-negative number").optional(),
    description: z.string().optional(),
    rules: z.array(z.string()).optional(),
    deadline: z.coerce.date().optional(),
    winnerId: z.string().optional(),
    participants: z.array(z.string()).optional(),
    status: z.enum(["ongoing", "closed", "winner_selected"]).optional(),
  }),
});

export const GiveawayValidation = {
  CreateGiveawaySchema,
  updateGiveawaySchema,
};
