/**
 * Queue Service
 *
 * Manages background job queues using BullMQ.
 */

import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Queue, Worker, Job } from 'bullmq';
import Redis from 'ioredis';

export interface QueueJobData {
  [key: string]: any;
}

export type JobProcessor<T = QueueJobData> = (job: Job<T>) => Promise<any>;

@Injectable()
export class QueueService implements OnModuleInit {
  private readonly logger = new Logger(QueueService.name);
  private connection: Redis;
  private queues: Map<string, Queue> = new Map();
  private workers: Map<string, Worker> = new Map();

  constructor(private configService: ConfigService) {}

  async onModuleInit() {
    const host = this.configService.get('QUEUE_REDIS_HOST', 'localhost');
    const port = this.configService.get('QUEUE_REDIS_PORT', 6379);
    const password = this.configService.get('QUEUE_REDIS_PASSWORD');

    this.connection = new Redis({
      host,
      port,
      password: password || undefined,
      maxRetriesPerRequest: null,
    });

    this.logger.log('✅ Queue service initialized');
  }

  /**
   * Get or create a queue
   */
  getQueue(name: string): Queue {
    if (!this.queues.has(name)) {
      const queue = new Queue(name, {
        connection: this.connection,
        defaultJobOptions: {
          attempts: 3,
          backoff: {
            type: 'exponential',
            delay: 2000,
          },
          removeOnComplete: {
            count: 100, // Keep last 100 completed
          },
          removeOnFail: {
            count: 500, // Keep last 500 failed
          },
        },
      });

      this.queues.set(name, queue);
      this.logger.log(`Queue "${name}" created`);
    }

    return this.queues.get(name)!;
  }

  /**
   * Add job to queue
   */
  async addJob<T = QueueJobData>(
    queueName: string,
    jobName: string,
    data: T,
    options?: any
  ): Promise<Job<T>> {
    const queue = this.getQueue(queueName);
    const job = await queue.add(jobName, data, options);
    this.logger.debug(`Job "${jobName}" added to queue "${queueName}" - ID: ${job.id}`);
    return job;
  }

  /**
   * Register a worker for processing jobs
   */
  registerWorker<T = QueueJobData>(
    queueName: string,
    processor: JobProcessor<T>
  ): Worker<T> {
    const worker = new Worker<T>(queueName, processor, {
      connection: this.connection,
    });

    worker.on('completed', (job) => {
      this.logger.debug(`Job ${job.id} in queue "${queueName}" completed`);
    });

    worker.on('failed', (job, err) => {
      this.logger.error(
        `Job ${job?.id} in queue "${queueName}" failed:`,
        err.message
      );
    });

    this.workers.set(queueName, worker);
    this.logger.log(`Worker registered for queue "${queueName}"`);

    return worker;
  }

  /**
   * Pause queue
   */
  async pauseQueue(name: string): Promise<void> {
    const queue = this.getQueue(name);
    await queue.pause();
    this.logger.log(`Queue "${name}" paused`);
  }

  /**
   * Resume queue
   */
  async resumeQueue(name: string): Promise<void> {
    const queue = this.getQueue(name);
    await queue.resume();
    this.logger.log(`Queue "${name}" resumed`);
  }

  /**
   * Get queue metrics
   */
  async getQueueMetrics(name: string) {
    const queue = this.getQueue(name);
    const [waiting, active, completed, failed, delayed] = await Promise.all([
      queue.getWaitingCount(),
      queue.getActiveCount(),
      queue.getCompletedCount(),
      queue.getFailedCount(),
      queue.getDelayedCount(),
    ]);

    return {
      waiting,
      active,
      completed,
      failed,
      delayed,
      total: waiting + active + completed + failed + delayed,
    };
  }
}
