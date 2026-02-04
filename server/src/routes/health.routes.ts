import { Router, Request, Response } from 'express';

export function createHealthRouter(redisConfig: { host: string; port: number }) {
  const router = Router();

  /**
   * GET /api/health - Health check endpoint
   */
  router.get('/', (req: Request, res: Response) => {
    res.json({ 
      status: 'ok', 
      timestamp: new Date().toISOString(),
      redis: {
        host: redisConfig.host,
        port: redisConfig.port,
      },
    });
  });

  return router;
}
