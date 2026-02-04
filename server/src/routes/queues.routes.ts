import { Router, Request, Response } from 'express';
import { BullMQService } from '../services/bullmq.service.js';

export function createQueuesRouter(bullmqService: BullMQService) {
  const router = Router();

  /**
   * GET /api/queues - Get all queues with job counts
   */
  router.get('/', async (req: Request, res: Response) => {
    try {
      const queues = await bullmqService.getQueues();
      res.json(queues);
    } catch (error) {
      console.error('Error fetching queues:', error);
      res.status(500).json({ error: 'Failed to fetch queues' });
    }
  });

  return router;
}
