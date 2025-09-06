// waitlist.validation.ts
import { z } from "zod";

const homePopUpValidationSchema = z.object({
  body: z.object({
    firstAnswer: z.string().min(1, "This field is required"),
    secondAnswer: z.string().min(1, "This field is required"),
    // toolId: z.string().min(1, "This field is required"),
  }),
});

// const waitlistResponseSchema = z.array(
//   z.object({
//     email: z.string().email(),
//     name: z.string().optional(),
//     toolId: z.string(),
//     joinedAt: z.string(),
//   })
// );

export const homePopUpValidation = {
  homePopUpValidationSchema,
};