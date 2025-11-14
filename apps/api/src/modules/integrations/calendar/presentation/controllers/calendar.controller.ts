/**
 * Calendar Controller (Presentation Layer)
 *
 * REST API endpoints for Google Calendar integration.
 */

import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Logger,
  HttpCode,
  HttpStatus,
  Redirect,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../../../core/guards/jwt-auth.guard';
import { CalendarService } from '../../application/services/calendar.service';
import {
  CreateEventDto,
  UpdateEventDto,
  CreatePropertyViewingDto,
  CalendarEventDto,
  SyncStatsDto,
  OAuthTokenDto,
} from '../dto/calendar.dto';
import { CalendarEvent } from '../../domain/entities/calendar-event.entity';

@ApiTags('calendar')
@Controller('calendar')
export class CalendarController {
  private readonly logger = new Logger(CalendarController.name);

  constructor(private calendarService: CalendarService) {}

  /**
   * GET /calendar/auth
   * Get Google OAuth authorization URL
   */
  @Get('auth')
  @ApiOperation({
    summary: 'Get OAuth URL',
    description: 'Get Google Calendar OAuth authorization URL.',
  })
  @ApiResponse({
    status: 200,
    description: 'OAuth URL generated',
    schema: {
      type: 'object',
      properties: {
        authUrl: { type: 'string' },
      },
    },
  })
  getAuthUrl(): { authUrl: string } {
    const authUrl = this.calendarService.getAuthUrl();
    return { authUrl };
  }

  /**
   * POST /calendar/auth/callback
   * Handle OAuth callback and exchange code for tokens
   */
  @Post('auth/callback')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'OAuth callback',
    description: 'Exchange authorization code for access tokens.',
  })
  @ApiResponse({
    status: 200,
    description: 'Tokens obtained',
    type: OAuthTokenDto,
  })
  async handleOAuthCallback(
    @Body('code') code: string,
  ): Promise<OAuthTokenDto> {
    this.logger.log('Handling OAuth callback');

    const tokens = await this.calendarService.exchangeCodeForTokens(code);

    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      expiryDate: tokens.expiryDate,
    };
  }

  /**
   * POST /calendar/auth/refresh
   * Refresh access token
   */
  @Post('auth/refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Refresh token',
    description: 'Refresh expired access token.',
  })
  @ApiResponse({
    status: 200,
    description: 'Token refreshed',
  })
  async refreshToken(
    @Body('refreshToken') refreshToken: string,
  ): Promise<{ accessToken: string; expiryDate: number }> {
    this.logger.log('Refreshing access token');

    return await this.calendarService.refreshAccessToken(refreshToken);
  }

  /**
   * POST /calendar/events
   * Create calendar event
   */
  @Post('events')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create event',
    description: 'Create a new calendar event.',
  })
  @ApiResponse({
    status: 201,
    description: 'Event created',
    type: CalendarEventDto,
  })
  async createEvent(@Body() dto: CreateEventDto): Promise<CalendarEventDto> {
    this.logger.log(`Creating event: ${dto.title}`);

    // TODO: Extract access token from user session
    // this.calendarService.setAccessToken(accessToken, refreshToken);

    const event = new CalendarEvent({
      type: dto.type,
      title: dto.title,
      description: dto.description,
      location: dto.location,
      startTime: new Date(dto.startTime),
      endTime: new Date(dto.endTime),
      isAllDay: dto.isAllDay,
      timezone: dto.timezone,
      organizer: dto.organizer,
      attendees: dto.attendees,
      reminders: dto.reminders,
      metadata: dto.metadata,
      recurrence: dto.recurrence,
    });

    const createdEvent = await this.calendarService.createEvent(event);

    return this.mapEventToDto(createdEvent);
  }

  /**
   * PUT /calendar/events/:googleEventId
   * Update calendar event
   */
  @Put('events/:googleEventId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Update event',
    description: 'Update an existing calendar event.',
  })
  @ApiParam({ name: 'googleEventId', description: 'Google Calendar event ID' })
  @ApiResponse({
    status: 200,
    description: 'Event updated',
    type: CalendarEventDto,
  })
  async updateEvent(
    @Param('googleEventId') googleEventId: string,
    @Body() dto: UpdateEventDto,
  ): Promise<CalendarEventDto> {
    this.logger.log(`Updating event: ${googleEventId}`);

    const event = await this.calendarService.getEvent(googleEventId);

    // Update fields
    if (dto.title) event.title = dto.title;
    if (dto.description !== undefined) event.description = dto.description;
    if (dto.location !== undefined) event.location = dto.location;
    if (dto.startTime) event.startTime = new Date(dto.startTime);
    if (dto.endTime) event.endTime = new Date(dto.endTime);
    if (dto.attendees) event.attendees = dto.attendees;
    if (dto.reminders) event.reminders = dto.reminders;
    if (dto.metadata) event.metadata = { ...event.metadata, ...dto.metadata };

    const updatedEvent = await this.calendarService.updateEvent(event);

    return this.mapEventToDto(updatedEvent);
  }

  /**
   * DELETE /calendar/events/:googleEventId
   * Delete calendar event
   */
  @Delete('events/:googleEventId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Delete event',
    description: 'Delete a calendar event.',
  })
  @ApiParam({ name: 'googleEventId', description: 'Google Calendar event ID' })
  @ApiResponse({
    status: 204,
    description: 'Event deleted',
  })
  async deleteEvent(@Param('googleEventId') googleEventId: string): Promise<void> {
    this.logger.log(`Deleting event: ${googleEventId}`);

    await this.calendarService.deleteEvent(googleEventId);
  }

  /**
   * GET /calendar/events/:googleEventId
   * Get single event
   */
  @Get('events/:googleEventId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Get event',
    description: 'Get a single calendar event by ID.',
  })
  @ApiParam({ name: 'googleEventId', description: 'Google Calendar event ID' })
  @ApiResponse({
    status: 200,
    description: 'Event found',
    type: CalendarEventDto,
  })
  async getEvent(
    @Param('googleEventId') googleEventId: string,
  ): Promise<CalendarEventDto> {
    const event = await this.calendarService.getEvent(googleEventId);
    return this.mapEventToDto(event);
  }

  /**
   * GET /calendar/events
   * List upcoming events
   */
  @Get('events')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'List events',
    description: 'List upcoming calendar events.',
  })
  @ApiQuery({
    name: 'maxResults',
    required: false,
    type: Number,
    description: 'Maximum number of results',
  })
  @ApiQuery({
    name: 'timeMin',
    required: false,
    type: String,
    description: 'Start date (ISO 8601)',
  })
  @ApiQuery({
    name: 'timeMax',
    required: false,
    type: String,
    description: 'End date (ISO 8601)',
  })
  @ApiResponse({
    status: 200,
    description: 'Events list',
    type: [CalendarEventDto],
  })
  async listEvents(
    @Query('maxResults') maxResults?: number,
    @Query('timeMin') timeMin?: string,
    @Query('timeMax') timeMax?: string,
  ): Promise<CalendarEventDto[]> {
    const events = await this.calendarService.listUpcomingEvents({
      maxResults,
      timeMin: timeMin ? new Date(timeMin) : undefined,
      timeMax: timeMax ? new Date(timeMax) : undefined,
    });

    return events.map((e) => this.mapEventToDto(e));
  }

  /**
   * POST /calendar/sync
   * Sync events from Google Calendar
   */
  @Post('sync')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Sync from Google',
    description: 'Sync events from Google Calendar to local database.',
  })
  @ApiResponse({
    status: 200,
    description: 'Sync completed',
    type: SyncStatsDto,
  })
  async syncFromGoogle(
    @Query('timeMin') timeMin?: string,
    @Query('timeMax') timeMax?: string,
  ): Promise<SyncStatsDto> {
    this.logger.log('Starting calendar sync');

    const stats = await this.calendarService.syncFromGoogle({
      timeMin: timeMin ? new Date(timeMin) : undefined,
      timeMax: timeMax ? new Date(timeMax) : undefined,
    });

    return stats;
  }

  /**
   * POST /calendar/viewings
   * Create property viewing event
   */
  @Post('viewings')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create property viewing',
    description: 'Create a property viewing appointment.',
  })
  @ApiResponse({
    status: 201,
    description: 'Viewing created',
    type: CalendarEventDto,
  })
  async createPropertyViewing(
    @Body() dto: CreatePropertyViewingDto,
  ): Promise<CalendarEventDto> {
    this.logger.log(`Creating property viewing for property ${dto.propertyId}`);

    const event = await this.calendarService.createPropertyViewing({
      propertyId: dto.propertyId,
      clientId: dto.clientId,
      agentId: dto.agentId,
      propertyAddress: dto.propertyAddress,
      startTime: new Date(dto.startTime),
      durationMinutes: dto.durationMinutes,
      clientEmail: dto.clientEmail,
      clientName: dto.clientName,
      notes: dto.notes,
      viewingType: dto.viewingType,
    });

    return this.mapEventToDto(event);
  }

  /**
   * GET /calendar/viewings
   * Get property viewing events
   */
  @Get('viewings')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Get property viewings',
    description: 'Get property viewing appointments.',
  })
  @ApiQuery({
    name: 'propertyId',
    required: false,
    description: 'Filter by property ID',
  })
  @ApiQuery({
    name: 'clientId',
    required: false,
    description: 'Filter by client ID',
  })
  @ApiQuery({
    name: 'agentId',
    required: false,
    description: 'Filter by agent ID',
  })
  @ApiQuery({
    name: 'startDate',
    required: false,
    description: 'Start date (ISO 8601)',
  })
  @ApiQuery({
    name: 'endDate',
    required: false,
    description: 'End date (ISO 8601)',
  })
  @ApiResponse({
    status: 200,
    description: 'Viewings list',
    type: [CalendarEventDto],
  })
  async getPropertyViewings(
    @Query('propertyId') propertyId?: string,
    @Query('clientId') clientId?: string,
    @Query('agentId') agentId?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ): Promise<CalendarEventDto[]> {
    const events = await this.calendarService.getPropertyViewings({
      propertyId,
      clientId,
      agentId,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
    });

    return events.map((e) => this.mapEventToDto(e));
  }

  /**
   * POST /calendar/viewings/:googleEventId/cancel
   * Cancel property viewing
   */
  @Post('viewings/:googleEventId/cancel')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Cancel viewing',
    description: 'Cancel a property viewing appointment.',
  })
  @ApiParam({ name: 'googleEventId', description: 'Google Calendar event ID' })
  @ApiResponse({
    status: 200,
    description: 'Viewing cancelled',
  })
  async cancelPropertyViewing(
    @Param('googleEventId') googleEventId: string,
    @Body('reason') reason?: string,
  ): Promise<{ success: boolean }> {
    this.logger.log(`Cancelling viewing: ${googleEventId}`);

    await this.calendarService.cancelPropertyViewing(googleEventId, reason);

    return { success: true };
  }

  /**
   * POST /calendar/viewings/:googleEventId/confirm
   * Confirm property viewing
   */
  @Post('viewings/:googleEventId/confirm')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Confirm viewing',
    description: 'Confirm a property viewing appointment.',
  })
  @ApiParam({ name: 'googleEventId', description: 'Google Calendar event ID' })
  @ApiResponse({
    status: 200,
    description: 'Viewing confirmed',
    type: CalendarEventDto,
  })
  async confirmPropertyViewing(
    @Param('googleEventId') googleEventId: string,
  ): Promise<CalendarEventDto> {
    this.logger.log(`Confirming viewing: ${googleEventId}`);

    const event = await this.calendarService.confirmPropertyViewing(googleEventId);

    return this.mapEventToDto(event);
  }

  /**
   * Map entity to DTO
   */
  private mapEventToDto(event: CalendarEvent): CalendarEventDto {
    return {
      id: event.id,
      googleEventId: event.googleEventId,
      type: event.type,
      status: event.status,
      syncStatus: event.syncStatus,
      title: event.title,
      description: event.description,
      location: event.location,
      startTime: event.startTime,
      endTime: event.endTime,
      isAllDay: event.isAllDay,
      timezone: event.timezone,
      organizer: event.organizer,
      attendees: event.attendees,
      reminders: event.reminders,
      metadata: event.metadata,
      recurrence: event.recurrence,
      lastSyncedAt: event.lastSyncedAt,
      syncError: event.syncError,
      createdAt: event.createdAt,
      updatedAt: event.updatedAt,
    };
  }
}
