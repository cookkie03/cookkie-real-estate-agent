/**
 * Gmail Controller (Presentation Layer)
 *
 * REST API endpoints for Gmail integration.
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
  Redirect,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../../../core/guards/jwt-auth.guard';
import { GmailService } from '../../application/services/gmail.service';
import { EmailParserService } from '../../application/services/email-parser.service';
import { EmailMessage } from '../../domain/entities/email-message.entity';

// DTOs
import {
  SendEmailDto,
  EmailSyncResponseDto,
  EmailDto,
  OAuthCallbackDto,
} from '../dto/gmail.dto';

@ApiTags('gmail')
@Controller('gmail')
export class GmailController {
  private readonly logger = new Logger(GmailController.name);

  constructor(
    private gmailService: GmailService,
    private emailParser: EmailParserService,
  ) {}

  /**
   * GET /gmail/auth
   * Get OAuth authorization URL
   */
  @Get('auth')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get Gmail OAuth URL',
    description: 'Get authorization URL to start Gmail OAuth flow.',
  })
  @ApiResponse({
    status: 200,
    description: 'OAuth URL generated',
    schema: {
      type: 'object',
      properties: {
        url: { type: 'string' },
      },
    },
  })
  getAuthUrl(): { url: string } {
    const url = this.gmailService.getAuthUrl();
    return { url };
  }

  /**
   * POST /gmail/auth/callback
   * Handle OAuth callback
   */
  @Post('auth/callback')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'OAuth callback',
    description: 'Handle OAuth callback and exchange code for tokens.',
  })
  @ApiResponse({
    status: 200,
    description: 'Tokens obtained successfully',
  })
  async handleCallback(@Body() dto: OAuthCallbackDto): Promise<{
    accessToken: string;
    refreshToken: string;
    expiryDate: number;
  }> {
    this.logger.log('Handling OAuth callback');

    const tokens = await this.gmailService.exchangeCodeForTokens(dto.code);

    this.logger.log('✅ OAuth tokens obtained');

    return tokens;
  }

  /**
   * POST /gmail/sync
   * Sync inbox messages
   */
  @Post('sync')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Sync inbox',
    description: 'Synchronize inbox messages from Gmail.',
  })
  @ApiQuery({
    name: 'maxResults',
    required: false,
    description: 'Maximum number of messages to sync',
    example: 50,
  })
  @ApiQuery({
    name: 'parseContent',
    required: false,
    description: 'Parse email content with AI',
    example: true,
  })
  @ApiResponse({
    status: 200,
    description: 'Inbox synced successfully',
    type: EmailSyncResponseDto,
  })
  async syncInbox(
    @Query('maxResults') maxResults?: number,
    @Query('parseContent') parseContent?: boolean,
  ): Promise<EmailSyncResponseDto> {
    this.logger.log('Starting inbox sync');

    const messages = await this.gmailService.syncInbox(maxResults || 50);

    // Parse emails if requested
    if (parseContent) {
      const parsedData = await this.emailParser.parseEmailBatch(messages);

      messages.forEach((msg) => {
        const parsed = parsedData.get(msg.id);
        if (parsed) {
          msg.parsedData = parsed;
          msg.isParsed = true;
        }
      });
    }

    this.logger.log(`✅ Synced ${messages.length} messages`);

    return {
      count: messages.length,
      messages: messages.map((msg) => this.mapEmailToDto(msg)),
    };
  }

  /**
   * GET /gmail/messages/:id
   * Get specific message
   */
  @Get('messages/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get email message',
    description: 'Retrieve a specific email message by ID.',
  })
  @ApiParam({
    name: 'id',
    description: 'Gmail message ID',
  })
  @ApiResponse({
    status: 200,
    description: 'Message retrieved successfully',
    type: EmailDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Message not found',
  })
  async getMessage(@Param('id') id: string): Promise<EmailDto> {
    this.logger.log(`Fetching message: ${id}`);

    const message = await this.gmailService.fetchMessage(id);

    if (!message) {
      throw new Error('Message not found');
    }

    // Parse email content
    if (!message.isParsed) {
      const parsedData = await this.emailParser.parseEmail(message);
      message.parsedData = parsedData;
      message.isParsed = true;
    }

    return this.mapEmailToDto(message);
  }

  /**
   * POST /gmail/send
   * Send email
   */
  @Post('send')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Send email',
    description: 'Send an email via Gmail.',
  })
  @ApiResponse({
    status: 201,
    description: 'Email sent successfully',
    type: EmailDto,
  })
  async sendEmail(@Body() dto: SendEmailDto): Promise<EmailDto> {
    this.logger.log(`Sending email to: ${dto.to.join(', ')}`);

    const message = await this.gmailService.sendEmail({
      to: dto.to,
      cc: dto.cc,
      subject: dto.subject,
      textContent: dto.textContent,
      htmlContent: dto.htmlContent,
      inReplyTo: dto.inReplyTo,
    });

    this.logger.log('✅ Email sent');

    return this.mapEmailToDto(message);
  }

  /**
   * POST /gmail/messages/:id/read
   * Mark message as read
   */
  @Post('messages/:id/read')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Mark as read',
    description: 'Mark an email message as read.',
  })
  @ApiParam({
    name: 'id',
    description: 'Gmail message ID',
  })
  @ApiResponse({
    status: 200,
    description: 'Message marked as read',
  })
  async markAsRead(@Param('id') id: string): Promise<{ success: boolean }> {
    await this.gmailService.markAsRead(id);
    return { success: true };
  }

  /**
   * POST /gmail/messages/:id/unread
   * Mark message as unread
   */
  @Post('messages/:id/unread')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Mark as unread',
    description: 'Mark an email message as unread.',
  })
  @ApiParam({
    name: 'id',
    description: 'Gmail message ID',
  })
  @ApiResponse({
    status: 200,
    description: 'Message marked as unread',
  })
  async markAsUnread(@Param('id') id: string): Promise<{ success: boolean }> {
    await this.gmailService.markAsUnread(id);
    return { success: true };
  }

  /**
   * POST /gmail/messages/:id/archive
   * Archive message
   */
  @Post('messages/:id/archive')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Archive message',
    description: 'Archive an email message.',
  })
  @ApiParam({
    name: 'id',
    description: 'Gmail message ID',
  })
  @ApiResponse({
    status: 200,
    description: 'Message archived',
  })
  async archiveMessage(@Param('id') id: string): Promise<{ success: boolean }> {
    await this.gmailService.archiveMessage(id);
    return { success: true };
  }

  /**
   * DELETE /gmail/messages/:id
   * Delete message
   */
  @Post('messages/:id/delete')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Delete message',
    description: 'Move an email message to trash.',
  })
  @ApiParam({
    name: 'id',
    description: 'Gmail message ID',
  })
  @ApiResponse({
    status: 200,
    description: 'Message deleted',
  })
  async deleteMessage(@Param('id') id: string): Promise<{ success: boolean }> {
    await this.gmailService.deleteMessage(id);
    return { success: true };
  }

  /**
   * GET /gmail/contacts/emails
   * List emails from CRM contacts only
   */
  @Get('contacts/emails')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'List emails from CRM contacts',
    description: 'List emails from contacts in the CRM database.',
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
    description: 'Filter by status (unread, read, archived)',
  })
  @ApiQuery({
    name: 'direction',
    required: false,
    description: 'Filter by direction (inbound, outbound)',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Maximum number of emails to return',
    example: 100,
  })
  @ApiResponse({
    status: 200,
    description: 'Emails from CRM contacts',
    type: [EmailDto],
  })
  async listEmailsFromContacts(
    @Query('contactId') contactId?: string,
    @Query('propertyId') propertyId?: string,
    @Query('status') status?: string,
    @Query('direction') direction?: string,
    @Query('limit') limit?: number,
  ): Promise<EmailDto[]> {
    this.logger.log('Fetching emails from CRM contacts');

    const emails = await this.gmailService.listEmailsFromContacts({
      contactId,
      propertyId,
      status,
      direction,
      limit,
    });

    return emails.map((e) => this.mapEmailToDto(e));
  }

  /**
   * POST /gmail/watch
   * Setup Gmail push notifications
   */
  @Post('watch')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Setup push notifications',
    description: 'Setup Gmail push notifications via Google Cloud Pub/Sub.',
  })
  @ApiResponse({
    status: 200,
    description: 'Watch setup successfully',
  })
  async setupWatch(): Promise<{ success: boolean }> {
    await this.gmailService.watchInbox();
    return { success: true };
  }

  /**
   * Map EmailMessage to DTO
   */
  private mapEmailToDto(message: EmailMessage): EmailDto {
    return {
      id: message.gmailId,
      threadId: message.threadId,
      direction: message.direction,
      status: message.status,
      from: message.from,
      to: message.to,
      cc: message.cc,
      subject: message.subject,
      textContent: message.textContent,
      htmlContent: message.htmlContent,
      snippet: message.getSnippet(),
      attachments: message.attachments,
      sentAt: message.sentAt,
      receivedAt: message.receivedAt,
      readAt: message.readAt,
      labels: message.labels,
      contactId: message.contactId,
      propertyId: message.propertyId,
      parsedData: message.parsedData,
      isParsed: message.isParsed,
      priorityScore: message.getPriorityScore(),
      needsAction: message.needsAction(),
    };
  }
}
