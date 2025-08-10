import { z } from "zod";

const ProofSchema = z.object({
  ruleTitle: z.string().min(1, "Rule title is required"),
  imageUrl: z.string().url("Image must be a valid URL"),
  verified: z.boolean().optional(),
});

const CreateParticipantSchema = z.object({
  body: z.object({
    giveawayId: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid giveaway ID"),
    socialUsername: z.string().min(1, "Social username is required"),
    videoLink: z.string().url("Invalid video URL"),
    inviteCode: z.string().min(1, "Invite code is required"),
    proofs: z.array(ProofSchema).optional(),
  }),
});

export const ParticipantValidation = {
  CreateParticipantSchema,
};
