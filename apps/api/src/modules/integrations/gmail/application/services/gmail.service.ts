/**
 * Gmail Service (Application Layer)
 *
 * Handles Gmail API integration for email synchronization and sending.
 */

import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { google, gmail_v1 } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';
import { PrismaService } from '../../../../../shared/database/prisma.service';
import {
  EmailMessage,
  EmailDirection,
  EmailStatus,
  EmailParticipant,
  EmailAttachment,
} from '../../domain/entities/email-message.entity';

@Injectable()
export class GmailService {
  private readonly logger = new Logger(GmailService.name);
  private oauth2Client: OAuth2Client;
  private gmail: gmail_v1.Gmail;

  constructor(
    private configService: ConfigService,
    private prisma: PrismaService,
  ) {
    this.initializeOAuth();
  }

  /**
   * Initialize OAuth2 client
   */
  private initializeOAuth(): void {
    const clientId = this.configService.get('GOOGLE_CLIENT_ID');
    const clientSecret = this.configService.get('GOOGLE_CLIENT_SECRET');
    const redirectUri = this.configService.get('GOOGLE_REDIRECT_URI');

    this.oauth2Client = new google.auth.OAuth2(
      clientId,
      clientSecret,
      redirectUri,
    );

    this.gmail = google.gmail({ version: 'v1', auth: this.oauth2Client });

    this.logger.log('✅ Gmail OAuth2 client initialized');
  }

  /**
   * Get authorization URL for OAuth flow
   */
  getAuthUrl(): string {
    const scopes = [
      'https://www.googleapis.com/auth/gmail.readonly',
      'https://www.googleapis.com/auth/gmail.send',
      'https://www.googleapis.com/auth/gmail.modify',
      'https://www.googleapis.com/auth/gmail.labels',
    ];

    return this.oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: scopes,
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
   * Set credentials from stored tokens
   */
  setCredentials(accessToken: string, refreshToken: string): void {
    this.oauth2Client.setCredentials({
      access_token: accessToken,
      refresh_token: refreshToken,
    });
  }

  /**
   * Refresh access token
   */
  async refreshAccessToken(refreshToken: string): Promise<string> {
    this.oauth2Client.setCredentials({ refresh_token: refreshToken });
    const { credentials } = await this.oauth2Client.refreshAccessToken();
    return credentials.access_token!;
  }

  /**
   * Sync inbox messages and persist to database
   */
  async syncInbox(maxResults: number = 50): Promise<EmailMessage[]> {
    this.logger.log(`Syncing inbox (max ${maxResults} messages)`);

    try {
      const response = await this.gmail.users.messages.list({
        userId: 'me',
        labelIds: ['INBOX'],
        maxResults,
      });

      const messages: EmailMessage[] = [];
      let persistedCount = 0;

      if (response.data.messages) {
        for (const msgRef of response.data.messages) {
          try {
            const email = await this.fetchMessage(msgRef.id!);
            if (email) {
              // 🔥 NEW: Match with CRM contacts by email
              const matchingContact = await this.prisma.contact.findFirst({
                where: {
                  OR: [
                    { primaryEmail: email.from.email },
                    { secondaryEmail: email.from.email },
                  ],
                },
              });

              if (matchingContact) {
                email.contactId = matchingContact.id;
                this.logger.debug(
                  `✅ Matched email from ${email.from.email} to contact ${matchingContact.fullName}`,
                );
              }

              // 🔥 NEW: Persist to database
              const dbData = email.toDatabaseFormat();
              await this.prisma.emailMessage.upsert({
                where: { gmailId: email.gmailId },
                create: {
                  ...dbData,
                  id: undefined, // Let Prisma generate the ID
                },
                update: {
                  ...dbData,
                  id: undefined,
                  gmailId: undefined, // Don't update unique fields
                },
              });

              persistedCount++;
              messages.push(email);
            }
          } catch (error) {
            this.logger.warn(`Failed to fetch message ${msgRef.id}:`, error);
          }
        }
      }

      this.logger.log(
        `✅ Synced ${messages.length} inbox messages (${persistedCount} persisted to DB)`,
      );

      return messages;
    } catch (error) {
      this.logger.error('Error syncing inbox:', error);
      throw error;
    }
  }

  /**
   * Fetch a single message by ID
   */
  async fetchMessage(messageId: string): Promise<EmailMessage | null> {
    try {
      const response = await this.gmail.users.messages.get({
        userId: 'me',
        id: messageId,
        format: 'full',
      });

      const msg = response.data;

      if (!msg.payload) {
        return null;
      }

      // Parse headers
      const headers = msg.payload.headers || [];
      const getHeader = (name: string) =>
        headers.find((h) => h.name?.toLowerCase() === name.toLowerCase())
          ?.value || '';

      const from = this.parseEmailAddress(getHeader('from'));
      const to = this.parseEmailAddresses(getHeader('to'));
      const cc = this.parseEmailAddresses(getHeader('cc'));
      const subject = getHeader('subject');
      const date = new Date(parseInt(msg.internalDate || '0'));

      // Parse body
      const { text, html } = this.extractEmailBody(msg.payload);

      // Parse attachments
      const attachments = this.extractAttachments(msg.payload);

      // Determine direction
      const direction = msg.labelIds?.includes('SENT')
        ? EmailDirection.OUTBOUND
        : EmailDirection.INBOUND;

      // Determine status
      const status = msg.labelIds?.includes('UNREAD')
        ? EmailStatus.UNREAD
        : EmailStatus.READ;

      const email = new EmailMessage({
        gmailId: msg.id!,
        threadId: msg.threadId!,
        direction,
        status,
        from,
        to,
        cc: cc.length > 0 ? cc : undefined,
        subject,
        textContent: text,
        htmlContent: html,
        attachments: attachments.length > 0 ? attachments : undefined,
        sentAt: date,
        receivedAt: date,
        labels: msg.labelIds || [],
        inReplyTo: getHeader('in-reply-to'),
      });

      return email;
    } catch (error) {
      this.logger.error(`Error fetching message ${messageId}:`, error);
      return null;
    }
  }

  /**
   * Send email
   */
  async sendEmail(params: {
    to: string[];
    cc?: string[];
    subject: string;
    textContent: string;
    htmlContent?: string;
    attachments?: Array<{
      filename: string;
      content: Buffer;
      mimeType: string;
    }>;
    inReplyTo?: string;
  }): Promise<EmailMessage> {
    this.logger.log(`Sending email to: ${params.to.join(', ')}`);

    try {
      // Build email message
      const messageParts: string[] = [];

      // Headers
      messageParts.push(`To: ${params.to.join(', ')}`);
      if (params.cc && params.cc.length > 0) {
        messageParts.push(`Cc: ${params.cc.join(', ')}`);
      }
      messageParts.push(`Subject: ${params.subject}`);
      if (params.inReplyTo) {
        messageParts.push(`In-Reply-To: ${params.inReplyTo}`);
      }
      messageParts.push('MIME-Version: 1.0');
      messageParts.push(
        'Content-Type: text/html; charset=utf-8',
      );
      messageParts.push('');

      // Body
      messageParts.push(params.htmlContent || params.textContent);

      const message = messageParts.join('\r\n');

      // Encode message
      const encodedMessage = Buffer.from(message)
        .toString('base64')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');

      // Send via Gmail API
      const response = await this.gmail.users.messages.send({
        userId: 'me',
        requestBody: {
          raw: encodedMessage,
        },
      });

      this.logger.log(`✅ Email sent: ${response.data.id}`);

      // Fetch sent message for return
      const sentEmail = await this.fetchMessage(response.data.id!);
      return sentEmail!;
    } catch (error) {
      this.logger.error('Error sending email:', error);
      throw error;
    }
  }

  /**
   * Mark message as read
   */
  async markAsRead(messageId: string): Promise<void> {
    await this.gmail.users.messages.modify({
      userId: 'me',
      id: messageId,
      requestBody: {
        removeLabelIds: ['UNREAD'],
      },
    });
  }

  /**
   * Mark message as unread
   */
  async markAsUnread(messageId: string): Promise<void> {
    await this.gmail.users.messages.modify({
      userId: 'me',
      id: messageId,
      requestBody: {
        addLabelIds: ['UNREAD'],
      },
    });
  }

  /**
   * Archive message
   */
  async archiveMessage(messageId: string): Promise<void> {
    await this.gmail.users.messages.modify({
      userId: 'me',
      id: messageId,
      requestBody: {
        removeLabelIds: ['INBOX'],
      },
    });
  }

  /**
   * Delete message
   */
  async deleteMessage(messageId: string): Promise<void> {
    await this.gmail.users.messages.trash({
      userId: 'me',
      id: messageId,
    });
  }

  /**
   * Download attachment
   */
  async downloadAttachment(
    messageId: string,
    attachmentId: string,
  ): Promise<Buffer> {
    const response = await this.gmail.users.messages.attachments.get({
      userId: 'me',
      messageId,
      id: attachmentId,
    });

    const data = response.data.data!;
    return Buffer.from(data, 'base64');
  }

  /**
   * Parse email address from string
   */
  private parseEmailAddress(str: string): EmailParticipant {
    const match = str.match(/^(?:"?([^"]*)"?\s)?<?([^>]+)>?$/);

    if (match) {
      return {
        name: match[1]?.trim() || undefined,
        email: match[2].trim(),
      };
    }

    return { email: str.trim() };
  }

  /**
   * Parse multiple email addresses
   */
  private parseEmailAddresses(str: string): EmailParticipant[] {
    if (!str) return [];

    return str
      .split(',')
      .map((s) => this.parseEmailAddress(s.trim()))
      .filter((p) => p.email);
  }

  /**
   * Extract email body from payload
   */
  private extractEmailBody(payload: gmail_v1.Schema$MessagePart): {
    text: string;
    html?: string;
  } {
    let text = '';
    let html: string | undefined;

    const extractPart = (part: gmail_v1.Schema$MessagePart) => {
      if (part.mimeType === 'text/plain' && part.body?.data) {
        text = Buffer.from(part.body.data, 'base64').toString('utf-8');
      } else if (part.mimeType === 'text/html' && part.body?.data) {
        html = Buffer.from(part.body.data, 'base64').toString('utf-8');
      }

      if (part.parts) {
        part.parts.forEach(extractPart);
      }
    };

    extractPart(payload);

    return { text, html };
  }

  /**
   * Extract attachments from payload
   */
  private extractAttachments(
    payload: gmail_v1.Schema$MessagePart,
  ): EmailAttachment[] {
    const attachments: EmailAttachment[] = [];

    const extractPart = (part: gmail_v1.Schema$MessagePart) => {
      if (part.filename && part.body?.attachmentId) {
        attachments.push({
          filename: part.filename,
          mimeType: part.mimeType || 'application/octet-stream',
          size: part.body.size || 0,
          attachmentId: part.body.attachmentId,
        });
      }

      if (part.parts) {
        part.parts.forEach(extractPart);
      }
    };

    extractPart(payload);

    return attachments;
  }

  /**
   * List emails from CRM contacts only
   */
  async listEmailsFromContacts(params?: {
    contactId?: string;
    propertyId?: string;
    status?: string;
    direction?: string;
    limit?: number;
  }): Promise<EmailMessage[]> {
    this.logger.log('Fetching emails from CRM contacts');

    const where: any = {
      contactId: { not: null }, // Only emails linked to CRM contacts
    };

    if (params?.contactId) where.contactId = params.contactId;
    if (params?.propertyId) where.propertyId = params.propertyId;
    if (params?.status) where.status = params.status;
    if (params?.direction) where.direction = params.direction;

    const dbEmails = await this.prisma.emailMessage.findMany({
      where,
      orderBy: { receivedAt: 'desc' },
      take: params?.limit || 100,
      include: {
        contact: true,
        property: true,
      },
    });

    // Convert from DB format to EmailMessage entities
    const emails = dbEmails.map((dbEmail) => {
      const email = new EmailMessage({
        id: dbEmail.id,
        gmailId: dbEmail.gmailId,
        threadId: dbEmail.threadId,
        direction: dbEmail.direction as any,
        status: dbEmail.status as any,
        from: {
          name: dbEmail.fromName || undefined,
          email: dbEmail.fromEmail,
        },
        to: JSON.parse(dbEmail.toEmails as string),
        cc: dbEmail.ccEmails ? JSON.parse(dbEmail.ccEmails as string) : undefined,
        subject: dbEmail.subject,
        textContent: dbEmail.textContent,
        htmlContent: dbEmail.htmlContent || undefined,
        attachments: dbEmail.attachments
          ? JSON.parse(dbEmail.attachments as string)
          : undefined,
        sentAt: dbEmail.sentAt,
        receivedAt: dbEmail.receivedAt,
        readAt: dbEmail.readAt || undefined,
        labels: JSON.parse(dbEmail.labels as string),
        inReplyTo: dbEmail.inReplyTo || undefined,
        contactId: dbEmail.contactId || undefined,
        propertyId: dbEmail.propertyId || undefined,
        parsedData: dbEmail.parsedData
          ? JSON.parse(dbEmail.parsedData as string)
          : undefined,
        isParsed: dbEmail.isParsed,
      });

      return email;
    });

    this.logger.log(`✅ Found ${emails.length} emails from CRM contacts`);

    return emails;
  }

  /**
   * Watch for new emails (setup push notifications)
   */
  async watchInbox(): Promise<void> {
    const topicName = this.configService.get('GMAIL_PUBSUB_TOPIC');

    if (!topicName) {
      this.logger.warn('Gmail PubSub topic not configured');
      return;
    }

    await this.gmail.users.watch({
      userId: 'me',
      requestBody: {
        topicName,
        labelIds: ['INBOX'],
      },
    });

    this.logger.log('✅ Gmail watch setup for push notifications');
  }

  /**
   * Stop watching
   */
  async stopWatch(): Promise<void> {
    await this.gmail.users.stop({
      userId: 'me',
    });

    this.logger.log('Gmail watch stopped');
  }
}
