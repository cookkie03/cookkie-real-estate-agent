/**
 * WhatsApp - Send message
 * POST /api/integrations/whatsapp/send
 * Body: { to: string, message: string, contactId?: string }
 *
 * Sends a WhatsApp message via Twilio
 */

import { NextRequest, NextResponse } from 'next/server';
import { Twilio } from 'twilio';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

// Initialize Twilio client
function getTwilioClient() {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;

  if (!accountSid || !authToken) {
    throw new Error('Twilio credentials not configured. Please set TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN in .env');
  }

  return new Twilio(accountSid, authToken);
}

export async function POST(request: NextRequest) {
  try {
    const { to, message, contactId } = await request.json();

    // Validate required fields
    if (!to || !message) {
      return NextResponse.json(
        { error: 'to and message are required' },
        { status: 400 }
      );
    }

    // Get Twilio client
    const client = getTwilioClient();

    // Format phone numbers with whatsapp: prefix
    const formattedTo = to.startsWith('whatsapp:') ? to : `whatsapp:${to}`;
    const formattedFrom = `whatsapp:${process.env.TWILIO_WHATSAPP_NUMBER}`;

    if (!process.env.TWILIO_WHATSAPP_NUMBER) {
      return NextResponse.json(
        { error: 'Twilio WhatsApp number not configured. Please set TWILIO_WHATSAPP_NUMBER in .env' },
        { status: 500 }
      );
    }

    // Send message via Twilio
    const twilioMessage = await client.messages.create({
      from: formattedFrom,
      to: formattedTo,
      body: message,
    });

    // Create message log
    const messageLog = await prisma.messageLog.create({
      data: {
        provider: 'whatsapp',
        messageId: twilioMessage.sid,
        contactId: contactId || undefined,
        direction: 'outbound',
        status: twilioMessage.status || 'sent',
        body: message,
        snippet: message.substring(0, 200),
        toPhone: to.replace('whatsapp:', ''),
        sentAt: new Date(),
      },
    });

    // Update contact if provided
    if (contactId) {
      await prisma.contact.update({
        where: { id: contactId },
        data: {
          lastContactDate: new Date(),
          lastWhatsAppDate: new Date(),
        },
      });

      // Create activity for sent message
      await prisma.activity.create({
        data: {
          contactId,
          activityType: 'whatsapp_message',
          status: 'completed',
          title: `WhatsApp inviato`,
          description: message.substring(0, 500),
          completedAt: new Date(),
          details: {
            messageLogId: messageLog.id,
            provider: 'whatsapp',
          },
        },
      });
    }

    return NextResponse.json({
      success: true,
      messageId: twilioMessage.sid,
      status: twilioMessage.status,
      messageLogId: messageLog.id,
    });
  } catch (error: any) {
    console.error('WhatsApp send error:', error);
    return NextResponse.json(
      {
        error: 'Failed to send WhatsApp message',
        details: error.message
      },
      { status: 500 }
    );
  }
}
