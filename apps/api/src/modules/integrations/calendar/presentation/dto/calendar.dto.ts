/**
 * Calendar DTOs (Presentation Layer)
 *
 * Data Transfer Objects for Calendar endpoints.
 */

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsArray,
  IsOptional,
  IsEnum,
  IsBoolean,
  IsNumber,
  IsDate,
  ValidateNested,
  IsEmail,
} from 'class-validator';
import { Type } from 'class-transformer';
import {
  EventType,
  EventStatus,
  SyncStatus,
  EventParticipant,
  EventReminder,
  EventMetadata,
} from '../../domain/entities/calendar-event.entity';

/**
 * Event participant DTO
 */
export class EventParticipantDto implements EventParticipant {
  @ApiProperty({
    description: 'Email address',
    example: 'client@example.com',
  })
  @IsEmail()
  email: string;

  @ApiPropertyOptional({
    description: 'Display name',
    example: 'Mario Rossi',
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({
    description: 'Response status',
    enum: ['accepted', 'declined', 'tentative', 'needsAction'],
  })
  @IsOptional()
  @IsString()
  responseStatus?: 'accepted' | 'declined' | 'tentative' | 'needsAction';

  @ApiPropertyOptional({
    description: 'Is event organizer',
  })
  @IsOptional()
  @IsBoolean()
  isOrganizer?: boolean;
}

/**
 * Event reminder DTO
 */
export class EventReminderDto implements EventReminder {
  @ApiProperty({
    description: 'Reminder method',
    enum: ['email', 'popup', 'sms'],
    example: 'email',
  })
  @IsEnum(['email', 'popup', 'sms'])
  method: 'email' | 'popup' | 'sms';

  @ApiProperty({
    description: 'Minutes before event',
    example: 60,
  })
  @IsNumber()
  minutes: number;
}

/**
 * Event metadata DTO
 */
export class EventMetadataDto implements EventMetadata {
  @ApiPropertyOptional({
    description: 'Linked property ID',
  })
  @IsOptional()
  @IsString()
  propertyId?: string;

  @ApiPropertyOptional({
    description: 'Linked client ID',
  })
  @IsOptional()
  @IsString()
  clientId?: string;

  @ApiPropertyOptional({
    description: 'Linked agent ID',
  })
  @IsOptional()
  @IsString()
  agentId?: string;

  @ApiPropertyOptional({
    description: 'Property address',
  })
  @IsOptional()
  @IsString()
  propertyAddress?: string;

  @ApiPropertyOptional({
    description: 'Additional notes',
  })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({
    description: 'Viewing type',
    enum: ['in-person', 'virtual'],
  })
  @IsOptional()
  @IsEnum(['in-person', 'virtual'])
  viewingType?: 'in-person' | 'virtual';
}

/**
 * Create event DTO
 */
export class CreateEventDto {
  @ApiProperty({
    description: 'Event type',
    enum: EventType,
    example: EventType.PROPERTY_VIEWING,
  })
  @IsEnum(EventType)
  type: EventType;

  @ApiProperty({
    description: 'Event title',
    example: 'Property Viewing - Via Roma 123',
  })
  @IsString()
  title: string;

  @ApiPropertyOptional({
    description: 'Event description',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    description: 'Event location',
    example: 'Via Roma 123, Milano',
  })
  @IsOptional()
  @IsString()
  location?: string;

  @ApiProperty({
    description: 'Start time (ISO 8601)',
    example: '2025-11-15T10:00:00Z',
  })
  @IsString()
  startTime: string;

  @ApiProperty({
    description: 'End time (ISO 8601)',
    example: '2025-11-15T11:00:00Z',
  })
  @IsString()
  endTime: string;

  @ApiPropertyOptional({
    description: 'Is all-day event',
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  isAllDay?: boolean;

  @ApiPropertyOptional({
    description: 'Timezone',
    example: 'Europe/Rome',
    default: 'Europe/Rome',
  })
  @IsOptional()
  @IsString()
  timezone?: string;

  @ApiProperty({
    description: 'Event organizer',
    type: EventParticipantDto,
  })
  @ValidateNested()
  @Type(() => EventParticipantDto)
  organizer: EventParticipantDto;

  @ApiPropertyOptional({
    description: 'Event attendees',
    type: [EventParticipantDto],
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => EventParticipantDto)
  attendees?: EventParticipantDto[];

  @ApiPropertyOptional({
    description: 'Event reminders',
    type: [EventReminderDto],
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => EventReminderDto)
  reminders?: EventReminderDto[];

  @ApiPropertyOptional({
    description: 'Event metadata',
    type: EventMetadataDto,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => EventMetadataDto)
  metadata?: EventMetadataDto;

  @ApiPropertyOptional({
    description: 'Recurrence rule (RRULE format)',
    example: 'RRULE:FREQ=WEEKLY;BYDAY=MO,WE,FR',
  })
  @IsOptional()
  @IsString()
  recurrence?: string;
}

/**
 * Update event DTO
 */
export class UpdateEventDto {
  @ApiPropertyOptional({
    description: 'Event title',
  })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional({
    description: 'Event description',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    description: 'Event location',
  })
  @IsOptional()
  @IsString()
  location?: string;

  @ApiPropertyOptional({
    description: 'Start time (ISO 8601)',
  })
  @IsOptional()
  @IsString()
  startTime?: string;

  @ApiPropertyOptional({
    description: 'End time (ISO 8601)',
  })
  @IsOptional()
  @IsString()
  endTime?: string;

  @ApiPropertyOptional({
    description: 'Event attendees',
    type: [EventParticipantDto],
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => EventParticipantDto)
  attendees?: EventParticipantDto[];

  @ApiPropertyOptional({
    description: 'Event reminders',
    type: [EventReminderDto],
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => EventReminderDto)
  reminders?: EventReminderDto[];

  @ApiPropertyOptional({
    description: 'Event metadata',
    type: EventMetadataDto,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => EventMetadataDto)
  metadata?: EventMetadataDto;
}

/**
 * Create property viewing DTO
 */
export class CreatePropertyViewingDto {
  @ApiProperty({
    description: 'Property ID',
    example: 'prop_123',
  })
  @IsString()
  propertyId: string;

  @ApiProperty({
    description: 'Client ID',
    example: 'client_456',
  })
  @IsString()
  clientId: string;

  @ApiProperty({
    description: 'Agent ID',
    example: 'agent_789',
  })
  @IsString()
  agentId: string;

  @ApiProperty({
    description: 'Property address',
    example: 'Via Roma 123, Milano',
  })
  @IsString()
  propertyAddress: string;

  @ApiProperty({
    description: 'Start time (ISO 8601)',
    example: '2025-11-15T10:00:00Z',
  })
  @IsString()
  startTime: string;

  @ApiProperty({
    description: 'Duration in minutes',
    example: 60,
  })
  @IsNumber()
  durationMinutes: number;

  @ApiProperty({
    description: 'Client email',
    example: 'client@example.com',
  })
  @IsEmail()
  clientEmail: string;

  @ApiPropertyOptional({
    description: 'Client name',
    example: 'Mario Rossi',
  })
  @IsOptional()
  @IsString()
  clientName?: string;

  @ApiPropertyOptional({
    description: 'Additional notes',
  })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({
    description: 'Viewing type',
    enum: ['in-person', 'virtual'],
    default: 'in-person',
  })
  @IsOptional()
  @IsEnum(['in-person', 'virtual'])
  viewingType?: 'in-person' | 'virtual';
}

/**
 * Calendar event DTO (response)
 */
export class CalendarEventDto {
  @ApiProperty({
    description: 'Internal event ID',
  })
  id: string;

  @ApiPropertyOptional({
    description: 'Google Calendar event ID',
  })
  googleEventId?: string;

  @ApiProperty({
    description: 'Event type',
    enum: EventType,
  })
  type: EventType;

  @ApiProperty({
    description: 'Event status',
    enum: EventStatus,
  })
  status: EventStatus;

  @ApiProperty({
    description: 'Sync status',
    enum: SyncStatus,
  })
  syncStatus: SyncStatus;

  @ApiProperty({
    description: 'Event title',
  })
  title: string;

  @ApiPropertyOptional({
    description: 'Event description',
  })
  description?: string;

  @ApiPropertyOptional({
    description: 'Event location',
  })
  location?: string;

  @ApiProperty({
    description: 'Start time',
  })
  startTime: Date;

  @ApiProperty({
    description: 'End time',
  })
  endTime: Date;

  @ApiProperty({
    description: 'Is all-day event',
  })
  isAllDay: boolean;

  @ApiProperty({
    description: 'Timezone',
  })
  timezone: string;

  @ApiProperty({
    description: 'Event organizer',
    type: EventParticipantDto,
  })
  organizer: EventParticipant;

  @ApiProperty({
    description: 'Event attendees',
    type: [EventParticipantDto],
  })
  attendees: EventParticipant[];

  @ApiProperty({
    description: 'Event reminders',
    type: [EventReminderDto],
  })
  reminders: EventReminder[];

  @ApiProperty({
    description: 'Event metadata',
    type: EventMetadataDto,
  })
  metadata: EventMetadata;

  @ApiPropertyOptional({
    description: 'Recurrence rule',
  })
  recurrence?: string;

  @ApiPropertyOptional({
    description: 'Last synced at',
  })
  lastSyncedAt?: Date;

  @ApiPropertyOptional({
    description: 'Sync error message',
  })
  syncError?: string;

  @ApiProperty({
    description: 'Created at',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Updated at',
  })
  updatedAt: Date;
}

/**
 * OAuth token DTO
 */
export class OAuthTokenDto {
  @ApiProperty({
    description: 'Access token',
  })
  accessToken: string;

  @ApiProperty({
    description: 'Refresh token',
  })
  refreshToken: string;

  @ApiProperty({
    description: 'Token expiry date (Unix timestamp)',
  })
  expiryDate: number;
}

/**
 * Sync stats DTO
 */
export class SyncStatsDto {
  @ApiProperty({
    description: 'Events created',
  })
  created: number;

  @ApiProperty({
    description: 'Events updated',
  })
  updated: number;

  @ApiProperty({
    description: 'Events deleted',
  })
  deleted: number;
}
