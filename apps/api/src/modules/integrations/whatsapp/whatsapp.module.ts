/**
 * WhatsApp Integration Module
 *
 * Handles WhatsApp Business API integration for client communication.
 *
 * ✅ IMPLEMENTED (Phase 4):
 * - domain/entities/whatsapp-message.entity.ts - Message entity with media support
 * - application/services/whatsapp.service.ts - WhatsApp Business API wrapper
 * - presentation/controllers/whatsapp.controller.ts - REST API + Webhook
 * - presentation/dto/whatsapp.dto.ts - Request/response DTOs
 *
 * Features:
 * - WhatsApp Business API integration (Meta/Facebook)
 * - Send/receive text messages
 * - Send/receive images (property photos)
 * - Send/receive documents (contracts, brochures)
 * - Message templates for property alerts
 * - Interactive button messages
 * - Webhook handling (receive messages, status updates)
 * - Webhook signature verification
 * - Mark messages as read
 * - Media download
 * - Reply to messages (contextual replies)
 * - Message type detection (text, image, document, location, button)
 *
 * API Endpoints:
 * - GET /whatsapp/webhook - Verify webhook
 * - POST /whatsapp/webhook - Receive webhook notifications
 * - POST /whatsapp/send/text - Send text message
 * - POST /whatsapp/send/image - Send image
 * - POST /whatsapp/send/document - Send document
 * - POST /whatsapp/send/template - Send template
 * - POST /whatsapp/send/button - Send interactive buttons
 *
 * TODO (Future enhancements):
 * - AI-powered message parsing (extract requirements)
 * - Automatic property recommendations
 * - Viewing appointment scheduling
 * - Message queue for rate limiting
 * - Conversation tracking per contact
 * - List messages (interactive lists)
 * - Media storage integration
 *
 * WhatsApp Business API Documentation:
 * https://developers.facebook.com/docs/whatsapp/cloud-api
 */

import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';
import { DatabaseModule } from '../../../shared/database/database.module';
import { QueueModule } from '../../../shared/queue/queue.module';
import { WhatsAppController } from './presentation/controllers/whatsapp.controller';
import { WhatsAppService } from './application/services/whatsapp.service';

@Module({
  imports: [DatabaseModule, QueueModule, ConfigModule, HttpModule],
  controllers: [WhatsAppController],
  providers: [WhatsAppService],
  exports: [WhatsAppService],
})
export class WhatsAppModule {}
