/**
 * Google Calendar Sync - Pull events from Google
 * POST /api/integrations/google-calendar/sync
 *
 * Fetches events from Google Calendar and creates/updates Activity records
 */

import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';
import { prisma } from '@/lib/db';
import { getGoogleAuthClient } from '@/lib/google-auth';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    // Get authenticated client
    const auth = await getGoogleAuthClient('google_calendar');
    const calendar = google.calendar({ version: 'v3', auth });

    // Get primary calendar ID
    const { data: calendarList } = await calendar.calendarList.list();
    const primaryCalendar = calendarList.items?.find(cal => cal.primary);

    if (!primaryCalendar?.id) {
      return NextResponse.json(
        { error: 'No primary calendar found' },
        { status: 404 }
      );
    }

    // Get or create sync state
    let syncState = await prisma.calendarSync.findUnique({
      where: { calendarId: primaryCalendar.id },
    });

    // Prepare list parameters
    const params: any = {
      calendarId: primaryCalendar.id,
      maxResults: 100,
      singleEvents: true,
      orderBy: 'startTime',
    };

    // Use incremental sync if we have a sync token
    if (syncState?.lastSyncToken) {
      params.syncToken = syncState.lastSyncToken;
      // Don't include timeMin when using syncToken
    } else {
      // First sync: get events from now onwards
      params.timeMin = new Date().toISOString();
    }

    // Fetch events from Google Calendar
    const { data: eventsData } = await calendar.events.list(params);
    const events = eventsData.items || [];

    let created = 0;
    let updated = 0;
    let deleted = 0;

    // Process each event
    for (const event of events) {
      if (!event.id) continue;

      // Handle deleted events
      if (event.status === 'cancelled') {
        const existingActivity = await prisma.activity.findFirst({
          where: { googleEventId: event.id },
        });

        if (existingActivity) {
          await prisma.activity.update({
            where: { id: existingActivity.id },
            data: {
              status: 'cancelled',
              lastSyncedAt: new Date(),
            },
          });
          deleted++;
        }
        continue;
      }

      // Skip events without start time
      if (!event.start?.dateTime && !event.start?.date) {
        continue;
      }

      // Calculate duration
      const duration = calculateDuration(event.start, event.end);

      // Prepare activity data
      const activityData: any = {
        title: event.summary || 'Evento senza titolo',
        description: event.description || undefined,
        activityType: 'meeting',
        status: event.status === 'confirmed' ? 'scheduled' : 'cancelled',
        scheduledAt: event.start.dateTime
          ? new Date(event.start.dateTime)
          : event.start.date
          ? new Date(event.start.date)
          : undefined,
        duration,
        locationAddress: event.location || undefined,
        googleEventId: event.id,
        googleCalendarId: primaryCalendar.id,
        googleEventUrl: event.htmlLink || undefined,
        syncedToGoogle: true,
        lastSyncedAt: new Date(),
      };

      // Try to match contact by email
      if (event.attendees && event.attendees.length > 0) {
        const attendeeEmail = event.attendees[0].email;
        if (attendeeEmail) {
          const contact = await prisma.contact.findFirst({
            where: {
              OR: [
                { primaryEmail: { contains: attendeeEmail, mode: 'insensitive' } },
                { secondaryEmail: { contains: attendeeEmail, mode: 'insensitive' } },
              ],
            },
          });
          if (contact) {
            activityData.contactId = contact.id;
          }
        }
      }

      // Check if activity already exists
      const existingActivity = await prisma.activity.findFirst({
        where: { googleEventId: event.id },
      });

      if (existingActivity) {
        // Update existing activity
        await prisma.activity.update({
          where: { id: existingActivity.id },
          data: activityData,
        });
        updated++;
      } else {
        // Create new activity
        await prisma.activity.create({
          data: activityData,
        });
        created++;
      }
    }

    // Update or create sync state
    await prisma.calendarSync.upsert({
      where: { calendarId: primaryCalendar.id },
      update: {
        lastSyncToken: eventsData.nextSyncToken || undefined,
        lastSyncAt: new Date(),
        nextSyncAt: new Date(Date.now() + 5 * 60 * 1000), // Next sync in 5 minutes
        eventsSynced: (syncState?.eventsSynced || 0) + events.length,
        eventsCreated: (syncState?.eventsCreated || 0) + created,
        eventsUpdated: (syncState?.eventsUpdated || 0) + updated,
        eventsDeleted: (syncState?.eventsDeleted || 0) + deleted,
        lastError: null,
        errorCount: 0,
      },
      create: {
        calendarId: primaryCalendar.id,
        calendarName: primaryCalendar.summary || 'Primary Calendar',
        isPrimary: true,
        lastSyncToken: eventsData.nextSyncToken || undefined,
        lastSyncAt: new Date(),
        nextSyncAt: new Date(Date.now() + 5 * 60 * 1000),
        eventsSynced: events.length,
        eventsCreated: created,
        eventsUpdated: updated,
        eventsDeleted: deleted,
      },
    });

    return NextResponse.json({
      success: true,
      calendar: {
        id: primaryCalendar.id,
        name: primaryCalendar.summary,
      },
      summary: {
        eventsProcessed: events.length,
        created,
        updated,
        deleted,
      },
    });
  } catch (error: any) {
    console.error('Calendar sync error:', error);

    // Try to save error to sync state
    try {
      const auth = await getGoogleAuthClient('google_calendar');
      const calendar = google.calendar({ version: 'v3', auth });
      const { data: calendarList } = await calendar.calendarList.list();
      const primaryCalendar = calendarList.items?.find(cal => cal.primary);

      if (primaryCalendar?.id) {
        await prisma.calendarSync.upsert({
          where: { calendarId: primaryCalendar.id },
          update: {
            lastError: error.message,
            errorCount: { increment: 1 },
            lastErrorAt: new Date(),
          },
          create: {
            calendarId: primaryCalendar.id,
            calendarName: primaryCalendar.summary || 'Primary Calendar',
            isPrimary: true,
            lastError: error.message,
            errorCount: 1,
            lastErrorAt: new Date(),
          },
        });
      }
    } catch (saveError) {
      console.error('Failed to save sync error:', saveError);
    }

    return NextResponse.json(
      {
        error: 'Calendar sync failed',
        details: error.message
      },
      { status: 500 }
    );
  }
}

/**
 * Calculate event duration in minutes
 */
function calculateDuration(start: any, end: any): number | undefined {
  if (!start?.dateTime || !end?.dateTime) {
    return undefined;
  }

  const startTime = new Date(start.dateTime).getTime();
  const endTime = new Date(end.dateTime).getTime();
  return Math.round((endTime - startTime) / 60000); // Convert to minutes
}
