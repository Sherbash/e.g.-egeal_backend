import { z } from "zod";

// const influencerValidationSchema = z.object({
//   body: z.object({
//     userId: z.string({
//       required_error: "User ID is required",
//     }),
//     affiliations: z.array(z.string()).optional(),
//     influencerId: z.string({
//       required_error: "Influencer ID is required",
//     }),
//     additionalNotes: z.string().optional(),
//   }),
// });

const influencerUpdateValidationSchema = z.object({
  body: z.object({
    userId: z.string().optional(),
    affiliations: z.array(z.string()).optional(),
    influencerId: z.string().optional(),
    additionalNotes: z.string().optional(),
  }),
});

export const InfluencerValidation = {
//   influencerValidationSchema,
  influencerUpdateValidationSchema,
};