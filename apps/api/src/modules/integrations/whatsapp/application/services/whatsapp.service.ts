/**
 * WhatsApp Service (Application Layer)
 *
 * Handles WhatsApp Business API integration for messaging.
 */

import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { PrismaService } from '../../../../../shared/database/prisma.service';
import { firstValueFrom } from 'rxjs';
import {
  WhatsAppMessage,
  MessageDirection,
  MessageStatus,
  MessageType,
  WhatsAppMedia,
  WhatsAppInteractive,
} from '../../domain/entities/whatsapp-message.entity';

@Injectable()
export class WhatsAppService {
  private readonly logger = new Logger(WhatsAppService.name);
  private readonly apiUrl: string;
  private readonly accessToken: string;
  private readonly phoneNumberId: string;

  constructor(
    private configService: ConfigService,
    private httpService: HttpService,
    private prisma: PrismaService,
  ) {
    this.apiUrl = this.configService.get('WHATSAPP_API_URL', 'https://graph.facebook.com/v18.0');
    this.accessToken = this.configService.get('WHATSAPP_ACCESS_TOKEN', '');
    this.phoneNumberId = this.configService.get('WHATSAPP_PHONE_NUMBER_ID', '');

    if (!this.accessToken || !this.phoneNumberId) {
      this.logger.warn('⚠️ WhatsApp credentials not configured');
    } else {
      this.logger.log('✅ WhatsApp service initialized');
    }
  }

  /**
   * Send text message
   */
  async sendTextMessage(
    to: string,
    text: string,
    contextMessageId?: string,
  ): Promise<WhatsAppMessage> {
    this.logger.log(`Sending text message to ${to}`);

    const payload: any = {
      messaging_product: 'whatsapp',
      to,
      type: 'text',
      text: { body: text },
    };

    if (contextMessageId) {
      payload.context = { message_id: contextMessageId };
    }

    const response = await this.sendMessage(payload);

    const message = new WhatsAppMessage({
      whatsappId: response.messages[0].id,
      direction: MessageDirection.OUTBOUND,
      status: MessageStatus.SENT,
      type: MessageType.TEXT,
      from: this.phoneNumberId,
      to,
      text,
      timestamp: new Date(),
      contextMessageId,
    });

    this.logger.log(`✅ Text message sent: ${message.whatsappId}`);

    return message;
  }

  /**
   * Send image message
   */
  async sendImageMessage(
    to: string,
    imageUrl: string,
    caption?: string,
    contextMessageId?: string,
  ): Promise<WhatsAppMessage> {
    this.logger.log(`Sending image to ${to}`);

    const payload: any = {
      messaging_product: 'whatsapp',
      to,
      type: 'image',
      image: {
        link: imageUrl,
        caption,
      },
    };

    if (contextMessageId) {
      payload.context = { message_id: contextMessageId };
    }

    const response = await this.sendMessage(payload);

    const message = new WhatsAppMessage({
      whatsappId: response.messages[0].id,
      direction: MessageDirection.OUTBOUND,
      status: MessageStatus.SENT,
      type: MessageType.IMAGE,
      from: this.phoneNumberId,
      to,
      media: {
        url: imageUrl,
        caption,
        mimeType: 'image/jpeg',
      },
      timestamp: new Date(),
      contextMessageId,
    });

    this.logger.log(`✅ Image sent: ${message.whatsappId}`);

    return message;
  }

  /**
   * Send document message
   */
  async sendDocumentMessage(
    to: string,
    documentUrl: string,
    filename: string,
    caption?: string,
    contextMessageId?: string,
  ): Promise<WhatsAppMessage> {
    this.logger.log(`Sending document to ${to}`);

    const payload: any = {
      messaging_product: 'whatsapp',
      to,
      type: 'document',
      document: {
        link: documentUrl,
        filename,
        caption,
      },
    };

    if (contextMessageId) {
      payload.context = { message_id: contextMessageId };
    }

    const response = await this.sendMessage(payload);

    const message = new WhatsAppMessage({
      whatsappId: response.messages[0].id,
      direction: MessageDirection.OUTBOUND,
      status: MessageStatus.SENT,
      type: MessageType.DOCUMENT,
      from: this.phoneNumberId,
      to,
      media: {
        url: documentUrl,
        filename,
        caption,
        mimeType: 'application/pdf',
      },
      timestamp: new Date(),
      contextMessageId,
    });

    this.logger.log(`✅ Document sent: ${message.whatsappId}`);

    return message;
  }

  /**
   * Send template message
   */
  async sendTemplateMessage(
    to: string,
    templateName: string,
    languageCode: string,
    parameters?: string[],
  ): Promise<WhatsAppMessage> {
    this.logger.log(`Sending template "${templateName}" to ${to}`);

    const payload: any = {
      messaging_product: 'whatsapp',
      to,
      type: 'template',
      template: {
        name: templateName,
        language: { code: languageCode },
      },
    };

    if (parameters && parameters.length > 0) {
      payload.template.components = [
        {
          type: 'body',
          parameters: parameters.map((text) => ({ type: 'text', text })),
        },
      ];
    }

    const response = await this.sendMessage(payload);

    const message = new WhatsAppMessage({
      whatsappId: response.messages[0].id,
      direction: MessageDirection.OUTBOUND,
      status: MessageStatus.SENT,
      type: MessageType.TEMPLATE,
      from: this.phoneNumberId,
      to,
      text: `Template: ${templateName}`,
      timestamp: new Date(),
    });

    this.logger.log(`✅ Template sent: ${message.whatsappId}`);

    return message;
  }

  /**
   * Send interactive button message
   */
  async sendButtonMessage(
    to: string,
    bodyText: string,
    buttons: Array<{ id: string; title: string }>,
    headerText?: string,
    footerText?: string,
  ): Promise<WhatsAppMessage> {
    this.logger.log(`Sending button message to ${to}`);

    const interactive: WhatsAppInteractive = {
      type: 'button',
      body: { text: bodyText },
      action: {
        buttons: buttons.map((btn) => ({ type: 'reply', reply: btn })),
      },
    };

    if (headerText) {
      interactive.header = { type: 'text', text: headerText };
    }

    if (footerText) {
      interactive.footer = { text: footerText };
    }

    const payload = {
      messaging_product: 'whatsapp',
      to,
      type: 'interactive',
      interactive,
    };

    const response = await this.sendMessage(payload);

    const message = new WhatsAppMessage({
      whatsappId: response.messages[0].id,
      direction: MessageDirection.OUTBOUND,
      status: MessageStatus.SENT,
      type: MessageType.INTERACTIVE,
      from: this.phoneNumberId,
      to,
      interactive,
      timestamp: new Date(),
    });

    this.logger.log(`✅ Button message sent: ${message.whatsappId}`);

    return message;
  }

  /**
   * Mark message as read
   */
  async markAsRead(messageId: string): Promise<void> {
    const url = `${this.apiUrl}/${this.phoneNumberId}/messages`;

    await firstValueFrom(
      this.httpService.post(
        url,
        {
          messaging_product: 'whatsapp',
          status: 'read',
          message_id: messageId,
        },
        {
          headers: {
            Authorization: `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json',
          },
        },
      ),
    );

    this.logger.debug(`Message ${messageId} marked as read`);
  }

  /**
   * Download media file
   */
  async downloadMedia(mediaId: string): Promise<Buffer> {
    // Get media URL
    const mediaUrl = `${this.apiUrl}/${mediaId}`;

    const urlResponse = await firstValueFrom(
      this.httpService.get(mediaUrl, {
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
        },
      }),
    );

    const downloadUrl = urlResponse.data.url;

    // Download media file
    const fileResponse = await firstValueFrom(
      this.httpService.get(downloadUrl, {
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
        },
        responseType: 'arraybuffer',
      }),
    );

    return Buffer.from(fileResponse.data);
  }

  /**
   * Send HTTP request to WhatsApp API
   */
  private async sendMessage(payload: any): Promise<any> {
    const url = `${this.apiUrl}/${this.phoneNumberId}/messages`;

    try {
      const response = await firstValueFrom(
        this.httpService.post(url, payload, {
          headers: {
            Authorization: `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json',
          },
        }),
      );

      return response.data;
    } catch (error) {
      this.logger.error('Error sending WhatsApp message:', error);
      throw error;
    }
  }

  /**
   * Handle incoming webhook message and persist to database
   */
  async handleIncomingMessage(webhookData: any): Promise<WhatsAppMessage> {
    const entry = webhookData.entry[0];
    const change = entry.changes[0];
    const value = change.value;

    if (!value.messages || value.messages.length === 0) {
      throw new Error('No messages in webhook data');
    }

    const msg = value.messages[0];
    const contact = value.contacts ? value.contacts[0] : null;

    // Create message entity
    const message = new WhatsAppMessage({
      whatsappId: msg.id,
      direction: MessageDirection.INBOUND,
      status: MessageStatus.DELIVERED,
      type: msg.type as MessageType,
      from: msg.from,
      to: value.metadata.phone_number_id,
      timestamp: new Date(parseInt(msg.timestamp) * 1000),
    });

    // Parse message content based on type
    switch (msg.type) {
      case 'text':
        message.text = msg.text.body;
        break;

      case 'image':
        message.media = {
          id: msg.image.id,
          mimeType: msg.image.mime_type,
          caption: msg.image.caption,
          sha256: msg.image.sha256,
        };
        break;

      case 'document':
        message.media = {
          id: msg.document.id,
          mimeType: msg.document.mime_type,
          filename: msg.document.filename,
          caption: msg.document.caption,
          sha256: msg.document.sha256,
        };
        break;

      case 'location':
        message.location = {
          latitude: msg.location.latitude,
          longitude: msg.location.longitude,
          name: msg.location.name,
          address: msg.location.address,
        };
        break;

      case 'button':
        message.text = msg.button.text;
        message.contextMessageId = msg.context?.id;
        break;
    }

    // 🔥 NEW: Match with CRM contacts by phone number
    const matchingContact = await this.prisma.contact.findFirst({
      where: {
        OR: [
          { primaryPhone: message.from },
          { secondaryPhone: message.from },
        ],
      },
    });

    if (matchingContact) {
      message.contactId = matchingContact.id;
      this.logger.debug(
        `✅ Matched WhatsApp message from ${message.from} to contact ${matchingContact.fullName}`,
      );
    }

    // 🔥 NEW: Persist to database
    const dbData = message.toDatabaseFormat();
    await this.prisma.whatsAppMessage.create({
      data: {
        ...dbData,
        id: undefined, // Let Prisma generate the ID
      },
    });

    // Mark as read automatically
    await this.markAsRead(msg.id);

    this.logger.log(`✅ Incoming message processed and saved: ${message.whatsappId}`);

    return message;
  }

  /**
   * Handle status update webhook
   */
  handleStatusUpdate(webhookData: any): void {
    const entry = webhookData.entry[0];
    const change = entry.changes[0];
    const value = change.value;

    if (!value.statuses || value.statuses.length === 0) {
      return;
    }

    const status = value.statuses[0];

    this.logger.log(
      `Message ${status.id} status: ${status.status}`,
    );

    // TODO: Update message status in database
  }

  /**
   * List WhatsApp messages from CRM contacts only
   */
  async listMessagesFromContacts(params?: {
    contactId?: string;
    propertyId?: string;
    status?: string;
    direction?: string;
    type?: string;
    limit?: number;
  }): Promise<WhatsAppMessage[]> {
    this.logger.log('Fetching WhatsApp messages from CRM contacts');

    const where: any = {
      contactId: { not: null }, // Only messages linked to CRM contacts
    };

    if (params?.contactId) where.contactId = params.contactId;
    if (params?.propertyId) where.propertyId = params.propertyId;
    if (params?.status) where.status = params.status;
    if (params?.direction) where.direction = params.direction;
    if (params?.type) where.type = params.type;

    const dbMessages = await this.prisma.whatsAppMessage.findMany({
      where,
      orderBy: { timestamp: 'desc' },
      take: params?.limit || 100,
      include: {
        contact: true,
        property: true,
      },
    });

    // Convert from DB format to WhatsAppMessage entities
    const messages = dbMessages.map((dbMsg) => {
      const message = new WhatsAppMessage({
        id: dbMsg.id,
        whatsappId: dbMsg.whatsappId,
        direction: dbMsg.direction as any,
        status: dbMsg.status as any,
        type: dbMsg.type as any,
        from: dbMsg.fromPhone,
        to: dbMsg.toPhone,
        contactId: dbMsg.contactId || undefined,
        text: dbMsg.text || undefined,
        media: dbMsg.media ? JSON.parse(dbMsg.media as string) : undefined,
        location: dbMsg.location ? JSON.parse(dbMsg.location as string) : undefined,
        interactive: dbMsg.interactive
          ? JSON.parse(dbMsg.interactive as string)
          : undefined,
        timestamp: dbMsg.timestamp,
        contextMessageId: dbMsg.contextMessageId || undefined,
        referralUrl: dbMsg.referralUrl || undefined,
        propertyId: dbMsg.propertyId || undefined,
        parsedData: dbMsg.parsedData
          ? JSON.parse(dbMsg.parsedData as string)
          : undefined,
        isParsed: dbMsg.isParsed,
      });

      return message;
    });

    this.logger.log(`✅ Found ${messages.length} WhatsApp messages from CRM contacts`);

    return messages;
  }

  /**
   * Verify webhook signature
   */
  verifyWebhookSignature(
    signature: string,
    rawBody: string,
    secret: string,
  ): boolean {
    const crypto = require('crypto');
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(rawBody)
      .digest('hex');

    return signature === `sha256=${expectedSignature}`;
  }
}
