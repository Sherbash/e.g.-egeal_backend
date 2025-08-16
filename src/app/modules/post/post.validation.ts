//   {
//     authorId: { type: Schema.Types.ObjectId, ref: "User", required: true },
//     title: { type: String },
//     description: { type: String },
//     proofs: [{ type: Schema.Types.ObjectId, ref: "Proof" }],
//     deadline: Date,
//   },

import z from "zod";

const postValidationSchema = z.object({
  body: z.object({
    title: z.string().min(1, "Title is required"),
    description: z.string().min(1, "Description is required").optional(),
    proofs: z.array(z.string()).optional(),
  }),
});

//  validateRequest({
//     proofLink: z.string().url(),
//     proofAbout: z.string().min(10),
//     proofType: z.enum([
//       "giveaway",
//       "gig-submission", 
//       "referral",
//       "post",
//       "social-post",
//       "testimonial",
//       "payment"
//     ]).optional()
//   }),


export const PostValidation = {
  postValidationSchema,
};
