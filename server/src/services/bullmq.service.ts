import { RedisConnectionService } from './redis-connection.service.js';
import { QueueDiscoveryService } from './queue-discovery.service.js';
import { JobFetchingService } from './job-fetching.service.js';
import { StatsService } from './stats.service.js';

interface RedisConfig {
  host: string;
  port: number;
  password?: string;
}

/**
 * BullMQService - Main facade for BullMQ operations
 * Orchestrates the specialized services
 */
export class BullMQService {
  private redisConnectionService: RedisConnectionService;
  private queueDiscoveryService: QueueDiscoveryService;
  private jobFetchingService: JobFetchingService;
  private statsService: StatsService;

  constructor(redisConfig: RedisConfig) {
    // Initialize services in dependency order
    this.redisConnectionService = new RedisConnectionService(redisConfig);
    this.queueDiscoveryService = new QueueDiscoveryService(this.redisConnectionService);
    this.jobFetchingService = new JobFetchingService(
      this.redisConnectionService,
      this.queueDiscoveryService
    );
    this.statsService = new StatsService(this.jobFetchingService);
  }

  /**
   * Get all queues with their status counts
   */
  async getQueues() {
    return this.queueDiscoveryService.getQueues();
  }

  /**
   * Get jobs with optional filters
   */
  async getJobs(filters?: { queue?: string; status?: string; search?: string }) {
    return this.jobFetchingService.getJobs(filters as any);
  }

  /**
   * Get a specific job by ID
   */
  async getJobById(queueName: string, jobId: string) {
    return this.jobFetchingService.getJobById(queueName, jobId);
  }

  /**
   * Get aggregate statistics
   */
  async getStats() {
    return this.statsService.getStats();
  }

  /**
   * Get statistics for a specific queue
   */
  async getQueueStats(queueName: string) {
    return this.statsService.getQueueStats(queueName);
  }

  /**
   * Close all connections
   */
  async close() {
    await this.redisConnectionService.close();
  }
}
