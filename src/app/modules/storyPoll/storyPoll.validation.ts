import { z } from "zod";

// Create story validation
const createStorySchema = z.object({
  body: z.object({
    title: z.string(),
    link: z.string().url().optional(),
    pollChoices: z
      .array(
        z.object({
          text: z.string().min(1),
        })
      )
      .max(4)
      .optional(),
  }),
});

// Vote validation
const voteSchema = z.object({
  body: z.object({
   pollChoiceIndex: z.number().int().min(0),
  }),
});

export const StoryValidation = {
  createStorySchema,
  voteSchema,
};
