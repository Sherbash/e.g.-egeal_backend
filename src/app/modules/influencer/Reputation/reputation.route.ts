import express from "express";
import ReputationController from "./reputation.controller";

const router = express.Router();

// GET /api/reputation/leaderboard - Get top influencers
router.get('/leaderboard', ReputationController.getLeaderboard);

// GET /api/reputation/:id - Get influencer reputation
router.get('/:id', ReputationController.getReputation);


// POST /api/reputation/:id/recalculate - Manual recalculate
router.post('/:id/recalculate', ReputationController.recalculateReputation);


export const ReputationRoutes = router;