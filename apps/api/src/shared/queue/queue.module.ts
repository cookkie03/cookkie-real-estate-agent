/**
 * Queue Module
 *
 * Provides BullMQ job queue for background processing.
 * Used for scraping, email processing, calendar sync, etc.
 */

import { Module, Global } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { QueueService } from './queue.service';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [QueueService],
  exports: [QueueService],
})
export class QueueModule {}
