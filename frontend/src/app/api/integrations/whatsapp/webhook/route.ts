/**
 * WhatsApp - Webhook for incoming messages
 * POST /api/integrations/whatsapp/webhook
 *
 * Receives webhook notifications from Twilio for incoming WhatsApp messages
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    // Parse Twilio webhook payload (form-urlencoded)
    const formData = await request.formData();
    const data: Record<string, string> = {};
    formData.forEach((value, key) => {
      data[key] = value.toString();
    });

    const {
      MessageSid,
      From,
      To,
      Body,
      NumMedia,
      ProfileName,
      MediaUrl0,
      MediaContentType0,
    } = data;

    // Validate required fields
    if (!MessageSid || !From || !Body) {
      return new Response('Missing required fields', { status: 400 });
    }

    // Extract phone number (remove whatsapp: prefix)
    const fromPhone = From.replace('whatsapp:', '');
    const toPhone = To ? To.replace('whatsapp:', '') : '';

    // Try to find contact by phone
    const contact = await prisma.contact.findFirst({
      where: {
        OR: [
          { primaryPhone: { contains: fromPhone } },
          { secondaryPhone: { contains: fromPhone } },
        ],
      },
    });

    // Build attachments array if media present
    const attachments = [];
    const numMedia = parseInt(NumMedia || '0');
    if (numMedia > 0 && MediaUrl0) {
      attachments.push({
        url: MediaUrl0,
        mimeType: MediaContentType0 || 'unknown',
        name: `media_${MessageSid}`,
      });
    }

    // Create message log
    const messageLog = await prisma.messageLog.create({
      data: {
        provider: 'whatsapp',
        messageId: MessageSid,
        contactId: contact?.id,
        direction: 'inbound',
        status: 'received',
        body: Body,
        snippet: Body.substring(0, 200),
        fromPhone,
        fromName: ProfileName || undefined,
        toPhone,
        sentAt: new Date(),
        receivedAt: new Date(),
        hasAttachments: numMedia > 0,
        attachments: attachments.length > 0 ? attachments : undefined,
      },
    });

    // Create processing task for AI analysis
    await prisma.messageProcessing.create({
      data: {
        messageLogId: messageLog.id,
        status: 'pending',
        priority: 1, // High priority for incoming messages
        processorType: 'message_analyzer',
      },
    });

    // Update contact if found
    if (contact) {
      await prisma.contact.update({
        where: { id: contact.id },
        data: {
          lastContactDate: new Date(),
          lastWhatsAppDate: new Date(),
        },
      });
    }

    // Log for debugging
    console.log(`Received WhatsApp message from ${fromPhone}:`, Body);

    // Respond to Twilio (200 OK to acknowledge receipt)
    return new Response('Message received', { status: 200 });
  } catch (error: any) {
    console.error('WhatsApp webhook error:', error);
    // Still return 200 to Twilio to avoid retries
    return new Response('Internal error', { status: 200 });
  }
}

// Handle Twilio webhook validation (GET request)
export async function GET(request: NextRequest) {
  // Twilio may send GET requests to validate webhook URL
  return new Response('WhatsApp webhook endpoint active', { status: 200 });
}
