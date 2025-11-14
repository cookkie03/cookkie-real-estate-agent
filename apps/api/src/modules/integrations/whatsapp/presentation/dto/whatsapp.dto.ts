/**
 * WhatsApp DTOs (Presentation Layer)
 *
 * Data Transfer Objects for WhatsApp endpoints.
 */

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsArray,
  IsOptional,
  IsEnum,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import {
  MessageDirection,
  MessageStatus,
  MessageType,
  WhatsAppMedia,
} from '../../domain/entities/whatsapp-message.entity';

/**
 * Send text message DTO
 */
export class SendTextMessageDto {
  @ApiProperty({
    description: 'Recipient phone number (with country code)',
    example: '+393451234567',
  })
  @IsString()
  to: string;

  @ApiProperty({
    description: 'Message text',
    example: 'Buongiorno! Ho trovato alcune proprietà che potrebbero interessarti.',
  })
  @IsString()
  text: string;

  @ApiPropertyOptional({
    description: 'Message ID to reply to',
  })
  @IsOptional()
  @IsString()
  replyToMessageId?: string;
}

/**
 * Send image message DTO
 */
export class SendImageMessageDto {
  @ApiProperty({
    description: 'Recipient phone number',
    example: '+393451234567',
  })
  @IsString()
  to: string;

  @ApiProperty({
    description: 'Image URL',
    example: 'https://example.com/property-image.jpg',
  })
  @IsString()
  imageUrl: string;

  @ApiPropertyOptional({
    description: 'Image caption',
    example: 'Appartamento 3 locali - Milano Centro',
  })
  @IsOptional()
  @IsString()
  caption?: string;

  @ApiPropertyOptional({
    description: 'Message ID to reply to',
  })
  @IsOptional()
  @IsString()
  replyToMessageId?: string;
}

/**
 * Send document message DTO
 */
export class SendDocumentMessageDto {
  @ApiProperty({
    description: 'Recipient phone number',
    example: '+393451234567',
  })
  @IsString()
  to: string;

  @ApiProperty({
    description: 'Document URL',
    example: 'https://example.com/property-brochure.pdf',
  })
  @IsString()
  documentUrl: string;

  @ApiProperty({
    description: 'Document filename',
    example: 'property_brochure.pdf',
  })
  @IsString()
  filename: string;

  @ApiPropertyOptional({
    description: 'Document caption',
  })
  @IsOptional()
  @IsString()
  caption?: string;

  @ApiPropertyOptional({
    description: 'Message ID to reply to',
  })
  @IsOptional()
  @IsString()
  replyToMessageId?: string;
}

/**
 * Send template message DTO
 */
export class SendTemplateMessageDto {
  @ApiProperty({
    description: 'Recipient phone number',
    example: '+393451234567',
  })
  @IsString()
  to: string;

  @ApiProperty({
    description: 'Template name',
    example: 'property_alert',
  })
  @IsString()
  templateName: string;

  @ApiProperty({
    description: 'Language code',
    example: 'it',
  })
  @IsString()
  languageCode: string;

  @ApiPropertyOptional({
    description: 'Template parameters',
    example: ['Mario', 'Milano'],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  parameters?: string[];
}

/**
 * Button DTO
 */
export class ButtonDto {
  @ApiProperty({
    description: 'Button ID',
    example: 'btn_view_property',
  })
  @IsString()
  id: string;

  @ApiProperty({
    description: 'Button title',
    example: 'Visualizza Immobile',
  })
  @IsString()
  title: string;
}

/**
 * Send button message DTO
 */
export class SendButtonMessageDto {
  @ApiProperty({
    description: 'Recipient phone number',
    example: '+393451234567',
  })
  @IsString()
  to: string;

  @ApiProperty({
    description: 'Body text',
    example: 'Ho trovato un appartamento perfetto per te!',
  })
  @IsString()
  bodyText: string;

  @ApiProperty({
    description: 'Buttons (max 3)',
    type: [ButtonDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ButtonDto)
  buttons: ButtonDto[];

  @ApiPropertyOptional({
    description: 'Header text',
    example: 'Nuova Proprietà Disponibile',
  })
  @IsOptional()
  @IsString()
  headerText?: string;

  @ApiPropertyOptional({
    description: 'Footer text',
    example: 'CRM Immobiliare',
  })
  @IsOptional()
  @IsString()
  footerText?: string;
}

/**
 * WhatsApp message DTO
 */
export class WhatsAppMessageDto {
  @ApiProperty({
    description: 'WhatsApp message ID',
  })
  id: string;

  @ApiProperty({
    description: 'Message direction',
    enum: MessageDirection,
  })
  direction: MessageDirection;

  @ApiProperty({
    description: 'Message status',
    enum: MessageStatus,
  })
  status: MessageStatus;

  @ApiProperty({
    description: 'Message type',
    enum: MessageType,
  })
  type: MessageType;

  @ApiProperty({
    description: 'Sender phone number',
    example: '+393451234567',
  })
  from: string;

  @ApiProperty({
    description: 'Recipient phone number',
  })
  to: string;

  @ApiPropertyOptional({
    description: 'Text content',
  })
  text?: string;

  @ApiPropertyOptional({
    description: 'Media content',
  })
  media?: WhatsAppMedia;

  @ApiProperty({
    description: 'Message timestamp',
  })
  timestamp: Date;

  @ApiPropertyOptional({
    description: 'Linked contact ID',
  })
  contactId?: string;

  @ApiPropertyOptional({
    description: 'Linked property ID',
  })
  propertyId?: string;
}
