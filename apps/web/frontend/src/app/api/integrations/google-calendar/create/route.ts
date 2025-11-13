/**
 * Create Google Calendar Event from Activity
 * POST /api/integrations/google-calendar/create
 * Body: { activityId: string }
 *
 * Creates a Google Calendar event from a CRM Activity
 */

import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';
import { prisma } from '@/lib/db';
import { getGoogleAuthClient } from '@/lib/google-auth';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const { activityId } = await request.json();

    if (!activityId) {
      return NextResponse.json(
        { error: 'activityId is required' },
        { status: 400 }
      );
    }

    // Get activity with related data
    const activity = await prisma.activity.findUnique({
      where: { id: activityId },
      include: {
        contact: true,
        property: true,
      },
    });

    if (!activity) {
      return NextResponse.json(
        { error: 'Activity not found' },
        { status: 404 }
      );
    }

    // Check if already synced
    if (activity.googleEventId) {
      return NextResponse.json({
        success: true,
        eventId: activity.googleEventId,
        eventUrl: activity.googleEventUrl,
        message: 'Event already exists on Google Calendar',
        alreadyExists: true,
      });
    }

    // Get authenticated client
    const auth = await getGoogleAuthClient('google_calendar');
    const calendar = google.calendar({ version: 'v3', auth });

    // Get primary calendar
    const { data: calendarList } = await calendar.calendarList.list();
    const primaryCalendar = calendarList.items?.find(cal => cal.primary);

    if (!primaryCalendar?.id) {
      return NextResponse.json(
        { error: 'No primary calendar found' },
        { status: 404 }
      );
    }

    // Calculate start and end times
    const startTime = activity.scheduledAt || new Date();
    const durationMinutes = activity.duration || 60;
    const endTime = new Date(startTime.getTime() + durationMinutes * 60000);

    // Build event description
    let description = activity.description || '';

    if (activity.contact) {
      description += `\n\n📞 Contatto: ${activity.contact.fullName}`;
      if (activity.contact.primaryPhone) {
        description += `\nTel: ${activity.contact.primaryPhone}`;
      }
      if (activity.contact.primaryEmail) {
        description += `\nEmail: ${activity.contact.primaryEmail}`;
      }
    }

    if (activity.property) {
      description += `\n\n🏠 Immobile: ${activity.property.code}`;
      description += `\n${activity.property.street}${activity.property.civic ? ', ' + activity.property.civic : ''}`;
      description += `\n${activity.property.city}`;
      if (activity.property.priceSale) {
        description += `\nPrezzo: €${activity.property.priceSale.toLocaleString()}`;
      }
    }

    // Build event object
    const event: any = {
      summary: activity.title,
      description: description.trim(),
      start: {
        dateTime: startTime.toISOString(),
        timeZone: 'Europe/Rome',
      },
      end: {
        dateTime: endTime.toISOString(),
        timeZone: 'Europe/Rome',
      },
      reminders: {
        useDefault: false,
        overrides: [
          { method: 'email', minutes: 24 * 60 }, // 1 day before
          { method: 'popup', minutes: 30 }, // 30 minutes before
        ],
      },
    };

    // Add location if available
    if (activity.locationAddress) {
      event.location = activity.locationAddress;
    } else if (activity.property) {
      event.location = `${activity.property.street}${activity.property.civic ? ', ' + activity.property.civic : ''}, ${activity.property.city}`;
    }

    // Add attendees if contact has email
    if (activity.contact?.primaryEmail) {
      event.attendees = [
        { email: activity.contact.primaryEmail }
      ];
    }

    // Set event color based on priority
    if (activity.priority === 'urgent') {
      event.colorId = '11'; // Red
    } else if (activity.priority === 'high') {
      event.colorId = '9'; // Blue
    }

    // Create event on Google Calendar
    const { data: createdEvent } = await calendar.events.insert({
      calendarId: primaryCalendar.id,
      requestBody: event,
      sendUpdates: activity.contact?.primaryEmail ? 'all' : 'none',
    });

    // Update activity with Google Calendar info
    await prisma.activity.update({
      where: { id: activityId },
      data: {
        googleEventId: createdEvent.id,
        googleCalendarId: primaryCalendar.id,
        googleEventUrl: createdEvent.htmlLink || undefined,
        syncedToGoogle: true,
        lastSyncedAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      eventId: createdEvent.id,
      eventUrl: createdEvent.htmlLink,
      message: 'Event created successfully on Google Calendar',
    });
  } catch (error: any) {
    console.error('Create calendar event error:', error);
    return NextResponse.json(
      {
        error: 'Failed to create calendar event',
        details: error.message
      },
      { status: 500 }
    );
  }
}
