/**
 * Portal Parser Interface (Domain Layer)
 *
 * Interface that all portal parsers must implement.
 * Defines the contract for scraping different real estate portals.
 */

import { ScrapedProperty } from '../entities/scraped-property.entity';
import { ScrapingPortal } from '../entities/scraping-job.entity';

export interface ParserConfig {
  maxRetries?: number;
  retryDelay?: number;
  timeout?: number;
  userAgent?: string;
  headless?: boolean;
  screenshot?: boolean;
}

export interface SearchPage {
  url: string;
  html?: string;
  properties: ScrapedProperty[];
  nextPageUrl?: string;
  totalResults?: number;
  currentPage: number;
}

export interface PortalParser {
  /**
   * Get portal identifier
   */
  getPortal(): ScrapingPortal;

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
  }): string;

  /**
   * Scrape a search results page
   */
  scrapePage(url: string, config?: ParserConfig): Promise<SearchPage>;

  /**
   * Extract property details from a property page
   */
  scrapePropertyDetails(
    url: string,
    config?: ParserConfig,
  ): Promise<ScrapedProperty | null>;

  /**
   * Extract property list from search results HTML
   */
  parseSearchResults(html: string, pageUrl: string): SearchPage;

  /**
   * Extract property details from property page HTML
   */
  parsePropertyDetails(html: string, url: string): ScrapedProperty | null;

  /**
   * Get next page URL from search results
   */
  getNextPageUrl(html: string, currentUrl: string): string | null;

  /**
   * Validate if a URL belongs to this portal
   */
  isValidUrl(url: string): boolean;

  /**
   * Get total results count from search page
   */
  getTotalResults(html: string): number;

  /**
   * Extract property external ID from URL
   */
  extractPropertyId(url: string): string | null;
}

/**
 * Browser service interface for Playwright
 */
export interface BrowserService {
  /**
   * Navigate to URL and get HTML content
   */
  getPageHtml(url: string, options?: {
    waitForSelector?: string;
    timeout?: number;
    screenshot?: boolean;
  }): Promise<string>;

  /**
   * Take screenshot of page
   */
  screenshot(url: string, path: string): Promise<void>;

  /**
   * Execute JavaScript in page context
   */
  evaluate<T>(url: string, script: string): Promise<T>;

  /**
   * Close browser
   */
  close(): Promise<void>;
}
