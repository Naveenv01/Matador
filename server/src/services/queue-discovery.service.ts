import { Queue as BullQueue } from 'bullmq';
import Redis from 'ioredis';
import { Queue } from './types.js';
import { RedisConnectionService } from './redis-connection.service.js';

/**
 * Handles queue discovery and metadata retrieval
 */
export class QueueDiscoveryService {
  private connectionService: RedisConnectionService;
  private redis: Redis;
  private cachedQueueNames: string[] | null = null;
  private cacheTimestamp: number = 0;
  private CACHE_TTL_MS = 5000; // Cache for 5 seconds

  constructor(connectionService: RedisConnectionService) {
    this.connectionService = connectionService;
    this.redis = connectionService.getRedisClient();
  }

  /**
   * Auto-discover all Bull/BullMQ queues from Redis
   * Results are cached for 5 seconds to improve performance
   */
  async discoverQueues(): Promise<string[]> {
    // Return cached result if still valid
    if (this.cachedQueueNames && Date.now() - this.cacheTimestamp < this.CACHE_TTL_MS) {
      return this.cachedQueueNames;
    }

    try {
      // Try BullMQ first (has meta keys)
      const bullMQKeys = await this.redis.keys('bull:*:meta');
      const bullMQQueues = bullMQKeys
        .map((key) => {
          const match = key.match(/^bull:(.+):meta$/);
          return match ? match[1] : null;
        })
        .filter((name): name is string => name !== null);
      
      if (bullMQQueues.length > 0) {
        const uniqueQueues = [...new Set(bullMQQueues)];
        this.cachedQueueNames = uniqueQueues;
        this.cacheTimestamp = Date.now();
        return uniqueQueues;
      }

      // Fallback to Bull discovery (look for :id or :delayed keys)
      const bullKeys = await this.redis.keys('bull:*');
      const queueNames = new Set<string>();
      
      for (const key of bullKeys) {
        const match = key.match(/^bull:([^:]+):/);
        if (match) {
          queueNames.add(match[1]);
        }
      }
      
      const result = Array.from(queueNames);
      console.log('Discovered queues:', result);
      
      this.cachedQueueNames = result;
      this.cacheTimestamp = Date.now();
      return result;
    } catch (error) {
      console.error('Error discovering queues:', error);
      return [];
    }
  }

  /**
   * Get all queues with their job counts and metadata
   */
  async getQueues(): Promise<Queue[]> {
    const queueNames = await this.discoverQueues();
    const queues: Queue[] = [];

    // Fetch all queue data in parallel for better performance
    const queuePromises = queueNames.map(async (queueName) => {
      try {
        const queue = this.connectionService.getQueue(queueName);
        const [completed, failed, active, waiting, delayed, isPaused] = await Promise.all([
          queue.getCompletedCount(),
          queue.getFailedCount(),
          queue.getActiveCount(),
          queue.getWaitingCount(),
          queue.getDelayedCount(),
          queue.isPaused(),
        ]);

        return {
          name: queueName,
          isPaused,
          jobCounts: {
            completed,
            failed,
            active,
            waiting,
            delayed,
          },
        };
      } catch (error) {
        console.error(`Error getting queue ${queueName}:`, error);
        return null;
      }
    });

    const results = await Promise.all(queuePromises);
    return results.filter((q): q is Queue => q !== null);
  }

  /**
   * Clear the queue cache
   */
  clearCache(): void {
    this.cachedQueueNames = null;
    this.cacheTimestamp = 0;
  }
}
