import express from "express";
import { LeaderboardController } from "./leaderboard.controller";

const router = express.Router();

router.get("/", LeaderboardController.getLeaderboard);

export const LeaderboardRoutes = router;