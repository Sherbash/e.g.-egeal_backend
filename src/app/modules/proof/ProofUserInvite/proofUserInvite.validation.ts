import { z } from "zod";

const createProofUserInviteSchema = z.object({
  body: z.object({
    invitedUsers: z
      .array(
        z.object({
          name: z.string().min(1, "Name is required"),
          email: z.string().email("Invalid email"),
        })
      )
      .min(1, "At least one invited user is required"),
    proofScreenshot: z.string().url("Proof screenshot must be a valid URL"),
  }),
});

const verifyProofUserInviteSchema = z.object({
  body: z.object({
    id: z.string().min(1, "ProofUserInvite ID is required"),
    confirmed: z.boolean().optional(),
    rewardGiven: z.boolean().optional(),
  }),
});


export const ProofUserInviteValidation = {
  createProofUserInviteSchema,
  verifyProofUserInviteSchema,
};