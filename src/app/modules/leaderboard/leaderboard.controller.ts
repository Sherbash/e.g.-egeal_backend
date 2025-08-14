import { Request, Response } from "express";
import status from "http-status";
import catchAsync from "../../utils/catchAsync";
import { LeaderboardService } from "./leaderboard.service";
import sendResponse from "../../utils/sendResponse";

const getLeaderboard = catchAsync(async (req: Request, res: Response) => {
  const result = await LeaderboardService.getLeaderboard();

  sendResponse(res, {
    success: true,
    statusCode: status.OK,
    message: "Leaderboard fetched successfully",
    data: result,
  });
});

export const LeaderboardController = {
  getLeaderboard,
};
