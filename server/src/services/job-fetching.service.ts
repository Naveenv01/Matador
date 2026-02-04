import { Queue as BullQueue, Job as BullJob } from 'bullmq';
import { Job, JobStatus } from './types.js';
import { RedisConnectionService } from './redis-connection.service.js';
import { QueueDiscoveryService } from './queue-discovery.service.js';

interface JobFilters {
  queue?: string;
  status?: JobStatus;
  search?: string;
}

/**
 * Optimized job fetching service with parallel Redis calls
 */
export class JobFetchingService {
  private connectionService: RedisConnectionService;
  private discoveryService: QueueDiscoveryService;
  private DEFAULT_LIMIT = 30; // Reduced from 100 for faster loading

  constructor(
    connectionService: RedisConnectionService,
    discoveryService: QueueDiscoveryService
  ) {
    this.connectionService = connectionService;
    this.discoveryService = discoveryService;
  }

  /**
   * Fetch jobs from a single status type
   */
  private async fetchJobsByStatus(
    queue: BullQueue,
    status: JobStatus,
    limit: number
  ): Promise<BullJob[]> {
    switch (status) {
      case 'completed':
        return queue.getCompleted(0, limit - 1);
      case 'failed':
        return queue.getFailed(0, limit - 1);
      case 'active':
        return queue.getActive(0, limit - 1);
      case 'waiting':
        return queue.getWaiting(0, limit - 1);
      case 'delayed':
        return queue.getDelayed(0, limit - 1);
      default:
        return [];
    }
  }

  /**
   * Map a BullMQ job to our application Job type
   */
  private mapBullJobToAppJob(job: BullJob, queueName: string, status: JobStatus): Job {
    return {
      id: job.id!,
      name: job.name,
      queue: queueName,
      status,
      progress: typeof job.progress === 'number' ? job.progress : 0,
      attempts: job.attemptsMade,
      maxAttempts: job.opts.attempts || 1,
      data: job.data,
      createdAt: new Date(job.timestamp),
      processedAt: job.processedOn ? new Date(job.processedOn) : undefined,
      finishedAt: job.finishedOn ? new Date(job.finishedOn) : undefined,
      nextRunAt: job.opts.delay ? new Date(Date.now() + job.opts.delay) : undefined,
      failedReason: job.failedReason,
      duration:
        job.finishedOn && job.processedOn
          ? job.finishedOn - job.processedOn
          : undefined,
    };
  }

  /**
   * Get jobs with optimized parallel fetching
   */
  async getJobs(filters?: JobFilters, limit?: number): Promise<Job[]> {
    const effectiveLimit = limit || this.DEFAULT_LIMIT;
    const queueNames = filters?.queue
      ? [filters.queue]
      : await this.discoveryService.discoverQueues();

    const statuses: JobStatus[] = filters?.status
      ? [filters.status]
      : ['completed', 'failed', 'active', 'waiting', 'delayed'];

    // Parallelize fetching across all queues
    const queueJobPromises = queueNames.map(async (queueName) => {
      try {
        const queue = this.connectionService.getQueue(queueName);

        // OPTIMIZATION: Parallelize fetching across all status types for each queue
        const statusJobPromises = statuses.map((status) =>
          this.fetchJobsByStatus(queue, status, effectiveLimit)
            .then((jobs) => ({ status, jobs }))
            .catch((err) => {
              console.error(`Error fetching ${status} jobs from ${queueName}:`, err);
              return { status, jobs: [] };
            })
        );

        const statusResults = await Promise.all(statusJobPromises);

        // Map all jobs to our app format
        const jobs: Job[] = [];
        for (const { status, jobs: bullJobs } of statusResults) {
          for (const bullJob of bullJobs) {
            const mappedJob = this.mapBullJobToAppJob(bullJob, queueName, status);

            // Apply search filter
            if (filters?.search) {
              const searchLower = filters.search.toLowerCase();
              const matchesSearch =
                mappedJob.name.toLowerCase().includes(searchLower) ||
                mappedJob.id.toLowerCase().includes(searchLower);

              if (matchesSearch) {
                jobs.push(mappedJob);
              }
            } else {
              jobs.push(mappedJob);
            }
          }
        }

        return jobs;
      } catch (error) {
        console.error(`Error getting jobs from queue ${queueName}:`, error);
        return [];
      }
    });

    // Wait for all queues to finish in parallel
    const allQueueJobs = await Promise.all(queueJobPromises);
    return allQueueJobs.flat();
  }

  /**
   * Get a specific job by ID
   */
  async getJobById(queueName: string, jobId: string): Promise<Job | null> {
    try {
      const queue = this.connectionService.getQueue(queueName);
      const job = await queue.getJob(jobId);

      if (!job) {
        return null;
      }

      const state = await job.getState();
      return this.mapBullJobToAppJob(job, queueName, state as JobStatus);
    } catch (error) {
      console.error(`Error getting job ${jobId} from queue ${queueName}:`, error);
      return null;
    }
  }
}
