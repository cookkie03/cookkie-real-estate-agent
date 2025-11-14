/**
 * Gmail DTOs (Presentation Layer)
 *
 * Data Transfer Objects for Gmail endpoints.
 */

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsArray,
  IsEmail,
  IsOptional,
  IsBoolean,
  IsEnum,
  IsNumber,
  IsDate,
} from 'class-validator';
import { Type } from 'class-transformer';
import {
  EmailDirection,
  EmailStatus,
  EmailParticipant,
  EmailAttachment,
  EmailParsedData,
} from '../../domain/entities/email-message.entity';

/**
 * OAuth callback DTO
 */
export class OAuthCallbackDto {
  @ApiProperty({
    description: 'OAuth authorization code',
    example: '4/0AX4XfWi...',
  })
  @IsString()
  code: string;
}

/**
 * Send email DTO
 */
export class SendEmailDto {
  @ApiProperty({
    description: 'Recipient email addresses',
    example: ['client@example.com'],
  })
  @IsArray()
  @IsEmail({}, { each: true })
  to: string[];

  @ApiPropertyOptional({
    description: 'CC email addresses',
    example: ['manager@example.com'],
  })
  @IsOptional()
  @IsArray()
  @IsEmail({}, { each: true })
  cc?: string[];

  @ApiProperty({
    description: 'Email subject',
    example: 'Proprietà disponibili a Milano',
  })
  @IsString()
  subject: string;

  @ApiProperty({
    description: 'Plain text content',
    example: 'Gentile Cliente, le proponiamo...',
  })
  @IsString()
  textContent: string;

  @ApiPropertyOptional({
    description: 'HTML content',
  })
  @IsOptional()
  @IsString()
  htmlContent?: string;

  @ApiPropertyOptional({
    description: 'Message ID to reply to',
  })
  @IsOptional()
  @IsString()
  inReplyTo?: string;
}

/**
 * Email participant DTO
 */
export class EmailParticipantDto implements EmailParticipant {
  @ApiPropertyOptional({
    description: 'Participant name',
    example: 'Mario Rossi',
  })
  name?: string;

  @ApiProperty({
    description: 'Participant email',
    example: 'mario.rossi@example.com',
  })
  email: string;
}

/**
 * Email attachment DTO
 */
export class EmailAttachmentDto implements EmailAttachment {
  @ApiProperty({
    description: 'Filename',
    example: 'property_brochure.pdf',
  })
  filename: string;

  @ApiProperty({
    description: 'MIME type',
    example: 'application/pdf',
  })
  mimeType: string;

  @ApiProperty({
    description: 'File size in bytes',
    example: 524288,
  })
  size: number;

  @ApiProperty({
    description: 'Gmail attachment ID',
  })
  attachmentId: string;

  @ApiPropertyOptional({
    description: 'Whether attachment was downloaded',
  })
  downloaded?: boolean;

  @ApiPropertyOptional({
    description: 'Local file path if downloaded',
  })
  localPath?: string;
}

/**
 * Email parsed data DTO
 */
export class EmailParsedDataDto implements EmailParsedData {
  @ApiPropertyOptional({
    description: 'Detected intent',
    enum: ['property_inquiry', 'viewing_request', 'general_question', 'complaint', 'feedback'],
  })
  intent?: 'property_inquiry' | 'viewing_request' | 'general_question' | 'complaint' | 'feedback';

  @ApiPropertyOptional({
    description: 'Extracted property requirements',
  })
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

  @ApiPropertyOptional({
    description: 'Urgency level',
    enum: ['low', 'medium', 'high'],
  })
  urgency?: 'low' | 'medium' | 'high';

  @ApiPropertyOptional({
    description: 'Sentiment analysis',
    enum: ['positive', 'neutral', 'negative'],
  })
  sentiment?: 'positive' | 'neutral' | 'negative';

  @ApiPropertyOptional({
    description: 'Suggested actions',
    example: ['Search matching properties', 'Send recommendations'],
  })
  suggestedActions?: string[];

  @ApiPropertyOptional({
    description: 'Extracted phone numbers',
  })
  extractedPhoneNumbers?: string[];

  @ApiPropertyOptional({
    description: 'Extracted dates',
  })
  extractedDates?: Date[];
}

/**
 * Email message DTO
 */
export class EmailDto {
  @ApiProperty({
    description: 'Gmail message ID',
    example: '18c5f2a1b4f3e...',
  })
  id: string;

  @ApiProperty({
    description: 'Gmail thread ID',
  })
  threadId: string;

  @ApiProperty({
    description: 'Email direction',
    enum: EmailDirection,
  })
  direction: EmailDirection;

  @ApiProperty({
    description: 'Email status',
    enum: EmailStatus,
  })
  status: EmailStatus;

  @ApiProperty({
    description: 'Sender',
    type: EmailParticipantDto,
  })
  from: EmailParticipant;

  @ApiProperty({
    description: 'Recipients',
    type: [EmailParticipantDto],
  })
  to: EmailParticipant[];

  @ApiPropertyOptional({
    description: 'CC recipients',
    type: [EmailParticipantDto],
  })
  cc?: EmailParticipant[];

  @ApiProperty({
    description: 'Subject',
    example: 'Richiesta informazioni appartamento Milano',
  })
  subject: string;

  @ApiProperty({
    description: 'Plain text content',
  })
  textContent: string;

  @ApiPropertyOptional({
    description: 'HTML content',
  })
  htmlContent?: string;

  @ApiProperty({
    description: 'Short snippet',
    example: 'Buongiorno, sono interessato a un appartamento...',
  })
  snippet: string;

  @ApiPropertyOptional({
    description: 'Attachments',
    type: [EmailAttachmentDto],
  })
  attachments?: EmailAttachment[];

  @ApiProperty({
    description: 'Sent timestamp',
  })
  sentAt: Date;

  @ApiProperty({
    description: 'Received timestamp',
  })
  receivedAt: Date;

  @ApiPropertyOptional({
    description: 'Read timestamp',
  })
  readAt?: Date;

  @ApiProperty({
    description: 'Gmail labels',
    example: ['INBOX', 'UNREAD'],
  })
  labels: string[];

  @ApiPropertyOptional({
    description: 'Linked contact ID',
  })
  contactId?: string;

  @ApiPropertyOptional({
    description: 'Linked property ID',
  })
  propertyId?: string;

  @ApiPropertyOptional({
    description: 'AI-parsed data',
    type: EmailParsedDataDto,
  })
  parsedData?: EmailParsedData;

  @ApiProperty({
    description: 'Whether email content was parsed',
  })
  isParsed: boolean;

  @ApiProperty({
    description: 'Priority score (0-100)',
    example: 75,
  })
  priorityScore: number;

  @ApiProperty({
    description: 'Whether email needs action',
  })
  needsAction: boolean;
}

/**
 * Email sync response DTO
 */
export class EmailSyncResponseDto {
  @ApiProperty({
    description: 'Number of messages synced',
    example: 25,
  })
  count: number;

  @ApiProperty({
    description: 'Synced messages',
    type: [EmailDto],
  })
  messages: EmailDto[];
}
