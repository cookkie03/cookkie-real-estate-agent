/**
 * WebSocket Module
 *
 * Provides Socket.io gateway for real-time communication.
 * Global module - available throughout the application.
 */

import { Module, Global } from '@nestjs/common';
import { CrmWebSocketGateway } from './crm-websocket.gateway';

@Global()
@Module({
  providers: [CrmWebSocketGateway],
  exports: [CrmWebSocketGateway],
})
export class WebSocketModule {}
