import { Job, Stats } from './types.js';
import { JobFetchingService } from './job-fetching.service.js';

/**
 * Calculate aggregate statistics across jobs
 */
export class StatsService {
  private jobFetchingService: JobFetchingService;

  constructor(jobFetchingService: JobFetchingService) {
    this.jobFetchingService = jobFetchingService;
  }

  /**
   * Get aggregate statistics across all queues
   */
  async getStats(): Promise<Stats> {
    const jobs = await this.jobFetchingService.getJobs();

    const stats: Stats = {
      completed: 0,
      failed: 0,
      active: 0,
      waiting: 0,
      delayed: 0,
      total: jobs.length,
    };

    jobs.forEach((job) => {
      stats[job.status]++;
    });

    return stats;
  }

  /**
   * Get statistics for a specific queue
   */
  async getQueueStats(queueName: string): Promise<Stats> {
    const jobs = await this.jobFetchingService.getJobs({ queue: queueName });

    const stats: Stats = {
      completed: 0,
      failed: 0,
      active: 0,
      waiting: 0,
      delayed: 0,
      total: jobs.length,
    };

    jobs.forEach((job) => {
      stats[job.status]++;
    });

    return stats;
  }
}
