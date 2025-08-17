import mongoose, { Schema, Document } from "mongoose";
import { IProofUserInvite } from "./proofUserInvite.interface";

const proofUserInviteSchema = new Schema<IProofUserInvite>(
  {
    inviter: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    invitedUsers: [
      {
        name: { type: String, required: true },
        email: { type: String, required: true },
      },
    ],
    proofScreenshot: { type: String },
    confirmed: { type: Boolean, default: false },
    rewardGiven: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const ProofUserInviteModel = mongoose.model<IProofUserInvite>(
  "ProofUserInvite",
  proofUserInviteSchema
);

export default ProofUserInviteModel;
