/**
 * WebSocket Gateway
 *
 * Handles real-time bidirectional communication using Socket.io.
 * Used for notifications, live updates, chat, etc.
 */

import {
  WebSocketGateway as WSGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';

@WSGateway({
  cors: {
    origin: '*', // Configure properly in production
    credentials: true,
  },
})
export class WebSocketGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(WebSocketGateway.name);

  afterInit(server: Server) {
    this.logger.log('✅ WebSocket Gateway initialized');
  }

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  /**
   * Emit event to all connected clients
   */
  emitToAll(event: string, data: any) {
    this.server.emit(event, data);
  }

  /**
   * Emit event to specific room
   */
  emitToRoom(room: string, event: string, data: any) {
    this.server.to(room).emit(event, data);
  }

  /**
   * Emit event to specific client
   */
  emitToClient(clientId: string, event: string, data: any) {
    this.server.to(clientId).emit(event, data);
  }

  /**
   * Example: Join room
   */
  @SubscribeMessage('joinRoom')
  handleJoinRoom(
    @MessageBody() room: string,
    @ConnectedSocket() client: Socket
  ) {
    client.join(room);
    this.logger.debug(`Client ${client.id} joined room: ${room}`);
    return { success: true, room };
  }

  /**
   * Example: Leave room
   */
  @SubscribeMessage('leaveRoom')
  handleLeaveRoom(
    @MessageBody() room: string,
    @ConnectedSocket() client: Socket
  ) {
    client.leave(room);
    this.logger.debug(`Client ${client.id} left room: ${room}`);
    return { success: true, room };
  }
}
