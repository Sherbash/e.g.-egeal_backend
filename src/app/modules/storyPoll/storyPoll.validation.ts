import { z } from "zod";

// Create story validation
const createStorySchema = z.object({
  body: z.object({
    description: z.string(),
    link: z.string().optional(),
  }),
});

const updateStorySchema = z.object({
    body: z.object({
    description: z.string().optional(),
    link: z.string().optional(),
  }),
})

// Vote validation
const voteSchema = z.object({
  body: z.object({
   pollChoiceIndex: z.number().int().min(0),
  }),
});

export const StoryValidation = {
  createStorySchema,
  voteSchema,
  updateStorySchema
};
