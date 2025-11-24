/**
 * WhatsApp Controller (Presentation Layer)
 *
 * REST API endpoints and webhook handler for WhatsApp integration.
 */

import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  Logger,
  HttpCode,
  HttpStatus,
  Headers,
  RawBodyRequest,
  Req,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
  ApiExcludeEndpoint,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../../../core/guards/jwt-auth.guard';
import { WhatsAppService } from '../../application/services/whatsapp.service';
import { Request } from 'express';

// DTOs
import {
  SendTextMessageDto,
  SendImageMessageDto,
  SendDocumentMessageDto,
  SendTemplateMessageDto,
  SendButtonMessageDto,
  WhatsAppMessageDto,
} from '../dto/whatsapp.dto';

@ApiTags('whatsapp')
@Controller('whatsapp')
export class WhatsAppController {
  private readonly logger = new Logger(WhatsAppController.name);

  constructor(private whatsappService: WhatsAppService) {}

  /**
   * GET /whatsapp/webhook
   * Verify webhook (used by WhatsApp)
   */
  @Get('webhook')
  @ApiExcludeEndpoint() // Hide from Swagger
  async verifyWebhook(
    @Query('hub.mode') mode: string,
    @Query('hub.verify_token') token: string,
    @Query('hub.challenge') challenge: string,
  ): Promise<string> {
    const verifyToken = process.env.WHATSAPP_VERIFY_TOKEN;

    if (mode === 'subscribe' && token === verifyToken) {
      this.logger.log('✅ Webhook verified');
      return challenge;
    }

    this.logger.warn('❌ Webhook verification failed');
    throw new Error('Verification failed');
  }

  /**
   * POST /whatsapp/webhook
   * Receive webhook notifications
   */
  @Post('webhook')
  @HttpCode(HttpStatus.OK)
  @ApiExcludeEndpoint() // Hide from Swagger
  async handleWebhook(
    @Body() body: any,
    @Headers('x-hub-signature-256') signature: string,
    @Req() req: RawBodyRequest<Request>,
  ): Promise<{ success: boolean }> {
    this.logger.log('Received WhatsApp webhook');

    // Verify signature
    const secret = process.env.WHATSAPP_APP_SECRET;
    if (secret && signature) {
      const rawBody = req.rawBody?.toString() || JSON.stringify(body);
      const isValid = this.whatsappService.verifyWebhookSignature(
        signature,
        rawBody,
        secret,
      );

      if (!isValid) {
        this.logger.warn('❌ Invalid webhook signature');
        throw new Error('Invalid signature');
      }
    }

    // Process webhook
    const entry = body.entry?.[0];
    const change = entry?.changes?.[0];

    if (!change) {
      return { success: true };
    }

    // Handle incoming messages
    if (change.value.messages) {
      const message = await this.whatsappService.handleIncomingMessage(body);
      this.logger.log(`📨 Incoming message from ${message.from}`);

      // TODO: Queue for AI parsing and response
    }

    // Handle status updates
    if (change.value.statuses) {
      this.whatsappService.handleStatusUpdate(body);
    }

    return { success: true };
  }

  /**
   * POST /whatsapp/send/text
   * Send text message
   */
  @Post('send/text')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Send text message',
    description: 'Send a text message via WhatsApp.',
  })
  @ApiResponse({
    status: 201,
    description: 'Message sent successfully',
    type: WhatsAppMessageDto,
  })
  async sendTextMessage(
    @Body() dto: SendTextMessageDto,
  ): Promise<WhatsAppMessageDto> {
    this.logger.log(`Sending text to ${dto.to}`);

    const message = await this.whatsappService.sendTextMessage(
      dto.to,
      dto.text,
      dto.replyToMessageId,
    );

    return this.mapMessageToDto(message);
  }

  /**
   * POST /whatsapp/send/image
   * Send image message
   */
  @Post('send/image')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Send image',
    description: 'Send an image via WhatsApp.',
  })
  @ApiResponse({
    status: 201,
    description: 'Image sent successfully',
    type: WhatsAppMessageDto,
  })
  async sendImageMessage(
    @Body() dto: SendImageMessageDto,
  ): Promise<WhatsAppMessageDto> {
    this.logger.log(`Sending image to ${dto.to}`);

    const message = await this.whatsappService.sendImageMessage(
      dto.to,
      dto.imageUrl,
      dto.caption,
      dto.replyToMessageId,
    );

    return this.mapMessageToDto(message);
  }

  /**
   * POST /whatsapp/send/document
   * Send document message
   */
  @Post('send/document')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Send document',
    description: 'Send a document (PDF, etc.) via WhatsApp.',
  })
  @ApiResponse({
    status: 201,
    description: 'Document sent successfully',
    type: WhatsAppMessageDto,
  })
  async sendDocumentMessage(
    @Body() dto: SendDocumentMessageDto,
  ): Promise<WhatsAppMessageDto> {
    this.logger.log(`Sending document to ${dto.to}`);

    const message = await this.whatsappService.sendDocumentMessage(
      dto.to,
      dto.documentUrl,
      dto.filename,
      dto.caption,
      dto.replyToMessageId,
    );

    return this.mapMessageToDto(message);
  }

  /**
   * POST /whatsapp/send/template
   * Send template message
   */
  @Post('send/template')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Send template',
    description: 'Send a pre-approved template message.',
  })
  @ApiResponse({
    status: 201,
    description: 'Template sent successfully',
    type: WhatsAppMessageDto,
  })
  async sendTemplateMessage(
    @Body() dto: SendTemplateMessageDto,
  ): Promise<WhatsAppMessageDto> {
    this.logger.log(`Sending template "${dto.templateName}" to ${dto.to}`);

    const message = await this.whatsappService.sendTemplateMessage(
      dto.to,
      dto.templateName,
      dto.languageCode,
      dto.parameters,
    );

    return this.mapMessageToDto(message);
  }

  /**
   * POST /whatsapp/send/button
   * Send interactive button message
   */
  @Post('send/button')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Send button message',
    description: 'Send an interactive message with buttons.',
  })
  @ApiResponse({
    status: 201,
    description: 'Button message sent successfully',
    type: WhatsAppMessageDto,
  })
  async sendButtonMessage(
    @Body() dto: SendButtonMessageDto,
  ): Promise<WhatsAppMessageDto> {
    this.logger.log(`Sending button message to ${dto.to}`);

    const message = await this.whatsappService.sendButtonMessage(
      dto.to,
      dto.bodyText,
      dto.buttons,
      dto.headerText,
      dto.footerText,
    );

    return this.mapMessageToDto(message);
  }

  /**
   * GET /whatsapp/contacts/messages
   * List messages from CRM contacts only
   */
  @Get('contacts/messages')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'List WhatsApp messages from CRM contacts',
    description: 'List WhatsApp messages from contacts in the CRM database.',
  })
  @ApiQuery({
    name: 'contactId',
    required: false,
    description: 'Filter by specific contact ID',
  })
  @ApiQuery({
    name: 'propertyId',
    required: false,
    description: 'Filter by specific property ID',
  })
  @ApiQuery({
    name: 'status',
    required: false,
    description: 'Filter by status (sent, delivered, read, failed)',
  })
  @ApiQuery({
    name: 'direction',
    required: false,
    description: 'Filter by direction (inbound, outbound)',
  })
  @ApiQuery({
    name: 'type',
    required: false,
    description: 'Filter by type (text, image, document, etc.)',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Maximum number of messages to return',
    example: 100,
  })
  @ApiResponse({
    status: 200,
    description: 'WhatsApp messages from CRM contacts',
    type: [WhatsAppMessageDto],
  })
  async listMessagesFromContacts(
    @Query('contactId') contactId?: string,
    @Query('propertyId') propertyId?: string,
    @Query('status') status?: string,
    @Query('direction') direction?: string,
    @Query('type') type?: string,
    @Query('limit') limit?: number,
  ): Promise<WhatsAppMessageDto[]> {
    this.logger.log('Fetching WhatsApp messages from CRM contacts');

    const messages = await this.whatsappService.listMessagesFromContacts({
      contactId,
      propertyId,
      status,
      direction,
      type,
      limit,
    });

    return messages.map((m) => this.mapMessageToDto(m));
  }

  /**
   * Map message entity to DTO
   */
  private mapMessageToDto(message: any): WhatsAppMessageDto {
    return {
      id: message.whatsappId,
      direction: message.direction,
      status: message.status,
      type: message.type,
      from: message.from,
      to: message.to,
      text: message.text,
      media: message.media,
      timestamp: message.timestamp,
      contactId: message.contactId,
      propertyId: message.propertyId,
    };
  }
}
