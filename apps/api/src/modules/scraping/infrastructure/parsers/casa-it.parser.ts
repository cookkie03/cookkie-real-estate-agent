/**
 * Casa.it Parser (Infrastructure Layer)
 *
 * Parser for casa.it - Italian real estate portal.
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
export class CasaItParser implements PortalParser {
  private readonly logger = new Logger(CasaItParser.name);
  private readonly baseUrl = 'https://www.casa.it';

  constructor(private browserService: PlaywrightBrowserService) {}

  getPortal(): ScrapingPortal {
    return ScrapingPortal.CASA_IT;
  }

  buildSearchUrl(filters: {
    contractType?: 'sale' | 'rent';
    propertyType?: string;
    city?: string;
    priceMin?: number;
    priceMax?: number;
    page?: number;
  }): string {
    const contractPath = filters.contractType === 'rent' ? 'affitto' : 'vendita';
    const cityPath = filters.city?.toLowerCase().replace(/\s+/g, '-') || '';

    let url = `${this.baseUrl}/${contractPath}/${cityPath}`;

    const params = new URLSearchParams();
    if (filters.priceMin) params.append('prezzoMin', filters.priceMin.toString());
    if (filters.priceMax) params.append('prezzoMax', filters.priceMax.toString());
    if (filters.page && filters.page > 1) params.append('page', filters.page.toString());

    const queryString = params.toString();
    return queryString ? `${url}?${queryString}` : url;
  }

  async scrapePage(url: string, config?: ParserConfig): Promise<SearchPage> {
    this.logger.log(`Scraping Casa.it page: ${url}`);

    const html = await this.browserService.getPageHtml(url, {
      waitForSelector: '.listing-item',
      timeout: config?.timeout || 30000,
    });

    return this.parseSearchResults(html, url);
  }

  parseSearchResults(html: string, pageUrl: string): SearchPage {
    const $ = cheerio.load(html);
    const properties: ScrapedProperty[] = [];

    $('.listing-item').each((index, element) => {
      try {
        const property = this.parsePropertyCard($, $(element), pageUrl);
        if (property && property.isValid()) {
          properties.push(property);
        }
      } catch (error) {
        this.logger.warn(`Error parsing Casa.it card ${index}:`, error);
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
    const link = card.find('a.listing-item__link').attr('href');
    if (!link) return null;

    const externalUrl = link.startsWith('http') ? link : this.baseUrl + link;
    const externalId = this.extractPropertyId(externalUrl);
    if (!externalId) return null;

    const title = card.find('.listing-item__title').text().trim();
    const priceText = card.find('.listing-item__price').text().trim();
    const price = this.parsePrice(priceText);

    const location = card.find('.listing-item__location').text().trim();
    const city = location.split(',')[0]?.trim() || 'Unknown';

    const contractType = pageUrl.includes('/affitto/') ? 'rent' : 'sale';

    const data: ScrapedPropertyData = {
      portal: ScrapingPortal.CASA_IT,
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
    this.logger.log(`Scraping Casa.it property: ${url}`);

    const html = await this.browserService.getPageHtml(url, {
      waitForSelector: '.detail-page',
      timeout: config?.timeout || 30000,
    });

    return this.parsePropertyDetails(html, url);
  }

  parsePropertyDetails(html: string, url: string): ScrapedProperty | null {
    const $ = cheerio.load(html);
    const externalId = this.extractPropertyId(url);
    if (!externalId) return null;

    const title = $('.detail-page__title').text().trim();
    const description = $('.detail-page__description').text().trim();
    const priceText = $('.detail-page__price').text().trim();
    const price = this.parsePrice(priceText);

    const city = $('.detail-page__location').text().split(',')[0]?.trim() || 'Unknown';
    const contractType = url.includes('/affitto/') ? 'rent' : 'sale';

    const data: ScrapedPropertyData = {
      portal: ScrapingPortal.CASA_IT,
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
    const nextLink = $('.pagination__next').attr('href');
    return nextLink ? (nextLink.startsWith('http') ? nextLink : this.baseUrl + nextLink) : null;
  }

  getTotalResults(html: string): number {
    const $ = cheerio.load(html);
    const text = $('.results-count').text();
    const match = text.match(/(\d+)/);
    return match ? parseInt(match[1]) : 0;
  }

  extractPropertyId(url: string): string | null {
    const match = url.match(/\/(\d+)\//);
    return match ? match[1] : null;
  }

  isValidUrl(url: string): boolean {
    return url.includes('casa.it');
  }

  private getCurrentPage(url: string): number {
    try {
      const urlObj = new URL(url);
      return parseInt(urlObj.searchParams.get('page') || '1');
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
