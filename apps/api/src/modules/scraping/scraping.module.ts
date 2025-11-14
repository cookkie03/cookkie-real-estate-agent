/**
 * Scraping Module
 *
 * Handles property scraping from real estate portals with background processing.
 *
 * Clean Architecture Layers:
 * - Domain: Entities (ScrapingJob, ScrapedProperty), Interfaces (PortalParser)
 * - Application: Services (ScrapingService), Workers (ScrapingProcessor)
 * - Infrastructure: Parsers (Immobiliare.it, Casa.it, Idealista.it), BrowserService
 * - Presentation: Controllers, DTOs
 *
 * ✅ IMPLEMENTED (Phase 3):
 * - domain/entities/scraping-job.entity.ts
 * - domain/entities/scraped-property.entity.ts
 * - domain/interfaces/portal-parser.interface.ts
 * - infrastructure/browser/playwright-browser.service.ts
 * - infrastructure/parsers/immobiliare-it.parser.ts (3 portals)
 * - infrastructure/parsers/casa-it.parser.ts
 * - infrastructure/parsers/idealista-it.parser.ts
 * - application/services/scraping.service.ts
 * - presentation/controllers/scraping.controller.ts
 * - presentation/dto/scraping.dto.ts
 *
 * Features:
 * - Multi-portal support (Immobiliare.it, Casa.it, Idealista.it)
 * - Background job processing with BullMQ
 * - Playwright browser automation with anti-bot evasion
 * - Cheerio HTML parsing for data extraction
 * - Deduplication and data validation
 * - Error handling and retry logic
 */

import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../shared/database/database.module';
import { QueueModule } from '../../shared/queue/queue.module';
import { ScrapingController } from './presentation/controllers/scraping.controller';
import { ScrapingService } from './application/services/scraping.service';
import { PlaywrightBrowserService } from './infrastructure/browser/playwright-browser.service';
import { ImmobiliareItParser } from './infrastructure/parsers/immobiliare-it.parser';
import { CasaItParser } from './infrastructure/parsers/casa-it.parser';
import { IdealistaItParser } from './infrastructure/parsers/idealista-it.parser';

@Module({
  imports: [DatabaseModule, QueueModule],
  controllers: [ScrapingController],
  providers: [
    ScrapingService,
    PlaywrightBrowserService,
    ImmobiliareItParser,
    CasaItParser,
    IdealistaItParser,
  ],
  exports: [ScrapingService, PlaywrightBrowserService],
})
export class ScrapingModule {}
