/**
 * Google Calendar Integration Module
 *
 * Handles Google Calendar integration for property viewing appointments.
 *
 * ✅ IMPLEMENTED (Phase 4 - Nice to Have):
 * - domain/entities/calendar-event.entity.ts - Event entity with recurrence
 * - application/services/calendar.service.ts - Google Calendar API wrapper
 * - presentation/controllers/calendar.controller.ts - REST API endpoints
 * - presentation/dto/calendar.dto.ts - Request/response DTOs
 *
 * Features:
 * - Google Calendar OAuth 2.0
 * - Create/update/delete calendar events
 * - Bidirectional sync (local ↔ Google)
 * - Property viewing appointments
 * - Email notifications to attendees
 * - Event reminders (email, popup)
 * - Recurring events (RRULE format)
 * - Timezone support
 * - Event status tracking (confirmed, tentative, cancelled)
 * - CRM metadata linking (property, client, agent)
 *
 * API Endpoints:
 * - GET /calendar/auth - Get OAuth URL
 * - POST /calendar/auth/callback - Exchange code for tokens
 * - POST /calendar/auth/refresh - Refresh token
 * - GET /calendar/events - List upcoming events
 * - GET /calendar/events/:id - Get single event
 * - POST /calendar/events - Create event
 * - PUT /calendar/events/:id - Update event
 * - DELETE /calendar/events/:id - Delete event
 * - POST /calendar/sync - Sync from Google
 * - POST /calendar/viewings - Create property viewing
 * - GET /calendar/viewings - Get property viewings
 * - POST /calendar/viewings/:id/cancel - Cancel viewing
 * - POST /calendar/viewings/:id/confirm - Confirm viewing
 *
 * TODO (Future enhancements):
 * - Webhook notifications (watch changes)
 * - Conflict detection for double-bookings
 * - Availability management
 * - Calendar sharing with team
 * - SMS reminders integration
 * - Video meeting links (Google Meet)
 * - Automatic follow-up scheduling
 *
 * Google Calendar API Documentation:
 * https://developers.google.com/calendar/api
 */

import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from '../../../shared/database/database.module';
import { CalendarController } from './presentation/controllers/calendar.controller';
import { CalendarService } from './application/services/calendar.service';

@Module({
  imports: [DatabaseModule, ConfigModule],
  controllers: [CalendarController],
  providers: [CalendarService],
  exports: [CalendarService],
})
export class CalendarModule {}
