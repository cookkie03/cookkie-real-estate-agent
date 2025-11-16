/**
 * Scraping Controller (Presentation Layer)
 *
 * REST API endpoints for property scraping operations.
 */

import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
  Logger,
  HttpCode,
  HttpStatus,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../../core/guards/jwt-auth.guard';
import { ScrapingService } from '../../application/services/scraping.service';
import {
  CreateScrapingJobDto,
  ScrapingJobDto,
  ScrapedPropertyDto,
  TestScrapeDto,
  BuildSearchUrlDto,
} from '../dto/scraping.dto';
import { ScrapingPortal } from '../../domain/entities/scraping-job.entity';

@ApiTags('scraping')
@Controller('scraping')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class ScrapingController {
  private readonly logger = new Logger(ScrapingController.name);

  constructor(private scrapingService: ScrapingService) {}

  /**
   * POST /scraping/jobs
   * Create and start a new scraping job
   */
  @Post('jobs')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create scraping job',
    description:
      'Create and start a new background job to scrape properties from a real estate portal.',
  })
  @ApiResponse({
    status: 201,
    description: 'Scraping job created successfully',
    type: ScrapingJobDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid request parameters',
  })
  async createJob(@Body() dto: CreateScrapingJobDto): Promise<ScrapingJobDto> {
    this.logger.log(`Creating scraping job for ${dto.portal}`);

    const job = await this.scrapingService.createJob({
      portal: dto.portal,
      searchUrl: dto.searchUrl,
      maxPages: dto.maxPages,
      maxProperties: dto.maxProperties,
      filters: {
        contractType: dto.contractType,
        propertyType: dto.propertyType,
        city: dto.city,
        priceMin: dto.priceMin,
        priceMax: dto.priceMax,
        surfaceMin: dto.surfaceMin,
        surfaceMax: dto.surfaceMax,
      },
      deduplication: dto.deduplication ?? true,
      importToDatabase: dto.importToDatabase ?? true,
      headful: dto.headful ?? false,
      mode: dto.mode ?? 'portal',
    });

    return this.mapJobToDto(job);
  }

  /**
   * GET /scraping/jobs
   * Get all scraping jobs
   */
  @Get('jobs')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get all scraping jobs',
    description: 'Retrieve all active and completed scraping jobs.',
  })
  @ApiResponse({
    status: 200,
    description: 'Jobs retrieved successfully',
    type: [ScrapingJobDto],
  })
  async getAllJobs(): Promise<ScrapingJobDto[]> {
    this.logger.log('Retrieving all scraping jobs');

    const jobs = await this.scrapingService.getAllJobs();

    return jobs.map((job) => this.mapJobToDto(job));
  }

  /**
   * GET /scraping/jobs/:id
   * Get specific scraping job status
   */
  @Get('jobs/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get scraping job status',
    description: 'Retrieve detailed status and results of a specific scraping job.',
  })
  @ApiParam({
    name: 'id',
    description: 'Job ID',
    example: 'scrape_1234567890_abc123',
  })
  @ApiResponse({
    status: 200,
    description: 'Job status retrieved successfully',
    type: ScrapingJobDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Job not found',
  })
  async getJob(@Param('id') id: string): Promise<ScrapingJobDto> {
    this.logger.log(`Retrieving job status: ${id}`);

    const job = await this.scrapingService.getJob(id);

    return this.mapJobToDto(job);
  }

  /**
   * DELETE /scraping/jobs/:id
   * Cancel a running scraping job
   */
  @Delete('jobs/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Cancel scraping job',
    description: 'Cancel a running scraping job.',
  })
  @ApiParam({
    name: 'id',
    description: 'Job ID',
    example: 'scrape_1234567890_abc123',
  })
  @ApiResponse({
    status: 200,
    description: 'Job cancelled successfully',
    type: ScrapingJobDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Job not found',
  })
  @ApiResponse({
    status: 400,
    description: 'Job cannot be cancelled',
  })
  async cancelJob(@Param('id') id: string): Promise<ScrapingJobDto> {
    this.logger.log(`Cancelling job: ${id}`);

    const job = await this.scrapingService.cancelJob(id);

    return this.mapJobToDto(job);
  }

  /**
   * POST /scraping/test
   * Test scraping a single page
   */
  @Post('test')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Test scraping',
    description:
      'Test scraping a single page to verify parser functionality.',
  })
  @ApiResponse({
    status: 200,
    description: 'Page scraped successfully',
    type: [ScrapedPropertyDto],
  })
  async testScrape(@Body() dto: TestScrapeDto): Promise<ScrapedPropertyDto[]> {
    this.logger.log(`Testing scrape: ${dto.portal} - ${dto.url}`);

    const properties = await this.scrapingService.testScrape(dto.portal, dto.url);

    return properties.map((property) => ({
      portal: property.data.portal,
      externalId: property.data.externalId,
      externalUrl: property.data.externalUrl,
      title: property.data.title,
      description: property.data.description,
      city: property.data.city,
      zone: property.data.zone,
      contractType: property.data.contractType,
      propertyType: property.data.propertyType,
      priceSale: property.data.priceSale,
      priceRent: property.data.priceRent,
      surfaceInternal: property.data.surfaceInternal,
      rooms: property.data.rooms,
      bedrooms: property.data.bedrooms,
      bathrooms: property.data.bathrooms,
      scrapedAt: property.scrapedAt,
    }));
  }

  /**
   * GET /scraping/portals
   * Get supported portals
   */
  @Get('portals')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get supported portals',
    description: 'Get list of supported real estate portals.',
  })
  @ApiResponse({
    status: 200,
    description: 'Portals retrieved successfully',
    schema: {
      type: 'array',
      items: {
        type: 'string',
        enum: Object.values(ScrapingPortal),
      },
    },
  })
  async getSupportedPortals(): Promise<ScrapingPortal[]> {
    return this.scrapingService.getSupportedPortals();
  }

  /**
   * POST /scraping/build-url
   * Build search URL for a portal
   */
  @Post('build-url')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Build search URL',
    description: 'Generate a search URL for a specific portal with given filters.',
  })
  @ApiResponse({
    status: 200,
    description: 'URL built successfully',
    schema: {
      type: 'object',
      properties: {
        portal: { type: 'string' },
        url: { type: 'string' },
      },
    },
  })
  async buildSearchUrl(
    @Body() dto: BuildSearchUrlDto,
  ): Promise<{ portal: ScrapingPortal; url: string }> {
    const url = this.scrapingService.buildSearchUrl(dto.portal, {
      contractType: dto.contractType,
      propertyType: dto.propertyType,
      city: dto.city,
      priceMin: dto.priceMin,
      priceMax: dto.priceMax,
    });

    return {
      portal: dto.portal,
      url,
    };
  }

  /**
   * Map domain entity to DTO
   */
  private mapJobToDto(job: any): ScrapingJobDto {
    return {
      id: job.id,
      status: job.status,
      portal: job.config.portal,
      searchUrl: job.config.searchUrl || '',
      progress: job.progress,
      currentPage: job.currentPage,
      error: job.error,
      result: job.result,
      createdAt: job.createdAt,
      startedAt: job.startedAt,
      completedAt: job.completedAt,
    };
  }
}
