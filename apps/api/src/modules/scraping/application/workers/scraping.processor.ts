/**
 * Scraping Processor (Application Layer)
 *
 * BullMQ worker that processes scraping jobs in the background.
 */

import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { ScrapingService } from '../services/scraping.service';

@Processor('scraping')
export class ScrapingProcessor extends WorkerHost {
  private readonly logger = new Logger(ScrapingProcessor.name);

  constructor(private scrapingService: ScrapingService) {
    super();
  }

  /**
   * Process scraping job
   */
  async process(job: Job<{ jobId: string; config: any }>): Promise<void> {
    const { jobId, config } = job.data;

    this.logger.log(`📋 Processing scraping job: ${jobId}`);
    this.logger.log(`Portal: ${config.portal}`);
    this.logger.log(`URL: ${config.searchUrl || 'Auto-generated'}`);

    try {
      // Update job progress
      await job.updateProgress(0);

      // Execute scraping
      await this.scrapingService.executeJob(jobId);

      // Mark job as completed
      await job.updateProgress(100);

      this.logger.log(`✅ Scraping job ${jobId} completed successfully`);
    } catch (error) {
      this.logger.error(`❌ Scraping job ${jobId} failed:`, error);
      throw error; // BullMQ will handle retries
    }
  }

  /**
   * Handle job completion
   */
  async onCompleted(job: Job, result: any): Promise<void> {
    this.logger.log(`✅ Job ${job.id} completed`);
  }

  /**
   * Handle job failure
   */
  async onFailed(job: Job | undefined, error: Error): Promise<void> {
    if (job) {
      this.logger.error(`❌ Job ${job.id} failed after ${job.attemptsMade} attempts:`, error);
    } else {
      this.logger.error(`❌ Job failed:`, error);
    }
  }

  /**
   * Handle job stalled
   */
  async onStalled(jobId: string): Promise<void> {
    this.logger.warn(`⚠️ Job ${jobId} stalled`);
  }
}
