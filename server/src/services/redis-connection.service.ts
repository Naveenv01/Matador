import { Queue as BullQueue } from 'bullmq';
import Redis from 'ioredis';

/**
 * Manages Redis connections and BullQueue instances
 */
export class RedisConnectionService {
  private redis: Redis;
  private queues: Map<string, BullQueue> = new Map();
  private redisConfig: { host: string; port: number; password?: string };

  constructor(redisConfig: { host: string; port: number; password?: string }) {
    this.redisConfig = redisConfig;
    this.redis = new Redis({
      host: redisConfig.host,
      port: redisConfig.port,
      password: redisConfig.password,
      maxRetriesPerRequest: null,
    });
  }

  /**
   * Get the raw Redis client
   */
  getRedisClient(): Redis {
    return this.redis;
  }

  /**
   * Get or create a BullQueue instance for a queue name
   */
  getQueue(queueName: string): BullQueue {
    if (!this.queues.has(queueName)) {
      const queue = new BullQueue(queueName, {
        connection: {
          host: this.redisConfig.host,
          port: this.redisConfig.port,
          password: this.redisConfig.password,
        },
      });
      this.queues.set(queueName, queue);
    }
    return this.queues.get(queueName)!;
  }

  /**
   * Close all connections
   */
  async close(): Promise<void> {
    await this.redis.quit();
    for (const queue of this.queues.values()) {
      await queue.close();
    }
    this.queues.clear();
  }
}
