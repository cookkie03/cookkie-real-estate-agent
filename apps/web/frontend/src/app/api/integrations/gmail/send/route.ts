/**
 * Gmail - Send email
 * POST /api/integrations/gmail/send
 * Body: { to: string, subject: string, body: string, contactId?: string, html?: boolean }
 *
 * Sends an email via Gmail API
 */

import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';
import { prisma } from '@/lib/db';
import { getGoogleAuthClient } from '@/lib/google-auth';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const { to, subject, body, contactId, html = false } = await request.json();

    // Validate required fields
    if (!to || !subject || !body) {
      return NextResponse.json(
        { error: 'to, subject, and body are required' },
        { status: 400 }
      );
    }

    // Get authenticated client
    const auth = await getGoogleAuthClient('gmail');
    const gmail = google.gmail({ version: 'v1', auth });

    // Build email message (RFC 2822 format)
    const contentType = html ? 'text/html' : 'text/plain';
    const message = [
      `To: ${to}`,
      `Subject: ${subject}`,
      `Content-Type: ${contentType}; charset=utf-8`,
      `MIME-Version: 1.0`,
      '',
      body,
    ].join('\n');

    // Encode message in base64url format
    const encodedMessage = Buffer.from(message)
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');

    // Send email
    const { data: sentMessage } = await gmail.users.messages.send({
      userId: 'me',
      requestBody: {
        raw: encodedMessage,
      },
    });

    // Create message log
    const messageLog = await prisma.messageLog.create({
      data: {
        provider: 'gmail',
        messageId: sentMessage.id || '',
        threadId: sentMessage.threadId,
        contactId: contactId || undefined,
        direction: 'outbound',
        status: 'sent',
        subject,
        body,
        bodyHtml: html ? body : undefined,
        snippet: body.substring(0, 200),
        toEmail: to,
        sentAt: new Date(),
      },
    });

    // Update contact if provided
    if (contactId) {
      await prisma.contact.update({
        where: { id: contactId },
        data: {
          lastContactDate: new Date(),
          lastEmailDate: new Date(),
          emailThreadId: sentMessage.threadId,
        },
      });

      // Create activity for sent email
      await prisma.activity.create({
        data: {
          contactId,
          activityType: 'email',
          status: 'completed',
          title: `Email inviata: ${subject}`,
          description: body.substring(0, 500),
          completedAt: new Date(),
          details: {
            messageLogId: messageLog.id,
            provider: 'gmail',
          },
        },
      });
    }

    return NextResponse.json({
      success: true,
      messageId: sentMessage.id,
      threadId: sentMessage.threadId,
      messageLogId: messageLog.id,
    });
  } catch (error: any) {
    console.error('Gmail send error:', error);
    return NextResponse.json(
      {
        error: 'Failed to send email',
        details: error.message
      },
      { status: 500 }
    );
  }
}
