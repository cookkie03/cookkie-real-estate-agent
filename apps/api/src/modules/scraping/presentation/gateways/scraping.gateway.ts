/**
 * Scraping WebSocket Gateway
 *
 * Provides real-time updates for scraping jobs via WebSocket.
 */

import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { ScrapingService } from '../../application/services/scraping.service';

@WebSocketGateway({
  namespace: '/scraping',
  cors: {
    origin: '*', // Configure properly in production
  },
})
export class ScrapingGateway {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(ScrapingGateway.name);

  constructor(private scrapingService: ScrapingService) {}

  /**
   * Handle client connection
   */
  handleConnection(client: Socket): void {
    this.logger.log(`Client connected: ${client.id}`);
  }

  /**
   * Handle client disconnection
   */
  handleDisconnect(client: Socket): void {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  /**
   * Subscribe to job updates
   */
  @SubscribeMessage('subscribe:job')
  async handleSubscribeJob(
    @MessageBody() data: { jobId: string },
    @ConnectedSocket() client: Socket,
  ): Promise<void> {
    const { jobId } = data;

    this.logger.log(`Client ${client.id} subscribed to job ${jobId}`);

    // Join room for this job
    client.join(`job:${jobId}`);

    // Send initial job status
    try {
      const job = await this.scrapingService.getJob(jobId);
      client.emit('job:status', {
        jobId: job.id,
        status: job.status,
        progress: job.progress,
        result: job.result,
      });
    } catch (error) {
      client.emit('job:error', {
        jobId,
        error: 'Job not found',
      });
    }
  }

  /**
   * Unsubscribe from job updates
   */
  @SubscribeMessage('unsubscribe:job')
  handleUnsubscribeJob(
    @MessageBody() data: { jobId: string },
    @ConnectedSocket() client: Socket,
  ): void {
    const { jobId } = data;

    this.logger.log(`Client ${client.id} unsubscribed from job ${jobId}`);

    client.leave(`job:${jobId}`);
  }

  /**
   * Broadcast job progress update
   */
  broadcastJobProgress(
    jobId: string,
    progress: {
      status: string;
      progress: number;
      currentPage?: number;
      propertiesFound?: number;
    },
  ): void {
    this.server.to(`job:${jobId}`).emit('job:progress', {
      jobId,
      ...progress,
    });
  }

  /**
   * Broadcast job completion
   */
  broadcastJobCompleted(
    jobId: string,
    result: {
      status: string;
      propertiesFound: number;
      propertiesImported: number;
      duration: number;
    },
  ): void {
    this.server.to(`job:${jobId}`).emit('job:completed', {
      jobId,
      ...result,
    });
  }

  /**
   * Broadcast job failure
   */
  broadcastJobFailed(jobId: string, error: string): void {
    this.server.to(`job:${jobId}`).emit('job:failed', {
      jobId,
      error,
    });
  }

  /**
   * Broadcast screenshot for headful mode
   */
  broadcastScreenshot(jobId: string, screenshot: string): void {
    this.server.to(`job:${jobId}`).emit('job:screenshot', {
      jobId,
      screenshot, // Base64-encoded screenshot
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Broadcast log message
   */
  broadcastLog(jobId: string, message: string, level: 'info' | 'warn' | 'error' = 'info'): void {
    this.server.to(`job:${jobId}`).emit('job:log', {
      jobId,
      message,
      level,
      timestamp: new Date().toISOString(),
    });
  }
}
