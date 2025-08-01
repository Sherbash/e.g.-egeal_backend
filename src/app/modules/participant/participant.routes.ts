import { Router } from "express";
import { ParticipantController } from "./participant.controller";
import auth from "../../middleware/auth";
import validateRequest from "../../middleware/validateRequest";
import { ParticipantValidation } from "./participant.validation";
import { UserRole } from "../user/user.interface";

const router = Router();

// Participants can create their own participation
router.post(
  "/create-participant",
  auth(UserRole.USER, UserRole.ADMIN, UserRole.FOUNDER, UserRole.INFLUENCER),
  validateRequest(ParticipantValidation.CreateParticipantSchema),
  ParticipantController.createParticipant
);

// Only giveaway author can view all participants
router.get(
  "/giveaway/:giveawayId",
  auth(UserRole.ADMIN, UserRole.FOUNDER),
  ParticipantController.getAllParticipants
);

// Both participant and author can view single participation
router.get(
  "/:participantId",
  auth(UserRole.USER, UserRole.ADMIN, UserRole.FOUNDER),
  ParticipantController.getParticipant
);

// Only giveaway author can pick winner
router.post(
  "/giveaway/:giveawayId/pick-winner",
  auth(UserRole.ADMIN, UserRole.FOUNDER),
  ParticipantController.pickWinner
);

export const ParticipantRoutes = router;
