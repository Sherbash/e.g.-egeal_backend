import { z } from "zod";

const submitProofSchema = z.object({
  body: z.object({
    campaignId: z
      .string()
      .regex(/^[0-9a-fA-F]{24}$/, "Invalid campaignId")
      .optional(),
    proofType: z.enum([
      "giveaway",
      "gig-submission",
      "referral",
      "social-post",
      "testimonial",
      "payment",
    ]),
    proofLink: z.string().url("Invalid proof link"),
    proofAbout: z.string().min(10, "Proof description too short"),
  }),
});
export const ProofValidation = {
  submitProofSchema,
};
