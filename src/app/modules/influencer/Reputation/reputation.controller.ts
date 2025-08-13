import { Request, Response } from 'express';
import { Influencer } from '../influencer.model';
import { InfluencerReputationService } from './reputation.service';
const ReputationController = {
  // Get influencer reputation
  async getReputation(req: Request, res: Response) {
    try {
      const influencer = await Influencer.findById(req.params.id)
        .select('reputation userId')
        .populate('userId', 'firstName lastName email');
      
      if (!influencer) {
        return res.status(404).json({ message: 'Influencer not found' });
      }

      res.json({
        influencerId: influencer._id,
        user: influencer.userId,
        reputation: influencer.reputation
      });
    } catch (error) {
      res.status(500).json({ message: 'Server error', error });
    }
  },

  // Manual trigger to recalculate reputation
  async recalculateReputation(req: Request, res: Response) {
    try {
      const result = await InfluencerReputationService.ReputationService.updateInfluencerReputation(req.params.id);
      res.json(result);
    } catch (error) {
      res.status(500).json({ message: 'Error recalculating reputation', error });
    }
  },

  // Get leaderboard
  async getLeaderboard(req: Request, res: Response) {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const influencers = await Influencer.find()
        // .sort({ 'reputation.score': -1 })
        .limit(limit)
        .populate('userId', 'firstName lastName');

        console.log("influencers", influencers)
      res.json(influencers?.map((i:any) => ({
        id: i._id,
        name: `${i.userId.firstName} ${i.userId.lastName}`,
        score: i.reputation.score,
        badges: i.reputation.badges,
        isVerified: i.reputation.isVerified
      })));
    } catch (error) {
      res.status(500).json({ message: 'Error getting leaderboard', error });
    }
  }
};

export default ReputationController;