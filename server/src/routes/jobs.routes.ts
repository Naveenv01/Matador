import { Router, Request, Response } from 'express';
import { BullMQService } from '../services/bullmq.service.js';

export function createJobsRouter(bullmqService: BullMQService) {
  const router = Router();

  /**
   * GET /api/jobs - Get all jobs with optional filters
   * Query params: queue, status, search
   */
  router.get('/', async (req: Request, res: Response) => {
    try {
      const { queue, status, search } = req.query;
      
      const jobs = await bullmqService.getJobs({
        queue: queue as string | undefined,
        status: status as any,
        search: search as string | undefined,
      });
      
      res.json(jobs);
    } catch (error) {
      console.error('Error fetching jobs:', error);
      res.status(500).json({ error: 'Failed to fetch jobs' });
    }
  });

  /**
   * GET /api/jobs/:queue/:id - Get specific job by ID
   */
  router.get('/:queue/:id', async (req: Request, res: Response) => {
    try {
      const { queue, id } = req.params;
      const job = await bullmqService.getJobById(queue, id);
      
      if (!job) {
        res.status(404).json({ error: 'Job not found' });
        return;
      }
      
      res.json(job);
    } catch (error) {
      console.error('Error fetching job:', error);
      res.status(500).json({ error: 'Failed to fetch job' });
    }
  });

  return router;
}
