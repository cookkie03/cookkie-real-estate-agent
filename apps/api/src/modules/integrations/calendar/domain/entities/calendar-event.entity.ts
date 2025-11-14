/**
 * Calendar Event Entity (Domain Layer)
 *
 * Represents a calendar event for property viewings and appointments.
 */

export enum EventType {
  PROPERTY_VIEWING = 'property_viewing',
  CLIENT_MEETING = 'client_meeting',
  PROPERTY_INSPECTION = 'property_inspection',
  CONTRACT_SIGNING = 'contract_signing',
  FOLLOW_UP = 'follow_up',
  OTHER = 'other',
}

export enum EventStatus {
  CONFIRMED = 'confirmed',
  TENTATIVE = 'tentative',
  CANCELLED = 'cancelled',
}

export enum SyncStatus {
  SYNCED = 'synced',
  PENDING = 'pending',
  FAILED = 'failed',
}

export interface EventParticipant {
  email: string;
  name?: string;
  responseStatus?: 'accepted' | 'declined' | 'tentative' | 'needsAction';
  isOrganizer?: boolean;
}

export interface EventReminder {
  method: 'email' | 'popup' | 'sms';
  minutes: number; // Minutes before event
}

export interface EventMetadata {
  propertyId?: string;
  clientId?: string;
  agentId?: string;
  propertyAddress?: string;
  notes?: string;
  viewingType?: 'in-person' | 'virtual';
}

export class CalendarEvent {
  id: string;
  googleEventId?: string; // Google Calendar event ID
  type: EventType;
  status: EventStatus;
  syncStatus: SyncStatus;

  // Event details
  title: string;
  description?: string;
  location?: string;
  startTime: Date;
  endTime: Date;
  isAllDay: boolean;
  timezone: string;

  // Participants
  organizer: EventParticipant;
  attendees: EventParticipant[];

  // Reminders
  reminders: EventReminder[];

  // CRM integration
  metadata: EventMetadata;

  // Recurrence
  recurrence?: string; // RRULE format (RFC 5545)

  // Sync metadata
  lastSyncedAt?: Date;
  syncError?: string;

  // Timestamps
  createdAt: Date;
  updatedAt: Date;

  constructor(data: Partial<CalendarEvent>) {
    Object.assign(this, data);
    this.id = data.id || this.generateId();
    this.syncStatus = data.syncStatus || SyncStatus.PENDING;
    this.isAllDay = data.isAllDay || false;
    this.timezone = data.timezone || 'Europe/Rome';
    this.attendees = data.attendees || [];
    this.reminders = data.reminders || [];
    this.createdAt = data.createdAt || new Date();
    this.updatedAt = data.updatedAt || new Date();
  }

  /**
   * Check if event is in the past
   */
  isPast(): boolean {
    return this.endTime < new Date();
  }

  /**
   * Check if event is upcoming (within next 24 hours)
   */
  isUpcoming(): boolean {
    const now = new Date();
    const twentyFourHoursFromNow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    return this.startTime >= now && this.startTime <= twentyFourHoursFromNow;
  }

  /**
   * Check if event is currently happening
   */
  isOngoing(): boolean {
    const now = new Date();
    return this.startTime <= now && this.endTime >= now;
  }

  /**
   * Get event duration in minutes
   */
  getDurationMinutes(): number {
    return Math.floor(
      (this.endTime.getTime() - this.startTime.getTime()) / (1000 * 60),
    );
  }

  /**
   * Check if event needs sync
   */
  needsSync(): boolean {
    return (
      this.syncStatus === SyncStatus.PENDING ||
      this.syncStatus === SyncStatus.FAILED
    );
  }

  /**
   * Check if event is property viewing
   */
  isPropertyViewing(): boolean {
    return this.type === EventType.PROPERTY_VIEWING;
  }

  /**
   * Check if event has CRM data
   */
  hasLinkedData(): boolean {
    return !!(
      this.metadata.propertyId ||
      this.metadata.clientId ||
      this.metadata.agentId
    );
  }

  /**
   * Mark as synced
   */
  markAsSynced(googleEventId: string): void {
    this.googleEventId = googleEventId;
    this.syncStatus = SyncStatus.SYNCED;
    this.lastSyncedAt = new Date();
    this.syncError = undefined;
    this.updatedAt = new Date();
  }

  /**
   * Mark as sync failed
   */
  markAsSyncFailed(error: string): void {
    this.syncStatus = SyncStatus.FAILED;
    this.syncError = error;
    this.updatedAt = new Date();
  }

  /**
   * Cancel event
   */
  cancel(): void {
    this.status = EventStatus.CANCELLED;
    this.updatedAt = new Date();
  }

  /**
   * Confirm event
   */
  confirm(): void {
    this.status = EventStatus.CONFIRMED;
    this.updatedAt = new Date();
  }

  /**
   * Add attendee
   */
  addAttendee(attendee: EventParticipant): void {
    if (!this.attendees.find((a) => a.email === attendee.email)) {
      this.attendees.push(attendee);
      this.updatedAt = new Date();
    }
  }

  /**
   * Remove attendee
   */
  removeAttendee(email: string): void {
    this.attendees = this.attendees.filter((a) => a.email !== email);
    this.updatedAt = new Date();
  }

  /**
   * Get time until event (in minutes)
   */
  getTimeUntilEvent(): number {
    const now = new Date();
    return Math.floor((this.startTime.getTime() - now.getTime()) / (1000 * 60));
  }

  /**
   * Generate unique ID
   */
  private generateId(): string {
    return `cal_${Date.now()}_${Math.random().toString(36).substring(7)}`;
  }

  /**
   * Convert to Google Calendar format
   */
  toGoogleCalendarFormat(): any {
    const event: any = {
      summary: this.title,
      description: this.description,
      location: this.location,
      start: this.isAllDay
        ? { date: this.startTime.toISOString().split('T')[0] }
        : { dateTime: this.startTime.toISOString(), timeZone: this.timezone },
      end: this.isAllDay
        ? { date: this.endTime.toISOString().split('T')[0] }
        : { dateTime: this.endTime.toISOString(), timeZone: this.timezone },
      attendees: this.attendees.map((a) => ({
        email: a.email,
        displayName: a.name,
        responseStatus: a.responseStatus,
      })),
      reminders: {
        useDefault: false,
        overrides: this.reminders.map((r) => ({
          method: r.method,
          minutes: r.minutes,
        })),
      },
      status: this.status,
    };

    if (this.recurrence) {
      event.recurrence = [this.recurrence];
    }

    // Add metadata as extended properties
    if (this.hasLinkedData()) {
      event.extendedProperties = {
        private: {
          propertyId: this.metadata.propertyId,
          clientId: this.metadata.clientId,
          agentId: this.metadata.agentId,
          eventType: this.type,
        },
      };
    }

    return event;
  }

  /**
   * Convert to database format
   */
  toDatabaseFormat(): any {
    return {
      googleEventId: this.googleEventId,
      type: this.type,
      status: this.status,
      syncStatus: this.syncStatus,
      title: this.title,
      description: this.description,
      location: this.location,
      startTime: this.startTime,
      endTime: this.endTime,
      isAllDay: this.isAllDay,
      timezone: this.timezone,
      organizer: JSON.stringify(this.organizer),
      attendees: JSON.stringify(this.attendees),
      reminders: JSON.stringify(this.reminders),
      metadata: JSON.stringify(this.metadata),
      recurrence: this.recurrence,
      lastSyncedAt: this.lastSyncedAt,
      syncError: this.syncError,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}
