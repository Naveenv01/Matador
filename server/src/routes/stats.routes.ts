import { Router, Request, Response } from 'express';
import { BullMQService } from '../services/bullmq.service.js';

export function createStatsRouter(bullmqService: BullMQService) {
  const router = Router();

  /**
   * GET /api/stats - Get aggregate statistics
   */
  router.get('/', async (req: Request, res: Response) => {
    try {
      const stats = await bullmqService.getStats();
      res.json(stats);
    } catch (error) {
      console.error('Error fetching stats:', error);
      res.status(500).json({ error: 'Failed to fetch stats' });
    }
  });

  return router;
}
