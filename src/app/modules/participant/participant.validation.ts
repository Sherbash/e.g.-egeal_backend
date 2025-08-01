import { z } from "zod";

const ProofSchema = z.object({
  ruleTitle: z.string().min(1, "Rule title is required"),
  imageUrl: z.string().url("Image must be a valid URL"),
  verified: z.boolean().optional(),
});

const CreateParticipantSchema = z.object({
  body: z.object({
    giveawayId: z.string({ required_error: "Giveaway ID is required" }),
    socialUsername: z.string().optional(),
    videoLink: z.string().url("Video must be a valid URL").optional(),
    proofs: z.array(ProofSchema).min(1, "At least one proof is required"),
    isWinner: z.boolean().optional(),
  }),
});

export const ParticipantValidation = {
  CreateParticipantSchema,
};
