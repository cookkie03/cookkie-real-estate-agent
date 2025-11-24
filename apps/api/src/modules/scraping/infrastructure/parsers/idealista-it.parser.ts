/**
 * Idealista.it Parser (Infrastructure Layer)
 *
 * Parser for idealista.it - International real estate portal.
 */

import { Injectable, Logger } from '@nestjs/common';
import * as cheerio from 'cheerio';
import {
  PortalParser,
  SearchPage,
  ParserConfig,
} from '../../domain/interfaces/portal-parser.interface';
import {
  ScrapedProperty,
  ScrapedPropertyData,
} from '../../domain/entities/scraped-property.entity';
import { ScrapingPortal } from '../../domain/entities/scraping-job.entity';
import { PlaywrightBrowserService } from '../browser/playwright-browser.service';

@Injectable()
export class IdealistaItParser implements PortalParser {
  private readonly logger = new Logger(IdealistaItParser.name);
  private readonly baseUrl = 'https://www.idealista.it';

  constructor(private browserService: PlaywrightBrowserService) {}

  getPortal(): ScrapingPortal {
    return ScrapingPortal.IDEALISTA_IT;
  }

  buildSearchUrl(filters: {
    contractType?: 'sale' | 'rent';
    propertyType?: string;
    city?: string;
    priceMin?: number;
    priceMax?: number;
    page?: number;
  }): string {
    const contractPath = filters.contractType === 'rent' ? 'affitto-case' : 'vendita-case';
    const cityPath = filters.city?.toLowerCase().replace(/\s+/g, '-') || '';

    let url = `${this.baseUrl}/${contractPath}/${cityPath}`;

    const params = new URLSearchParams();
    if (filters.priceMin) params.append('minPrice', filters.priceMin.toString());
    if (filters.priceMax) params.append('maxPrice', filters.priceMax.toString());
    if (filters.page && filters.page > 1) params.append('pagina', filters.page.toString());

    const queryString = params.toString();
    return queryString ? `${url}?${queryString}` : url;
  }

  async scrapePage(url: string, config?: ParserConfig): Promise<SearchPage> {
    this.logger.log(`Scraping Idealista.it page: ${url}`);

    const html = await this.browserService.getPageHtml(url, {
      waitForSelector: '.item-link',
      timeout: config?.timeout || 30000,
    });

    return this.parseSearchResults(html, url);
  }

  parseSearchResults(html: string, pageUrl: string): SearchPage {
    const $ = cheerio.load(html);
    const properties: ScrapedProperty[] = [];

    $('.item').each((index, element) => {
      try {
        const property = this.parsePropertyCard($, $(element), pageUrl);
        if (property && property.isValid()) {
          properties.push(property);
        }
      } catch (error) {
        this.logger.warn(`Error parsing Idealista.it card ${index}:`, error);
      }
    });

    return {
      url: pageUrl,
      html,
      properties,
      currentPage: this.getCurrentPage(pageUrl),
      nextPageUrl: this.getNextPageUrl(html, pageUrl) || undefined,
      totalResults: this.getTotalResults(html),
    };
  }

  private parsePropertyCard(
    $: cheerio.CheerioAPI,
    card: cheerio.Cheerio<any>,
    pageUrl: string,
  ): ScrapedProperty | null {
    const link = card.find('a.item-link').attr('href');
    if (!link) return null;

    const externalUrl = link.startsWith('http') ? link : this.baseUrl + link;
    const externalId = this.extractPropertyId(externalUrl);
    if (!externalId) return null;

    const title = card.find('.item-link').text().trim();
    const priceText = card.find('.item-price').text().trim();
    const price = this.parsePrice(priceText);

    const location = card.find('.item-location').text().trim();
    const city = location.split(',')[0]?.trim() || 'Unknown';

    const contractType = pageUrl.includes('/affitto-') ? 'rent' : 'sale';

    const data: ScrapedPropertyData = {
      portal: ScrapingPortal.IDEALISTA_IT,
      externalId,
      externalUrl,
      title,
      city,
      contractType,
      propertyType: 'Immobile',
      priceSale: contractType === 'sale' ? price : undefined,
      priceRent: contractType === 'rent' ? price : undefined,
    };

    return new ScrapedProperty(data);
  }

  async scrapePropertyDetails(
    url: string,
    config?: ParserConfig,
  ): Promise<ScrapedProperty | null> {
    this.logger.log(`Scraping Idealista.it property: ${url}`);

    const html = await this.browserService.getPageHtml(url, {
      waitForSelector: '.main-info',
      timeout: config?.timeout || 30000,
    });

    return this.parsePropertyDetails(html, url);
  }

  parsePropertyDetails(html: string, url: string): ScrapedProperty | null {
    const $ = cheerio.load(html);
    const externalId = this.extractPropertyId(url);
    if (!externalId) return null;

    const title = $('.main-info__title').text().trim();
    const description = $('.comment').text().trim();
    const priceText = $('.info-data-price').text().trim();
    const price = this.parsePrice(priceText);

    const city = $('.main-info__title-minor').text().split(',')[0]?.trim() || 'Unknown';
    const contractType = url.includes('/affitto-') ? 'rent' : 'sale';

    const data: ScrapedPropertyData = {
      portal: ScrapingPortal.IDEALISTA_IT,
      externalId,
      externalUrl: url,
      title,
      description,
      city,
      contractType,
      propertyType: 'Immobile',
      priceSale: contractType === 'sale' ? price : undefined,
      priceRent: contractType === 'rent' ? price : undefined,
    };

    return new ScrapedProperty(data);
  }

  getNextPageUrl(html: string, currentUrl: string): string | null {
    const $ = cheerio.load(html);
    const nextLink = $('a.icon-arrow-right-after').attr('href');
    return nextLink ? (nextLink.startsWith('http') ? nextLink : this.baseUrl + nextLink) : null;
  }

  getTotalResults(html: string): number {
    const $ = cheerio.load(html);
    const text = $('.showing-results').text();
    const match = text.match(/(\d+(?:\.\d+)?)/);
    return match ? parseInt(match[1].replace('.', '')) : 0;
  }

  extractPropertyId(url: string): string | null {
    const match = url.match(/immobile-(\d+)/);
    return match ? match[1] : null;
  }

  isValidUrl(url: string): boolean {
    return url.includes('idealista.it');
  }

  private getCurrentPage(url: string): number {
    try {
      const urlObj = new URL(url);
      return parseInt(urlObj.searchParams.get('pagina') || '1');
    } catch {
      return 1;
    }
  }

  private parsePrice(text: string): number | undefined {
    const cleaned = text.replace(/\./g, '').replace(/,/g, '.');
    const match = cleaned.match(/(\d+(?:\.\d+)?)/);
    return match ? parseFloat(match[1]) : undefined;
  }
}
