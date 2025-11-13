/**
 * WebSocket Module
 *
 * Provides Socket.io gateway for real-time communication.
 */

import { Module, Global } from '@nestjs/common';
import { WebSocketGateway } from './websocket.gateway';

@Global()
@Module({
  providers: [WebSocketGateway],
  exports: [WebSocketGateway],
})
export class WebSocketModule {}
