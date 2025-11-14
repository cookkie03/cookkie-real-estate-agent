/**
 * WebSocket Gateway (Infrastructure Layer)
 *
 * Real-time communication gateway using Socket.io for:
 * - Property updates
 * - Matching notifications
 * - Task updates
 * - Analytics live updates
 * - Scraping progress
 */

import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';

export enum WebSocketEvent {
  // Property events
  PROPERTY_CREATED = 'property:created',
  PROPERTY_UPDATED = 'property:updated',
  PROPERTY_DELETED = 'property:deleted',

  // Client events
  CLIENT_CREATED = 'client:created',
  CLIENT_UPDATED = 'client:updated',

  // Matching events
  MATCH_CREATED = 'match:created',
  MATCH_UPDATED = 'match:updated',
  MATCH_NOTIFICATION = 'match:notification',

  // Task events
  TASK_CREATED = 'task:created',
  TASK_UPDATED = 'task:updated',
  TASK_COMPLETED = 'task:completed',
  TASK_REMINDER = 'task:reminder',

  // Scraping events
  SCRAPING_STARTED = 'scraping:started',
  SCRAPING_PROGRESS = 'scraping:progress',
  SCRAPING_COMPLETED = 'scraping:completed',
  SCRAPING_FAILED = 'scraping:failed',

  // Analytics events
  ANALYTICS_UPDATED = 'analytics:updated',
  REPORT_GENERATED = 'report:generated',

  // Calendar events
  CALENDAR_EVENT_CREATED = 'calendar:event:created',
  CALENDAR_EVENT_UPDATED = 'calendar:event:updated',
  CALENDAR_SYNC_COMPLETED = 'calendar:sync:completed',

  // Message events
  EMAIL_RECEIVED = 'email:received',
  WHATSAPP_RECEIVED = 'whatsapp:received',

  // System events
  NOTIFICATION = 'notification',
  ERROR = 'error',
}

@WebSocketGateway({
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  },
  namespace: '/crm',
})
export class CrmWebSocketGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(CrmWebSocketGateway.name);
  private connectedClients: Map<string, Socket> = new Map();

  /**
   * Handle client connection
   */
  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
    this.connectedClients.set(client.id, client);

    // Send welcome message
    client.emit('connection', {
      message: 'Connected to CRM WebSocket',
      clientId: client.id,
      timestamp: new Date().toISOString(),
    });

    // Log connection count
    this.logger.log(`Total connected clients: ${this.connectedClients.size}`);
  }

  /**
   * Handle client disconnection
   */
  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
    this.connectedClients.delete(client.id);
    this.logger.log(`Total connected clients: ${this.connectedClients.size}`);
  }

  /**
   * Subscribe to specific room (e.g., property updates, task updates)
   */
  @SubscribeMessage('subscribe')
  handleSubscribe(
    @MessageBody() data: { room: string },
    @ConnectedSocket() client: Socket,
  ) {
    client.join(data.room);
    this.logger.log(`Client ${client.id} subscribed to room: ${data.room}`);
    return { success: true, room: data.room };
  }

  /**
   * Unsubscribe from room
   */
  @SubscribeMessage('unsubscribe')
  handleUnsubscribe(
    @MessageBody() data: { room: string },
    @ConnectedSocket() client: Socket,
  ) {
    client.leave(data.room);
    this.logger.log(`Client ${client.id} unsubscribed from room: ${data.room}`);
    return { success: true, room: data.room };
  }

  /**
   * Ping-pong for connection health check
   */
  @SubscribeMessage('ping')
  handlePing(@ConnectedSocket() client: Socket) {
    client.emit('pong', { timestamp: new Date().toISOString() });
  }

  // ============================================================================
  // PUBLIC METHODS - Called by services to emit events
  // ============================================================================

  /**
   * Emit property event
   */
  emitPropertyEvent(event: WebSocketEvent, data: any) {
    this.server.emit(event, data);
    this.logger.debug(`Emitted ${event}:`, data);
  }

  /**
   * Emit client event
   */
  emitClientEvent(event: WebSocketEvent, data: any) {
    this.server.emit(event, data);
    this.logger.debug(`Emitted ${event}:`, data);
  }

  /**
   * Emit matching event
   */
  emitMatchEvent(event: WebSocketEvent, data: any) {
    this.server.emit(event, data);
    this.server.to(`client:${data.clientId}`).emit(event, data);
    this.logger.debug(`Emitted ${event}:`, data);
  }

  /**
   * Emit task event
   */
  emitTaskEvent(event: WebSocketEvent, data: any) {
    this.server.emit(event, data);
    if (data.assignedTo) {
      this.server.to(`user:${data.assignedTo}`).emit(event, data);
    }
    this.logger.debug(`Emitted ${event}:`, data);
  }

  /**
   * Emit scraping progress
   */
  emitScrapingProgress(jobId: string, progress: number, data?: any) {
    const payload = {
      jobId,
      progress,
      ...data,
      timestamp: new Date().toISOString(),
    };

    this.server.emit(WebSocketEvent.SCRAPING_PROGRESS, payload);
    this.server.to(`scraping:${jobId}`).emit(WebSocketEvent.SCRAPING_PROGRESS, payload);

    this.logger.debug(`Scraping progress ${jobId}: ${progress}%`);
  }

  /**
   * Emit analytics update
   */
  emitAnalyticsUpdate(metricType: string, data: any) {
    const payload = {
      metricType,
      ...data,
      timestamp: new Date().toISOString(),
    };

    this.server.emit(WebSocketEvent.ANALYTICS_UPDATED, payload);
    this.logger.debug(`Analytics updated: ${metricType}`);
  }

  /**
   * Emit calendar event
   */
  emitCalendarEvent(event: WebSocketEvent, data: any) {
    this.server.emit(event, data);
    if (data.contactId) {
      this.server.to(`client:${data.contactId}`).emit(event, data);
    }
    this.logger.debug(`Emitted ${event}:`, data);
  }

  /**
   * Emit message received event
   */
  emitMessageReceived(provider: 'gmail' | 'whatsapp', data: any) {
    const event =
      provider === 'gmail'
        ? WebSocketEvent.EMAIL_RECEIVED
        : WebSocketEvent.WHATSAPP_RECEIVED;

    this.server.emit(event, data);
    if (data.contactId) {
      this.server.to(`client:${data.contactId}`).emit(event, data);
    }
    this.logger.debug(`Emitted ${event}:`, data);
  }

  /**
   * Emit notification (general purpose)
   */
  emitNotification(data: {
    type: 'info' | 'success' | 'warning' | 'error';
    title: string;
    message: string;
    data?: any;
  }) {
    const payload = {
      ...data,
      timestamp: new Date().toISOString(),
    };

    this.server.emit(WebSocketEvent.NOTIFICATION, payload);
    this.logger.debug(`Notification: ${data.title}`);
  }

  /**
   * Emit error
   */
  emitError(error: { message: string; code?: string; data?: any }) {
    const payload = {
      ...error,
      timestamp: new Date().toISOString(),
    };

    this.server.emit(WebSocketEvent.ERROR, payload);
    this.logger.error(`WebSocket error:`, payload);
  }

  /**
   * Emit to specific user
   */
  emitToUser(userId: string, event: string, data: any) {
    this.server.to(`user:${userId}`).emit(event, data);
    this.logger.debug(`Emitted ${event} to user ${userId}`);
  }

  /**
   * Emit to specific room
   */
  emitToRoom(room: string, event: string, data: any) {
    this.server.to(room).emit(event, data);
    this.logger.debug(`Emitted ${event} to room ${room}`);
  }

  /**
   * Get connected clients count
   */
  getConnectedCount(): number {
    return this.connectedClients.size;
  }

  /**
   * Get all connected client IDs
   */
  getConnectedClientIds(): string[] {
    return Array.from(this.connectedClients.keys());
  }
}
