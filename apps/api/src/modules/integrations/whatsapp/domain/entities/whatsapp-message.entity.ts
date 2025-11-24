/**
 * WhatsApp Message Entity (Domain Layer)
 *
 * Represents a WhatsApp message exchanged with clients.
 */

export enum MessageDirection {
  INBOUND = 'inbound',
  OUTBOUND = 'outbound',
}

export enum MessageStatus {
  SENT = 'sent',
  DELIVERED = 'delivered',
  READ = 'read',
  FAILED = 'failed',
}

export enum MessageType {
  TEXT = 'text',
  IMAGE = 'image',
  DOCUMENT = 'document',
  AUDIO = 'audio',
  VIDEO = 'video',
  LOCATION = 'location',
  TEMPLATE = 'template',
  INTERACTIVE = 'interactive',
}

export interface WhatsAppMedia {
  id?: string;
  url?: string;
  mimeType?: string;
  caption?: string;
  filename?: string;
  sha256?: string;
}

export interface WhatsAppLocation {
  latitude: number;
  longitude: number;
  name?: string;
  address?: string;
}

export interface WhatsAppButton {
  id: string;
  title: string;
}

export interface WhatsAppInteractive {
  type: 'button' | 'list';
  header?: { type: 'text'; text: string };
  body: { text: string };
  footer?: { text: string };
  action: {
    buttons?: WhatsAppButton[];
    button?: string;
    sections?: Array<{
      title: string;
      rows: Array<{
        id: string;
        title: string;
        description?: string;
      }>;
    }>;
  };
}

export class WhatsAppMessage {
  id: string;
  whatsappId: string; // WhatsApp message ID
  direction: MessageDirection;
  status: MessageStatus;
  type: MessageType;

  // Participants
  from: string; // Phone number
  to: string; // Phone number
  contactId?: string; // Linked CRM contact

  // Content
  text?: string;
  media?: WhatsAppMedia;
  location?: WhatsAppLocation;
  interactive?: WhatsAppInteractive;

  // Metadata
  timestamp: Date;
  contextMessageId?: string; // Reply to message ID
  referralUrl?: string; // Click-to-WhatsApp URL

  // CRM integration
  propertyId?: string; // Linked property
  parsedData?: {
    intent?: 'property_inquiry' | 'viewing_request' | 'general_question';
    requirements?: any;
    urgency?: 'low' | 'medium' | 'high';
  };
  isParsed: boolean;

  constructor(data: Partial<WhatsAppMessage>) {
    Object.assign(this, data);
    this.id = data.id || this.generateId();
    this.isParsed = data.isParsed || false;
  }

  /**
   * Check if message is a reply
   */
  isReply(): boolean {
    return this.contextMessageId !== undefined;
  }

  /**
   * Check if message has media
   */
  hasMedia(): boolean {
    return this.media !== undefined;
  }

  /**
   * Check if message is linked to contact
   */
  hasLinkedContact(): boolean {
    return this.contactId !== undefined;
  }

  /**
   * Check if message needs action
   */
  needsAction(): boolean {
    return (
      this.direction === MessageDirection.INBOUND &&
      !this.isParsed &&
      this.type === MessageType.TEXT
    );
  }

  /**
   * Get priority score
   */
  getPriorityScore(): number {
    let score = 50;

    // Urgency
    if (this.parsedData?.urgency === 'high') score += 30;
    if (this.parsedData?.urgency === 'medium') score += 15;

    // Intent
    if (this.parsedData?.intent === 'viewing_request') score += 20;
    if (this.parsedData?.intent === 'property_inquiry') score += 15;

    // Has contact
    if (this.hasLinkedContact()) score += 5;

    // Inbound messages
    if (this.direction === MessageDirection.INBOUND) score += 10;

    return Math.min(100, score);
  }

  /**
   * Generate unique ID
   */
  private generateId(): string {
    return `wa_${Date.now()}_${Math.random().toString(36).substring(7)}`;
  }

  /**
   * Convert to database format
   */
  toDatabaseFormat(): any {
    return {
      whatsappId: this.whatsappId,
      direction: this.direction,
      status: this.status,
      type: this.type,
      fromPhone: this.from,
      toPhone: this.to,
      contactId: this.contactId,
      text: this.text,
      media: this.media ? JSON.stringify(this.media) : null,
      location: this.location ? JSON.stringify(this.location) : null,
      interactive: this.interactive ? JSON.stringify(this.interactive) : null,
      timestamp: this.timestamp,
      contextMessageId: this.contextMessageId,
      referralUrl: this.referralUrl,
      propertyId: this.propertyId,
      parsedData: this.parsedData ? JSON.stringify(this.parsedData) : null,
      isParsed: this.isParsed,
    };
  }
}
