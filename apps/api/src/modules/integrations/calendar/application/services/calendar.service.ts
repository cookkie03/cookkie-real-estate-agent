/**
 * Calendar Service (Application Layer)
 *
 * Handles Google Calendar API integration for viewing appointments.
 */

import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../../../../shared/database/prisma.service';
import { google, calendar_v3 } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';
import {
  CalendarEvent,
  EventType,
  EventStatus,
  SyncStatus,
  EventParticipant,
  EventReminder,
  EventMetadata,
} from '../../domain/entities/calendar-event.entity';

@Injectable()
export class CalendarService {
  private readonly logger = new Logger(CalendarService.name);
  private oauth2Client: OAuth2Client;
  private calendar: calendar_v3.Calendar;

  constructor(
    private configService: ConfigService,
    private prisma: PrismaService,
  ) {
    this.oauth2Client = new google.auth.OAuth2(
      this.configService.get('GOOGLE_CLIENT_ID'),
      this.configService.get('GOOGLE_CLIENT_SECRET'),
      this.configService.get('GOOGLE_REDIRECT_URI'),
    );

    this.calendar = google.calendar({ version: 'v3', auth: this.oauth2Client });

    this.logger.log('✅ Calendar service initialized');
  }

  /**
   * Get OAuth authorization URL
   */
  getAuthUrl(): string {
    return this.oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: [
        'https://www.googleapis.com/auth/calendar',
        'https://www.googleapis.com/auth/calendar.events',
      ],
      prompt: 'consent',
    });
  }

  /**
   * Exchange authorization code for tokens
   */
  async exchangeCodeForTokens(code: string): Promise<{
    accessToken: string;
    refreshToken: string;
    expiryDate: number;
  }> {
    const { tokens } = await this.oauth2Client.getToken(code);
    this.oauth2Client.setCredentials(tokens);

    return {
      accessToken: tokens.access_token!,
      refreshToken: tokens.refresh_token!,
      expiryDate: tokens.expiry_date!,
    };
  }

  /**
   * Set access token for authenticated requests
   */
  setAccessToken(accessToken: string, refreshToken?: string): void {
    this.oauth2Client.setCredentials({
      access_token: accessToken,
      refresh_token: refreshToken,
    });
  }

  /**
   * Refresh access token
   */
  async refreshAccessToken(refreshToken: string): Promise<{
    accessToken: string;
    expiryDate: number;
  }> {
    this.oauth2Client.setCredentials({ refresh_token: refreshToken });
    const { credentials } = await this.oauth2Client.refreshAccessToken();

    return {
      accessToken: credentials.access_token!,
      expiryDate: credentials.expiry_date!,
    };
  }

  /**
   * Create calendar event
   */
  async createEvent(event: CalendarEvent): Promise<CalendarEvent> {
    this.logger.log(`Creating calendar event: ${event.title}`);

    try {
      const response = await this.calendar.events.insert({
        calendarId: 'primary',
        requestBody: event.toGoogleCalendarFormat(),
        sendUpdates: 'all', // Send email notifications to attendees
      });

      event.markAsSynced(response.data.id!);

      this.logger.log(`✅ Event created: ${event.title}`);
      return event;
    } catch (error) {
      this.logger.error('Error creating calendar event:', error);
      event.markAsSyncFailed(error.message);
      throw error;
    }
  }

  /**
   * Update calendar event
   */
  async updateEvent(event: CalendarEvent): Promise<CalendarEvent> {
    this.logger.log(`Updating calendar event: ${event.title}`);

    if (!event.googleEventId) {
      throw new Error('Cannot update event without Google Calendar ID');
    }

    try {
      const response = await this.calendar.events.update({
        calendarId: 'primary',
        eventId: event.googleEventId,
        requestBody: event.toGoogleCalendarFormat(),
        sendUpdates: 'all',
      });

      event.markAsSynced(response.data.id!);

      this.logger.log(`✅ Event updated: ${event.title}`);
      return event;
    } catch (error) {
      this.logger.error('Error updating calendar event:', error);
      event.markAsSyncFailed(error.message);
      throw error;
    }
  }

  /**
   * Delete calendar event
   */
  async deleteEvent(googleEventId: string): Promise<void> {
    this.logger.log(`Deleting calendar event: ${googleEventId}`);

    try {
      await this.calendar.events.delete({
        calendarId: 'primary',
        eventId: googleEventId,
        sendUpdates: 'all',
      });

      this.logger.log(`✅ Event deleted: ${googleEventId}`);
    } catch (error) {
      this.logger.error('Error deleting calendar event:', error);
      throw error;
    }
  }

  /**
   * Get single event
   */
  async getEvent(googleEventId: string): Promise<CalendarEvent> {
    this.logger.log(`Fetching calendar event: ${googleEventId}`);

    try {
      const response = await this.calendar.events.get({
        calendarId: 'primary',
        eventId: googleEventId,
      });

      return this.mapGoogleEventToEntity(response.data);
    } catch (error) {
      this.logger.error('Error fetching calendar event:', error);
      throw error;
    }
  }

  /**
   * List upcoming events
   */
  async listUpcomingEvents(params: {
    maxResults?: number;
    timeMin?: Date;
    timeMax?: Date;
  }): Promise<CalendarEvent[]> {
    this.logger.log('Fetching upcoming calendar events');

    const timeMin = params.timeMin || new Date();
    const timeMax = params.timeMax;
    const maxResults = params.maxResults || 50;

    try {
      const response = await this.calendar.events.list({
        calendarId: 'primary',
        timeMin: timeMin.toISOString(),
        timeMax: timeMax?.toISOString(),
        maxResults,
        singleEvents: true,
        orderBy: 'startTime',
      });

      const events = response.data.items || [];
      return events.map((e) => this.mapGoogleEventToEntity(e));
    } catch (error) {
      this.logger.error('Error listing calendar events:', error);
      throw error;
    }
  }

  /**
   * Sync events from Google Calendar
   */
  async syncFromGoogle(params?: {
    timeMin?: Date;
    timeMax?: Date;
  }): Promise<{ created: number; updated: number; deleted: number }> {
    this.logger.log('Starting Google Calendar sync');

    const stats = { created: 0, updated: 0, deleted: 0 };

    try {
      const events = await this.listUpcomingEvents({
        timeMin: params?.timeMin,
        timeMax: params?.timeMax,
        maxResults: 250,
      });

      // TODO: Store events in database
      // For now, just return stats
      stats.created = events.length;

      this.logger.log(
        `✅ Sync completed: ${stats.created} events synced`,
      );

      return stats;
    } catch (error) {
      this.logger.error('Error syncing from Google Calendar:', error);
      throw error;
    }
  }

  /**
   * Push local event to Google Calendar
   */
  async syncToGoogle(event: CalendarEvent): Promise<CalendarEvent> {
    this.logger.log(`Syncing event to Google: ${event.title}`);

    if (event.googleEventId) {
      // Update existing event
      return await this.updateEvent(event);
    } else {
      // Create new event
      return await this.createEvent(event);
    }
  }

  /**
   * Create property viewing event
   */
  async createPropertyViewing(params: {
    propertyId: string;
    clientId: string;
    agentId: string;
    propertyAddress: string;
    startTime: Date;
    durationMinutes: number;
    clientEmail: string;
    clientName?: string;
    notes?: string;
    viewingType?: 'in-person' | 'virtual';
  }): Promise<CalendarEvent> {
    const endTime = new Date(
      params.startTime.getTime() + params.durationMinutes * 60 * 1000,
    );

    const event = new CalendarEvent({
      type: EventType.PROPERTY_VIEWING,
      status: EventStatus.TENTATIVE,
      title: `Property Viewing - ${params.propertyAddress}`,
      description: params.notes || `Property viewing at ${params.propertyAddress}`,
      location: params.viewingType === 'virtual' ? 'Virtual Meeting' : params.propertyAddress,
      startTime: params.startTime,
      endTime,
      organizer: {
        email: this.configService.get('AGENT_EMAIL', 'agent@crm-immobiliare.com'),
        isOrganizer: true,
      },
      attendees: [
        {
          email: params.clientEmail,
          name: params.clientName,
          responseStatus: 'needsAction',
        },
      ],
      reminders: [
        { method: 'email', minutes: 60 }, // 1 hour before
        { method: 'popup', minutes: 15 }, // 15 minutes before
      ],
      metadata: {
        propertyId: params.propertyId,
        clientId: params.clientId,
        agentId: params.agentId,
        propertyAddress: params.propertyAddress,
        notes: params.notes,
        viewingType: params.viewingType,
      },
    });

    return await this.createEvent(event);
  }

  /**
   * Get property viewing events
   */
  async getPropertyViewings(params?: {
    propertyId?: string;
    clientId?: string;
    agentId?: string;
    startDate?: Date;
    endDate?: Date;
  }): Promise<CalendarEvent[]> {
    const events = await this.listUpcomingEvents({
      timeMin: params?.startDate,
      timeMax: params?.endDate,
      maxResults: 100,
    });

    // Filter by metadata
    return events.filter((event) => {
      if (event.type !== EventType.PROPERTY_VIEWING) return false;
      if (params?.propertyId && event.metadata.propertyId !== params.propertyId)
        return false;
      if (params?.clientId && event.metadata.clientId !== params.clientId)
        return false;
      if (params?.agentId && event.metadata.agentId !== params.agentId)
        return false;
      return true;
    });
  }

  /**
   * Cancel property viewing
   */
  async cancelPropertyViewing(googleEventId: string, reason?: string): Promise<void> {
    const event = await this.getEvent(googleEventId);

    // Update description with cancellation reason
    if (reason) {
      event.description = `${event.description}\n\nCANCELLED: ${reason}`;
    }

    event.cancel();
    await this.updateEvent(event);
  }

  /**
   * Confirm property viewing
   */
  async confirmPropertyViewing(googleEventId: string): Promise<CalendarEvent> {
    const event = await this.getEvent(googleEventId);
    event.confirm();
    return await this.updateEvent(event);
  }

  /**
   * Map Google Calendar event to domain entity
   */
  private mapGoogleEventToEntity(
    googleEvent: calendar_v3.Schema$Event,
  ): CalendarEvent {
    const startTime = googleEvent.start?.dateTime
      ? new Date(googleEvent.start.dateTime)
      : new Date(googleEvent.start?.date!);

    const endTime = googleEvent.end?.dateTime
      ? new Date(googleEvent.end.dateTime)
      : new Date(googleEvent.end?.date!);

    const isAllDay = !googleEvent.start?.dateTime;

    const organizer: EventParticipant = {
      email: googleEvent.organizer?.email || '',
      name: googleEvent.organizer?.displayName,
      isOrganizer: true,
    };

    const attendees: EventParticipant[] =
      googleEvent.attendees?.map((a) => ({
        email: a.email!,
        name: a.displayName,
        responseStatus: a.responseStatus as any,
      })) || [];

    const reminders: EventReminder[] =
      googleEvent.reminders?.overrides?.map((r) => ({
        method: r.method as any,
        minutes: r.minutes!,
      })) || [];

    // Extract metadata from extended properties
    const extendedProps = googleEvent.extendedProperties?.private;
    const metadata: EventMetadata = {
      propertyId: extendedProps?.propertyId,
      clientId: extendedProps?.clientId,
      agentId: extendedProps?.agentId,
    };

    const eventType =
      (extendedProps?.eventType as EventType) || EventType.OTHER;

    return new CalendarEvent({
      googleEventId: googleEvent.id,
      type: eventType,
      status: (googleEvent.status as EventStatus) || EventStatus.CONFIRMED,
      syncStatus: SyncStatus.SYNCED,
      title: googleEvent.summary || 'Untitled Event',
      description: googleEvent.description,
      location: googleEvent.location,
      startTime,
      endTime,
      isAllDay,
      timezone: googleEvent.start?.timeZone || 'Europe/Rome',
      organizer,
      attendees,
      reminders,
      metadata,
      recurrence: googleEvent.recurrence?.[0],
      lastSyncedAt: new Date(),
      createdAt: googleEvent.created ? new Date(googleEvent.created) : new Date(),
      updatedAt: googleEvent.updated ? new Date(googleEvent.updated) : new Date(),
    });
  }
}
