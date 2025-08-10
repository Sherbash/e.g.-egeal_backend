import { Request, Response } from "express";
import status from "http-status";
import catchAsync from "../../utils/catchAsync";
import { ParticipantServices } from "./participant.service";
import { IUser } from "../user/user.interface";

const createParticipant = catchAsync(async (req: Request, res: Response) => {
  const participantData = req.body;

  const result = await ParticipantServices.createParticipant(
    participantData,
    req.user as IUser
  );
  res.status(status.CREATED).json({
    success: true,
    message: "Participated successfully",
    data: result,
  });
});

const getAllParticipants = catchAsync(async (req: Request, res: Response) => {
  const { giveawayId } = req.params;

  const result = await ParticipantServices.getAllParticipants(
    giveawayId,
    req.user.id
  );

  res.status(status.OK).json({
    success: true,
    message: "Participants fetched successfully",
    data: result,
  });
});

const getParticipant = catchAsync(async (req: Request, res: Response) => {
  const { participantId } = req.params;

  const result = await ParticipantServices.getParticipant(
    participantId,
    req.user.id
  );

  res.status(status.OK).json({
    success: true,
    message: "Participant details fetched successfully",
    data: result,
  });
});

const pickWinner = catchAsync(async (req: Request, res: Response) => {
  const { giveawayId } = req.params;

  const result = await ParticipantServices.pickWinner(
    giveawayId,
    req.user as IUser
  );

  res.status(status.OK).json({
    success: true,
    message: "Winner picked successfully",
    data: result,
  });
});

export const ParticipantController = {
  createParticipant,
  getAllParticipants,
  getParticipant,
  pickWinner,
};
