/**
 * Gmail - Fetch new emails
 * POST /api/integrations/gmail/fetch
 *
 * Fetches unread emails from Gmail and creates MessageLog records
 */

import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';
import { prisma } from '@/lib/db';
import { getGoogleAuthClient } from '@/lib/google-auth';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    // Get authenticated client
    const auth = await getGoogleAuthClient('gmail');
    const gmail = google.gmail({ version: 'v1', auth });

    // Get auth record for last sync timestamp
    const authRecord = await prisma.integrationAuth.findFirst({
      where: { provider: 'gmail', isActive: true },
    });

    // Calculate query date (fetch emails from last 7 days or last sync)
    const after = authRecord?.lastSyncAt
      ? Math.floor(authRecord.lastSyncAt.getTime() / 1000)
      : Math.floor((Date.now() - 7 * 24 * 60 * 60 * 1000) / 1000);

    // Fetch unread messages
    const { data: listData } = await gmail.users.messages.list({
      userId: 'me',
      q: `is:unread after:${after}`,
      maxResults: 50,
    });

    const messages = listData.messages || [];
    let processed = 0;
    let skipped = 0;

    for (const message of messages) {
      if (!message.id) continue;

      // Check if already processed
      const existing = await prisma.messageLog.findUnique({
        where: {
          provider_messageId: {
            provider: 'gmail',
            messageId: message.id,
          },
        },
      });

      if (existing) {
        skipped++;
        continue;
      }

      // Fetch full message details
      const { data: fullMessage } = await gmail.users.messages.get({
        userId: 'me',
        id: message.id,
        format: 'full',
      });

      // Parse headers
      const headers = fullMessage.payload?.headers || [];
      const from = headers.find(h => h.name === 'From')?.value || '';
      const to = headers.find(h => h.name === 'To')?.value || '';
      const subject = headers.find(h => h.name === 'Subject')?.value || '';
      const dateStr = headers.find(h => h.name === 'Date')?.value;
      const cc = headers.find(h => h.name === 'Cc')?.value;

      // Extract body
      const body = extractBody(fullMessage.payload);
      const snippet = fullMessage.snippet || '';

      // Try to match contact by email
      const fromEmail = extractEmail(from);
      const contact = fromEmail
        ? await prisma.contact.findFirst({
            where: {
              OR: [
                { primaryEmail: { contains: fromEmail, mode: 'insensitive' } },
                { secondaryEmail: { contains: fromEmail, mode: 'insensitive' } },
              ],
            },
          })
        : null;

      // Parse CC emails
      const ccEmails = cc ? cc.split(',').map((e: string) => extractEmail(e.trim())).filter(Boolean) : [];

      // Create message log
      const messageLog = await prisma.messageLog.create({
        data: {
          provider: 'gmail',
          messageId: message.id,
          threadId: message.threadId,
          contactId: contact?.id,
          direction: 'inbound',
          status: 'received',
          subject,
          body,
          snippet,
          fromEmail,
          fromName: extractName(from),
          toEmail: extractEmail(to),
          toName: extractName(to),
          cc: ccEmails.length > 0 ? ccEmails : undefined,
          sentAt: dateStr ? new Date(dateStr) : new Date(),
          receivedAt: new Date(),
          hasAttachments: hasAttachments(fullMessage.payload),
        },
      });

      // Create processing task for AI analysis
      await prisma.messageProcessing.create({
        data: {
          messageLogId: messageLog.id,
          status: 'pending',
          priority: 1, // High priority for emails
          processorType: 'message_analyzer',
        },
      });

      // Update contact last email date
      if (contact) {
        await prisma.contact.update({
          where: { id: contact.id },
          data: {
            lastContactDate: new Date(),
            lastEmailDate: new Date(),
            emailThreadId: message.threadId,
          },
        });
      }

      processed++;
    }

    // Update last sync timestamp
    if (authRecord) {
      await prisma.integrationAuth.update({
        where: { id: authRecord.id },
        data: {
          lastSyncAt: new Date(),
          nextSyncAt: new Date(Date.now() + 5 * 60 * 1000), // Next sync in 5 minutes
        },
      });
    }

    return NextResponse.json({
      success: true,
      summary: {
        messagesFound: messages.length,
        messagesProcessed: processed,
        messagesSkipped: skipped,
      },
    });
  } catch (error: any) {
    console.error('Gmail fetch error:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch emails',
        details: error.message
      },
      { status: 500 }
    );
  }
}

/**
 * Extract email body from Gmail payload
 */
function extractBody(payload: any): string {
  if (!payload) return '';

  // Direct body data
  if (payload.body?.data) {
    return Buffer.from(payload.body.data, 'base64').toString('utf-8');
  }

  // Multipart message
  if (payload.parts) {
    // Try text/plain first
    for (const part of payload.parts) {
      if (part.mimeType === 'text/plain' && part.body?.data) {
        return Buffer.from(part.body.data, 'base64').toString('utf-8');
      }
    }
    // Fallback to HTML
    for (const part of payload.parts) {
      if (part.mimeType === 'text/html' && part.body?.data) {
        return Buffer.from(part.body.data, 'base64').toString('utf-8');
      }
    }
    // Recursive search in nested parts
    for (const part of payload.parts) {
      if (part.parts) {
        const nestedBody = extractBody(part);
        if (nestedBody) return nestedBody;
      }
    }
  }

  return '';
}

/**
 * Extract email address from string like "Name <email@example.com>"
 */
function extractEmail(str: string): string {
  const match = str.match(/<(.+?)>/);
  return match ? match[1] : str.trim();
}

/**
 * Extract name from string like "Name <email@example.com>"
 */
function extractName(str: string): string {
  const match = str.match(/^(.+?)\s*</);
  return match ? match[1].replace(/"/g, '').trim() : '';
}

/**
 * Check if message has attachments
 */
function hasAttachments(payload: any): boolean {
  if (!payload?.parts) return false;
  return payload.parts.some((part: any) =>
    part.filename && part.body?.attachmentId
  );
}
