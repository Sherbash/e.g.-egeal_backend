import { z } from "zod";

// const founderValidationSchema = z.object({
//   body: z.object({
//     userId: z.string({
//       required_error: "User ID is required",
//     }),
//     tools: z.array(z.string()).optional(),
//     additionalNotes: z.string().optional(),
//   }),
// });

const founderUpdateValidationSchema = z.object({
  body: z.object({
    userId: z.string().optional(),
    tools: z.array(z.string()).optional(),
    additionalNotes: z.string().optional(),
  }),
});

export const FounderValidation = {
  //   founderValidationSchema,
  founderUpdateValidationSchema,
};
