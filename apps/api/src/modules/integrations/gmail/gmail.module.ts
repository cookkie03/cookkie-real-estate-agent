/**
 * Gmail Integration Module
 *
 * Handles Gmail integration for email synchronization and AI parsing.
 *
 * ✅ IMPLEMENTED (Phase 4):
 * - domain/entities/email-message.entity.ts - Email entity with status, parsing
 * - application/services/gmail.service.ts - Gmail API client (OAuth, send/receive)
 * - application/services/email-parser.service.ts - AI-powered email parsing
 * - presentation/controllers/gmail.controller.ts - REST API endpoints
 * - presentation/dto/gmail.dto.ts - Request/response DTOs
 *
 * Features:
 * - OAuth 2.0 authentication with Gmail API
 * - Bidirectional email sync (inbox & sent)
 * - AI parsing to extract property inquiries, requirements, urgency
 * - Email sending via Gmail API
 * - Attachment handling
 * - Mark as read/unread, archive, delete
 * - Push notifications setup (Google Cloud Pub/Sub)
 * - Priority scoring for emails
 * - Sentiment analysis
 * - Suggested actions generation
 *
 * API Endpoints:
 * - GET /gmail/auth - Get OAuth URL
 * - POST /gmail/auth/callback - OAuth callback
 * - POST /gmail/sync - Sync inbox
 * - GET /gmail/messages/:id - Get message
 * - POST /gmail/send - Send email
 * - POST /gmail/messages/:id/read - Mark as read
 * - POST /gmail/messages/:id/unread - Mark as unread
 * - POST /gmail/messages/:id/archive - Archive
 * - POST /gmail/messages/:id/delete - Delete
 * - POST /gmail/watch - Setup push notifications
 *
 * Gmail API Documentation:
 * https://developers.google.com/gmail/api
 */

import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from '../../../shared/database/database.module';
import { GmailController } from './presentation/controllers/gmail.controller';
import { GmailService } from './application/services/gmail.service';
import { EmailParserService } from './application/services/email-parser.service';

@Module({
  imports: [DatabaseModule, ConfigModule],
  controllers: [GmailController],
  providers: [GmailService, EmailParserService],
  exports: [GmailService, EmailParserService],
})
export class GmailModule {}
