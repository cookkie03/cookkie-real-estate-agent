/**
 * Cache Service
 *
 * Redis-based caching with automatic connection management.
 */

import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Injectable()
export class CacheService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(CacheService.name);
  private client: Redis;

  constructor(private configService: ConfigService) {}

  async onModuleInit() {
    const host = this.configService.get('REDIS_HOST', 'localhost');
    const port = this.configService.get('REDIS_PORT', 6379);
    const password = this.configService.get('REDIS_PASSWORD');

    this.client = new Redis({
      host,
      port,
      password: password || undefined,
      retryStrategy: (times) => {
        const delay = Math.min(times * 50, 2000);
        return delay;
      },
    });

    this.client.on('connect', () => {
      this.logger.log('✅ Redis connected successfully');
    });

    this.client.on('error', (err) => {
      this.logger.error('Redis error:', err);
    });
  }

  async onModuleDestroy() {
    await this.client.quit();
    this.logger.log('Redis disconnected');
  }

  /**
   * Get value from cache
   */
  async get<T>(key: string): Promise<T | null> {
    const value = await this.client.get(key);
    return value ? JSON.parse(value) : null;
  }

  /**
   * Set value in cache with optional TTL (seconds)
   */
  async set(key: string, value: any, ttl?: number): Promise<void> {
    const stringValue = JSON.stringify(value);
    if (ttl) {
      await this.client.setex(key, ttl, stringValue);
    } else {
      await this.client.set(key, stringValue);
    }
  }

  /**
   * Delete key from cache
   */
  async del(key: string): Promise<void> {
    await this.client.del(key);
  }

  /**
   * Check if key exists
   */
  async exists(key: string): Promise<boolean> {
    const result = await this.client.exists(key);
    return result === 1;
  }

  /**
   * Set expiration on key (seconds)
   */
  async expire(key: string, seconds: number): Promise<void> {
    await this.client.expire(key, seconds);
  }

  /**
   * Increment counter
   */
  async incr(key: string): Promise<number> {
    return await this.client.incr(key);
  }

  /**
   * Get all keys matching pattern
   */
  async keys(pattern: string): Promise<string[]> {
    return await this.client.keys(pattern);
  }

  /**
   * Delete all keys matching pattern
   */
  async delPattern(pattern: string): Promise<void> {
    const keys = await this.keys(pattern);
    if (keys.length > 0) {
      await this.client.del(...keys);
    }
  }

  /**
   * Get native Redis client (for advanced operations)
   */
  getClient(): Redis {
    return this.client;
  }
}
