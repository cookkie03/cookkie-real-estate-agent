/**
 * Scraping Service (Application Layer)
 *
 * Orchestrates property scraping from real estate portals.
 */

import { Injectable, Logger, NotFoundException, Inject, forwardRef } from '@nestjs/common';
import { PrismaService } from '../../../../shared/database/prisma.service';
import { QueueService } from '../../../../shared/queue/queue.service';
import {
  ScrapingJob,
  ScrapingJobConfig,
  ScrapingPortal,
  ScrapingStatus,
} from '../../domain/entities/scraping-job.entity';
import { ScrapedProperty } from '../../domain/entities/scraped-property.entity';
import { PortalParser } from '../../domain/interfaces/portal-parser.interface';
import { ImmobiliareItParser } from '../../infrastructure/parsers/immobiliare-it.parser';
import { CasaItParser } from '../../infrastructure/parsers/casa-it.parser';
import { IdealistaItParser } from '../../infrastructure/parsers/idealista-it.parser';
import { ScrapingGateway } from '../../presentation/gateways/scraping.gateway';

@Injectable()
export class ScrapingService {
  private readonly logger = new Logger(ScrapingService.name);
  private parsers: Map<ScrapingPortal, PortalParser>;
  private activeJobs: Map<string, ScrapingJob>;

  constructor(
    private prisma: PrismaService,
    private queueService: QueueService,
    private immobiliareParser: ImmobiliareItParser,
    private casaParser: CasaItParser,
    private idealistaParser: IdealistaItParser,
    @Inject(forwardRef(() => ScrapingGateway))
    private gateway: ScrapingGateway,
  ) {
    this.parsers = new Map();
    this.activeJobs = new Map();
    this.registerParsers();
  }

  /**
   * Register portal parsers
   */
  private registerParsers(): void {
    this.parsers.set(ScrapingPortal.IMMOBILIARE_IT, this.immobiliareParser);
    this.parsers.set(ScrapingPortal.CASA_IT, this.casaParser);
    this.parsers.set(ScrapingPortal.IDEALISTA_IT, this.idealistaParser);

    this.logger.log(`✅ Registered ${this.parsers.size} portal parsers`);
  }

  /**
   * Create and start a scraping job
   */
  async createJob(
    config: ScrapingJobConfig,
    userId?: string,
  ): Promise<ScrapingJob> {
    this.logger.log(`Creating scraping job for ${config.portal}`);

    // Validate portal
    if (!this.parsers.has(config.portal)) {
      throw new Error(`Unsupported portal: ${config.portal}`);
    }

    // Create job
    const job = new ScrapingJob({
      config,
      createdBy: userId,
    });

    // Store in memory
    this.activeJobs.set(job.id, job);

    this.logger.log(`✅ Created job ${job.id}`);

    // Queue for background processing
    await this.queueService.addJob('scraping', {
      jobId: job.id,
      config,
    });

    return job;
  }

  /**
   * Get job status
   */
  async getJob(jobId: string): Promise<ScrapingJob> {
    const job = this.activeJobs.get(jobId);

    if (!job) {
      throw new NotFoundException(`Scraping job ${jobId} not found`);
    }

    return job;
  }

  /**
   * Get all active jobs
   */
  async getAllJobs(): Promise<ScrapingJob[]> {
    return Array.from(this.activeJobs.values());
  }

  /**
   * Cancel a running job
   */
  async cancelJob(jobId: string): Promise<ScrapingJob> {
    const job = this.activeJobs.get(jobId);

    if (!job) {
      throw new NotFoundException(`Scraping job ${jobId} not found`);
    }

    if (job.isFinished()) {
      throw new Error(`Job ${jobId} is already finished`);
    }

    job.cancel();
    this.logger.log(`❌ Job ${jobId} cancelled`);

    return job;
  }

  /**
   * Execute scraping job (called by worker)
   */
  async executeJob(jobId: string): Promise<void> {
    const job = this.activeJobs.get(jobId);

    if (!job) {
      throw new Error(`Job ${jobId} not found`);
    }

    this.logger.log(`▶️ Executing job ${jobId}`);

    try {
      job.start();

      // Broadcast job start
      this.gateway.broadcastLog(jobId, `Starting scraping job for ${job.config.portal}`, 'info');

      const parser = this.parsers.get(job.config.portal);
      if (!parser) {
        throw new Error(`Parser not found for ${job.config.portal}`);
      }

      // Build initial search URL
      let searchUrl = job.config.searchUrl;
      if (!searchUrl) {
        searchUrl = parser.buildSearchUrl(job.config.filters || {});
      }

      const maxPages = job.config.maxPages || 10;
      const maxProperties = job.config.maxProperties || 100;

      let currentUrl: string | null = searchUrl;
      let currentPage = 1;
      let totalPropertiesFound = 0;

      // Scrape pages
      while (currentUrl && currentPage <= maxPages) {
        this.logger.log(`Scraping page ${currentPage}/${maxPages}: ${currentUrl}`);
        this.gateway.broadcastLog(jobId, `Scraping page ${currentPage}/${maxPages}`, 'info');

        // Scrape page
        const searchPage = await parser.scrapePage(currentUrl);

        job.addPageScraped();
        job.updateProgress(currentPage, maxPages);

        // Broadcast progress
        this.gateway.broadcastJobProgress(jobId, {
          status: job.status,
          progress: job.progress,
          currentPage: job.currentPage,
          propertiesFound: job.result?.propertiesFound,
        });

        // Process properties
        for (const property of searchPage.properties) {
          totalPropertiesFound++;
          job.addPropertyFound();

          // Check if we've reached max properties
          if (totalPropertiesFound >= maxProperties) {
            this.logger.log(`Reached max properties limit: ${maxProperties}`);
            break;
          }

          // Import to database if configured
          if (job.config.importToDatabase) {
            try {
              await this.importProperty(property, job.id);
              job.addPropertyImported();
            } catch (error) {
              if (error.message?.includes('duplicate')) {
                job.addPropertyDuplicated();
              } else {
                job.addPropertySkipped();
                job.addError(`Failed to import property: ${error.message}`);
              }
            }
          }
        }

        // Break if max properties reached
        if (totalPropertiesFound >= maxProperties) {
          break;
        }

        // Get next page
        currentUrl = searchPage.nextPageUrl || null;
        currentPage++;

        // Small delay between pages to avoid rate limiting
        await this.sleep(2000);
      }

      job.complete();
      this.logger.log(`✅ Job ${jobId} completed successfully`);

      // Broadcast completion
      this.gateway.broadcastJobCompleted(jobId, {
        status: job.status,
        propertiesFound: job.result?.propertiesFound || 0,
        propertiesImported: job.result?.propertiesImported || 0,
        duration: job.result?.duration || 0,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      job.fail(errorMessage);
      this.logger.error(`❌ Job ${jobId} failed:`, error);

      // Broadcast failure
      this.gateway.broadcastJobFailed(jobId, errorMessage);

      throw error;
    }
  }

  /**
   * Import scraped property to database
   */
  private async importProperty(
    property: ScrapedProperty,
    jobId: string,
  ): Promise<void> {
    // Check for duplicates
    if (property.data.externalId) {
      const existing = await this.prisma.property.findFirst({
        where: {
          source: property.data.portal,
          sourceId: property.data.externalId,
        },
      });

      if (existing) {
        throw new Error('Property already exists (duplicate)');
      }
    }

    // Convert to database format and create
    const dbData = property.toDatabaseFormat();

    await this.prisma.property.create({
      data: dbData,
    });

    this.logger.debug(`✅ Imported property: ${property.getSummary()}`);
  }

  /**
   * Test scraping a single page
   */
  async testScrape(portal: ScrapingPortal, url: string): Promise<ScrapedProperty[]> {
    this.logger.log(`Testing scrape: ${portal} - ${url}`);

    const parser = this.parsers.get(portal);
    if (!parser) {
      throw new Error(`Parser not found for ${portal}`);
    }

    const searchPage = await parser.scrapePage(url);

    this.logger.log(`✅ Test scrape found ${searchPage.properties.length} properties`);

    return searchPage.properties;
  }

  /**
   * Get supported portals
   */
  getSupportedPortals(): ScrapingPortal[] {
    return Array.from(this.parsers.keys());
  }

  /**
   * Build search URL for a portal
   */
  buildSearchUrl(
    portal: ScrapingPortal,
    filters: {
      contractType?: 'sale' | 'rent';
      propertyType?: string;
      city?: string;
      priceMin?: number;
      priceMax?: number;
    },
  ): string {
    const parser = this.parsers.get(portal);
    if (!parser) {
      throw new Error(`Parser not found for ${portal}`);
    }

    return parser.buildSearchUrl(filters);
  }

  /**
   * Helper: Sleep for ms
   */
  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
