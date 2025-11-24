/**
 * Email Message Entity (Domain Layer)
 *
 * Represents an email message from Gmail.
 */

export enum EmailDirection {
  INBOUND = 'inbound',
  OUTBOUND = 'outbound',
}

export enum EmailStatus {
  UNREAD = 'unread',
  READ = 'read',
  ARCHIVED = 'archived',
  DELETED = 'deleted',
}

export interface EmailParticipant {
  name?: string;
  email: string;
}

export interface EmailAttachment {
  filename: string;
  mimeType: string;
  size: number;
  attachmentId: string;
  downloaded?: boolean;
  localPath?: string;
}

export interface EmailParsedData {
  intent?: 'property_inquiry' | 'viewing_request' | 'general_question' | 'complaint' | 'feedback';
  propertyRequirements?: {
    city?: string;
    zone?: string;
    contractType?: 'sale' | 'rent';
    propertyType?: string;
    budgetMin?: number;
    budgetMax?: number;
    surfaceMin?: number;
    surfaceMax?: number;
    rooms?: number;
    features?: string[];
  };
  urgency?: 'low' | 'medium' | 'high';
  sentiment?: 'positive' | 'neutral' | 'negative';
  suggestedActions?: string[];
  extractedPhoneNumbers?: string[];
  extractedDates?: Date[];
}

export class EmailMessage {
  id: string;
  gmailId: string;
  threadId: string;
  direction: EmailDirection;
  status: EmailStatus;

  from: EmailParticipant;
  to: EmailParticipant[];
  cc?: EmailParticipant[];
  bcc?: EmailParticipant[];

  subject: string;
  textContent: string;
  htmlContent?: string;

  attachments?: EmailAttachment[];

  sentAt: Date;
  receivedAt: Date;
  readAt?: Date;

  labels: string[];
  inReplyTo?: string;

  contactId?: string; // Linked CRM contact
  propertyId?: string; // Linked property if mentioned

  parsedData?: EmailParsedData;
  isParsed: boolean;

  constructor(data: Partial<EmailMessage>) {
    Object.assign(this, data);
    this.id = data.id || this.generateId();
    this.isParsed = data.isParsed || false;
    this.labels = data.labels || [];
  }

  /**
   * Mark as read
   */
  markAsRead(): void {
    this.status = EmailStatus.READ;
    this.readAt = new Date();
  }

  /**
   * Mark as unread
   */
  markAsUnread(): void {
    this.status = EmailStatus.UNREAD;
    this.readAt = undefined;
  }

  /**
   * Archive email
   */
  archive(): void {
    this.status = EmailStatus.ARCHIVED;
  }

  /**
   * Check if email is from a specific sender
   */
  isFrom(email: string): boolean {
    return this.from.email.toLowerCase() === email.toLowerCase();
  }

  /**
   * Check if email contains attachments
   */
  hasAttachments(): boolean {
    return this.attachments !== undefined && this.attachments.length > 0;
  }

  /**
   * Check if email is a reply
   */
  isReply(): boolean {
    return this.inReplyTo !== undefined;
  }

  /**
   * Check if email mentions a property
   */
  mentionsProperty(): boolean {
    return this.propertyId !== undefined;
  }

  /**
   * Check if email is linked to a contact
   */
  hasLinkedContact(): boolean {
    return this.contactId !== undefined;
  }

  /**
   * Check if email needs action
   */
  needsAction(): boolean {
    return (
      this.status === EmailStatus.UNREAD &&
      this.direction === EmailDirection.INBOUND &&
      (this.parsedData?.intent === 'property_inquiry' ||
        this.parsedData?.intent === 'viewing_request' ||
        this.parsedData?.urgency === 'high')
    );
  }

  /**
   * Get priority score (0-100)
   */
  getPriorityScore(): number {
    let score = 50;

    // Urgency
    if (this.parsedData?.urgency === 'high') score += 30;
    if (this.parsedData?.urgency === 'medium') score += 15;

    // Intent
    if (this.parsedData?.intent === 'viewing_request') score += 20;
    if (this.parsedData?.intent === 'property_inquiry') score += 15;
    if (this.parsedData?.intent === 'complaint') score += 25;

    // Sentiment
    if (this.parsedData?.sentiment === 'negative') score += 10;

    // Has contact
    if (this.hasLinkedContact()) score += 5;

    return Math.min(100, score);
  }

  /**
   * Get plain text snippet (first 200 chars)
   */
  getSnippet(maxLength: number = 200): string {
    const text = this.textContent || '';
    return text.length > maxLength
      ? text.substring(0, maxLength) + '...'
      : text;
  }

  /**
   * Generate unique ID
   */
  private generateId(): string {
    return `email_${Date.now()}_${Math.random().toString(36).substring(7)}`;
  }

  /**
   * Convert to database format
   */
  toDatabaseFormat(): any {
    return {
      gmailId: this.gmailId,
      threadId: this.threadId,
      direction: this.direction,
      status: this.status,
      fromName: this.from.name,
      fromEmail: this.from.email,
      toEmails: JSON.stringify(this.to),
      ccEmails: this.cc ? JSON.stringify(this.cc) : null,
      subject: this.subject,
      textContent: this.textContent,
      htmlContent: this.htmlContent,
      attachments: this.attachments ? JSON.stringify(this.attachments) : null,
      sentAt: this.sentAt,
      receivedAt: this.receivedAt,
      readAt: this.readAt,
      labels: JSON.stringify(this.labels),
      inReplyTo: this.inReplyTo,
      contactId: this.contactId,
      propertyId: this.propertyId,
      parsedData: this.parsedData ? JSON.stringify(this.parsedData) : null,
      isParsed: this.isParsed,
    };
  }
}
