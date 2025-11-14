/**
 * Immobiliare.it Parser (Infrastructure Layer)
 *
 * Parser for immobiliare.it - Italy's largest real estate portal.
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
export class ImmobiliareItParser implements PortalParser {
  private readonly logger = new Logger(ImmobiliareItParser.name);
  private readonly baseUrl = 'https://www.immobiliare.it';

  constructor(private browserService: PlaywrightBrowserService) {}

  getPortal(): ScrapingPortal {
    return ScrapingPortal.IMMOBILIARE_IT;
  }

  /**
   * Build search URL from filters
   */
  buildSearchUrl(filters: {
    contractType?: 'sale' | 'rent';
    propertyType?: string;
    city?: string;
    priceMin?: number;
    priceMax?: number;
    surfaceMin?: number;
    surfaceMax?: number;
    page?: number;
  }): string {
    const contractPath = filters.contractType === 'rent' ? 'affitto' : 'vendita';
    const propertyPath = this.mapPropertyType(filters.propertyType);
    const cityPath = filters.city?.toLowerCase().replace(/\s+/g, '-') || '';

    let url = `${this.baseUrl}/${contractPath}/${propertyPath}/${cityPath}/`;

    // Add query parameters
    const params = new URLSearchParams();

    if (filters.priceMin) {
      params.append('prezzoMinimo', filters.priceMin.toString());
    }
    if (filters.priceMax) {
      params.append('prezzoMassimo', filters.priceMax.toString());
    }
    if (filters.surfaceMin) {
      params.append('superficieMinima', filters.surfaceMin.toString());
    }
    if (filters.surfaceMax) {
      params.append('superficieMassima', filters.surfaceMax.toString());
    }
    if (filters.page && filters.page > 1) {
      params.append('pag', filters.page.toString());
    }

    const queryString = params.toString();
    if (queryString) {
      url += `?${queryString}`;
    }

    return url;
  }

  /**
   * Map generic property type to immobiliare.it path
   */
  private mapPropertyType(type?: string): string {
    if (!type) return 'case';

    const mapping: Record<string, string> = {
      appartamento: 'appartamenti',
      villa: 'ville',
      attico: 'attici',
      casa: 'case',
      loft: 'loft',
      monolocale: 'monolocali',
      bilocale: 'bilocali',
      trilocale: 'trilocali',
    };

    return mapping[type.toLowerCase()] || 'case';
  }

  /**
   * Scrape a search results page
   */
  async scrapePage(url: string, config?: ParserConfig): Promise<SearchPage> {
    this.logger.log(`Scraping search page: ${url}`);

    try {
      const html = await this.browserService.getPageHtml(url, {
        waitForSelector: '.in-realEstateResults',
        timeout: config?.timeout || 30000,
      });

      const searchPage = this.parseSearchResults(html, url);

      this.logger.log(
        `✅ Found ${searchPage.properties.length} properties on page ${searchPage.currentPage}`,
      );

      return searchPage;
    } catch (error) {
      this.logger.error(`Error scraping page ${url}:`, error);
      throw error;
    }
  }

  /**
   * Parse search results HTML
   */
  parseSearchResults(html: string, pageUrl: string): SearchPage {
    const $ = cheerio.load(html);
    const properties: ScrapedProperty[] = [];

    // Extract property cards
    $('.in-realEstateResults .in-card').each((index, element) => {
      try {
        const property = this.parsePropertyCard($, $(element), pageUrl);
        if (property && property.isValid()) {
          properties.push(property);
        }
      } catch (error) {
        this.logger.warn(`Error parsing property card ${index}:`, error);
      }
    });

    // Get pagination info
    const currentPage = this.getCurrentPage(pageUrl);
    const nextPageUrl = this.getNextPageUrl(html, pageUrl);
    const totalResults = this.getTotalResults(html);

    return {
      url: pageUrl,
      html,
      properties,
      currentPage,
      nextPageUrl: nextPageUrl || undefined,
      totalResults,
    };
  }

  /**
   * Parse individual property card from search results
   */
  private parsePropertyCard(
    $: cheerio.CheerioAPI,
    card: cheerio.Cheerio<any>,
    pageUrl: string,
  ): ScrapedProperty | null {
    try {
      // Extract URL and ID
      const link = card.find('a.in-card__title').attr('href');
      if (!link) return null;

      const externalUrl = link.startsWith('http') ? link : this.baseUrl + link;
      const externalId = this.extractPropertyId(externalUrl);
      if (!externalId) return null;

      // Extract basic info
      const title = card.find('.in-card__title').text().trim();
      const priceText = card.find('.in-card__price').text().trim();
      const price = this.parsePrice(priceText);

      // Extract location
      const location = card.find('.in-card__location').text().trim();
      const { city, zone } = this.parseLocation(location);

      // Extract property type
      const categoryText = card.find('.in-card__features').first().text().trim();
      const propertyType = this.parsePropertyType(categoryText);

      // Extract surface and rooms
      const featuresText = card.find('.in-card__features').text();
      const surface = this.extractNumber(featuresText, /(\d+)\s*m²/);
      const rooms = this.extractNumber(featuresText, /(\d+)\s*local/i);

      // Determine contract type from page URL
      const contractType = pageUrl.includes('/affitto/') ? 'rent' : 'sale';

      const data: ScrapedPropertyData = {
        portal: ScrapingPortal.IMMOBILIARE_IT,
        externalId,
        externalUrl,
        title,
        city,
        zone,
        contractType,
        propertyType,
        priceSale: contractType === 'sale' ? price : undefined,
        priceRent: contractType === 'rent' ? price : undefined,
        surfaceInternal: surface,
        rooms,
      };

      return new ScrapedProperty(data);
    } catch (error) {
      this.logger.warn('Error parsing property card:', error);
      return null;
    }
  }

  /**
   * Scrape property details page
   */
  async scrapePropertyDetails(
    url: string,
    config?: ParserConfig,
  ): Promise<ScrapedProperty | null> {
    this.logger.log(`Scraping property details: ${url}`);

    try {
      const html = await this.browserService.getPageHtml(url, {
        waitForSelector: '.im-mainFeatures',
        timeout: config?.timeout || 30000,
      });

      return this.parsePropertyDetails(html, url);
    } catch (error) {
      this.logger.error(`Error scraping property details ${url}:`, error);
      return null;
    }
  }

  /**
   * Parse property details HTML
   */
  parsePropertyDetails(html: string, url: string): ScrapedProperty | null {
    const $ = cheerio.load(html);

    try {
      const externalId = this.extractPropertyId(url);
      if (!externalId) return null;

      // Basic info
      const title = $('.im-titleBlock__title').text().trim();
      const description = $('.im-description__text').text().trim();

      // Price
      const priceText = $('.im-mainFeatures__price').text().trim();
      const price = this.parsePrice(priceText);

      // Location
      const location = $('.im-titleBlock__subtitle').text().trim();
      const { city, zone, street } = this.parseDetailedLocation(location);

      // Property type
      const categoryText = $('.im-mainFeatures__category').text().trim();
      const propertyType = this.parsePropertyType(categoryText);

      // Contract type
      const contractType = url.includes('/affitto/') ? 'rent' : 'sale';

      // Surface and rooms
      const surface = this.extractFeatureValue($, 'Superficie');
      const rooms = this.extractFeatureValue($, 'locali');
      const bedrooms = this.extractFeatureValue($, 'camere');
      const bathrooms = this.extractFeatureValue($, 'bagni');
      const floor = this.extractFeatureValue($, 'Piano');

      // Features
      const hasElevator = this.hasFeature($, 'ascensore');
      const hasParking = this.hasFeature($, 'posto auto');
      const hasGarden = this.hasFeature($, 'giardino');
      const hasTerrace = this.hasFeature($, 'terrazzo');
      const hasBalcony = this.hasFeature($, 'balcone');

      // Condition
      const conditionText = $('.im-mainFeatures__value').filter((i, el) =>
        $(el).prev().text().includes('Stato'),
      ).text().trim();
      const condition = this.parseCondition(conditionText);

      // Energy class
      const energyClass = $('.im-mainFeatures__energyClass').text().trim();

      // Images
      const images: string[] = [];
      $('.im-carosello__item img').each((i, el) => {
        const src = $(el).attr('src');
        if (src && !src.includes('placeholder')) {
          images.push(src);
        }
      });

      const data: ScrapedPropertyData = {
        portal: ScrapingPortal.IMMOBILIARE_IT,
        externalId,
        externalUrl: url,
        title,
        description,
        street,
        city,
        zone,
        contractType,
        propertyType,
        priceSale: contractType === 'sale' ? price : undefined,
        priceRent: contractType === 'rent' ? price : undefined,
        surfaceInternal: surface,
        rooms,
        bedrooms,
        bathrooms,
        floor,
        hasElevator,
        hasParking,
        hasGarden,
        hasTerrace,
        hasBalcony,
        condition,
        energyClass: energyClass || undefined,
        images: images.length > 0 ? images : undefined,
      };

      return new ScrapedProperty(data);
    } catch (error) {
      this.logger.error('Error parsing property details:', error);
      return null;
    }
  }

  /**
   * Get next page URL from pagination
   */
  getNextPageUrl(html: string, currentUrl: string): string | null {
    const $ = cheerio.load(html);

    // Find next page link
    const nextLink = $('.in-pagination__item--next a').attr('href');

    if (nextLink) {
      return nextLink.startsWith('http') ? nextLink : this.baseUrl + nextLink;
    }

    // Alternative: increment page parameter
    const urlObj = new URL(currentUrl);
    const currentPage = parseInt(urlObj.searchParams.get('pag') || '1');

    // Check if there are more results
    const hasMoreResults = $('.in-pagination__item').length > 1;
    if (hasMoreResults) {
      urlObj.searchParams.set('pag', (currentPage + 1).toString());
      return urlObj.toString();
    }

    return null;
  }

  /**
   * Get total results count
   */
  getTotalResults(html: string): number {
    const $ = cheerio.load(html);
    const resultsText = $('.in-searchList__title').text();
    const match = resultsText.match(/(\d+(?:\.\d+)?)\s*annunc/i);
    if (match) {
      return parseInt(match[1].replace('.', ''));
    }
    return 0;
  }

  /**
   * Extract property ID from URL
   */
  extractPropertyId(url: string): string | null {
    const match = url.match(/annunci\/(\d+)/);
    return match ? match[1] : null;
  }

  /**
   * Validate if URL belongs to immobiliare.it
   */
  isValidUrl(url: string): boolean {
    return url.includes('immobiliare.it');
  }

  /**
   * Helper: Get current page number from URL
   */
  private getCurrentPage(url: string): number {
    try {
      const urlObj = new URL(url);
      const page = urlObj.searchParams.get('pag');
      return page ? parseInt(page) : 1;
    } catch {
      return 1;
    }
  }

  /**
   * Helper: Parse price from text
   */
  private parsePrice(text: string): number | undefined {
    const cleaned = text.replace(/\./g, '').replace(/,/g, '.');
    const match = cleaned.match(/(\d+(?:\.\d+)?)/);
    return match ? parseFloat(match[1]) : undefined;
  }

  /**
   * Helper: Parse location from search results
   */
  private parseLocation(text: string): { city: string; zone?: string } {
    const parts = text.split(',').map((p) => p.trim());
    return {
      city: parts[0] || 'Unknown',
      zone: parts[1],
    };
  }

  /**
   * Helper: Parse detailed location from property page
   */
  private parseDetailedLocation(text: string): {
    city: string;
    zone?: string;
    street?: string;
  } {
    const parts = text.split(',').map((p) => p.trim());
    return {
      street: parts[0],
      city: parts[1] || 'Unknown',
      zone: parts[2],
    };
  }

  /**
   * Helper: Parse property type from text
   */
  private parsePropertyType(text: string): string {
    const lower = text.toLowerCase();

    if (lower.includes('appartamento')) return 'Appartamento';
    if (lower.includes('villa')) return 'Villa';
    if (lower.includes('attico')) return 'Attico';
    if (lower.includes('loft')) return 'Loft';
    if (lower.includes('monolocale')) return 'Monolocale';
    if (lower.includes('bilocale')) return 'Bilocale';
    if (lower.includes('trilocale')) return 'Trilocale';

    return 'Immobile';
  }

  /**
   * Helper: Parse condition from text
   */
  private parseCondition(
    text: string,
  ): 'new' | 'excellent' | 'good' | 'to_renovate' | undefined {
    const lower = text.toLowerCase();

    if (lower.includes('nuov')) return 'new';
    if (lower.includes('ottim')) return 'excellent';
    if (lower.includes('buon')) return 'good';
    if (lower.includes('ristruttur')) return 'to_renovate';

    return undefined;
  }

  /**
   * Helper: Extract number from text using regex
   */
  private extractNumber(text: string, pattern: RegExp): number | undefined {
    const match = text.match(pattern);
    return match ? parseInt(match[1]) : undefined;
  }

  /**
   * Helper: Extract feature value from property details
   */
  private extractFeatureValue(
    $: cheerio.CheerioAPI,
    label: string,
  ): number | undefined {
    const value = $('.im-mainFeatures__value')
      .filter((i, el) => $(el).prev().text().toLowerCase().includes(label.toLowerCase()))
      .text()
      .trim();

    const num = parseInt(value.replace(/\D/g, ''));
    return isNaN(num) ? undefined : num;
  }

  /**
   * Helper: Check if property has a specific feature
   */
  private hasFeature($: cheerio.CheerioAPI, feature: string): boolean {
    return (
      $('.im-mainFeatures__list li')
        .text()
        .toLowerCase()
        .includes(feature.toLowerCase())
    );
  }
}
