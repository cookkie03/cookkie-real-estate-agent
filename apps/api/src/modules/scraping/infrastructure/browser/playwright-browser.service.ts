/**
 * Playwright Browser Service (Infrastructure Layer)
 *
 * Manages Playwright browser instances for web scraping.
 */

import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { chromium, Browser, Page, BrowserContext } from 'playwright';
import { BrowserService } from '../../domain/interfaces/portal-parser.interface';

@Injectable()
export class PlaywrightBrowserService
  implements BrowserService, OnModuleDestroy
{
  private readonly logger = new Logger(PlaywrightBrowserService.name);
  private browser: Browser | null = null;
  private context: BrowserContext | null = null;
  private activePagesCount = 0;

  /**
   * Get or create browser instance
   */
  private async getBrowser(): Promise<Browser> {
    if (!this.browser) {
      this.logger.log('Launching Playwright browser...');
      this.browser = await chromium.launch({
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--disable-gpu',
        ],
      });
      this.logger.log('✅ Browser launched successfully');
    }
    return this.browser;
  }

  /**
   * Get or create browser context
   */
  private async getContext(): Promise<BrowserContext> {
    if (!this.context) {
      const browser = await this.getBrowser();
      this.context = await browser.newContext({
        userAgent:
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        viewport: { width: 1920, height: 1080 },
        locale: 'it-IT',
        timezoneId: 'Europe/Rome',
      });
    }
    return this.context;
  }

  /**
   * Create a new page
   */
  private async createPage(): Promise<Page> {
    const context = await this.getContext();
    const page = await context.newPage();

    // Set default timeout
    page.setDefaultTimeout(30000);

    // Block unnecessary resources to speed up scraping
    await page.route('**/*', (route) => {
      const resourceType = route.request().resourceType();
      if (['image', 'stylesheet', 'font', 'media'].includes(resourceType)) {
        route.abort();
      } else {
        route.continue();
      }
    });

    this.activePagesCount++;
    this.logger.debug(`Active pages: ${this.activePagesCount}`);

    return page;
  }

  /**
   * Close a page
   */
  private async closePage(page: Page): Promise<void> {
    try {
      await page.close();
      this.activePagesCount--;
      this.logger.debug(`Active pages: ${this.activePagesCount}`);
    } catch (error) {
      this.logger.error('Error closing page:', error);
    }
  }

  /**
   * Get HTML content from a URL
   */
  async getPageHtml(
    url: string,
    options: {
      waitForSelector?: string;
      timeout?: number;
      screenshot?: boolean;
    } = {},
  ): Promise<string> {
    let page: Page | null = null;

    try {
      this.logger.debug(`Fetching HTML from: ${url}`);

      page = await this.createPage();

      // Navigate to URL
      await page.goto(url, {
        waitUntil: 'domcontentloaded',
        timeout: options.timeout || 30000,
      });

      // Wait for specific selector if provided
      if (options.waitForSelector) {
        await page.waitForSelector(options.waitForSelector, {
          timeout: options.timeout || 30000,
        });
      }

      // Optional: wait a bit for dynamic content
      await page.waitForTimeout(1000);

      // Take screenshot if requested
      if (options.screenshot) {
        const screenshotPath = `/tmp/screenshot-${Date.now()}.png`;
        await page.screenshot({ path: screenshotPath, fullPage: true });
        this.logger.debug(`Screenshot saved: ${screenshotPath}`);
      }

      // Get HTML content
      const html = await page.content();

      this.logger.debug(
        `✅ HTML fetched successfully (${html.length} characters)`,
      );

      return html;
    } catch (error) {
      this.logger.error(`Error fetching HTML from ${url}:`, error);
      throw new Error(
        `Failed to fetch HTML: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    } finally {
      if (page) {
        await this.closePage(page);
      }
    }
  }

  /**
   * Take screenshot of a page
   */
  async screenshot(url: string, path: string): Promise<void> {
    let page: Page | null = null;

    try {
      this.logger.debug(`Taking screenshot of: ${url}`);

      page = await this.createPage();

      await page.goto(url, {
        waitUntil: 'domcontentloaded',
        timeout: 30000,
      });

      await page.waitForTimeout(1000);

      await page.screenshot({ path, fullPage: true });

      this.logger.log(`✅ Screenshot saved: ${path}`);
    } catch (error) {
      this.logger.error(`Error taking screenshot of ${url}:`, error);
      throw error;
    } finally {
      if (page) {
        await this.closePage(page);
      }
    }
  }

  /**
   * Execute JavaScript in page context
   */
  async evaluate<T>(url: string, script: string): Promise<T> {
    let page: Page | null = null;

    try {
      this.logger.debug(`Evaluating script on: ${url}`);

      page = await this.createPage();

      await page.goto(url, {
        waitUntil: 'domcontentloaded',
        timeout: 30000,
      });

      const result = await page.evaluate(script);

      return result as T;
    } catch (error) {
      this.logger.error(`Error evaluating script on ${url}:`, error);
      throw error;
    } finally {
      if (page) {
        await this.closePage(page);
      }
    }
  }

  /**
   * Close browser and cleanup
   */
  async close(): Promise<void> {
    this.logger.log('Closing browser...');

    try {
      if (this.context) {
        await this.context.close();
        this.context = null;
      }

      if (this.browser) {
        await this.browser.close();
        this.browser = null;
      }

      this.activePagesCount = 0;
      this.logger.log('✅ Browser closed successfully');
    } catch (error) {
      this.logger.error('Error closing browser:', error);
    }
  }

  /**
   * Cleanup on module destroy
   */
  async onModuleDestroy(): Promise<void> {
    await this.close();
  }

  /**
   * Get browser status
   */
  getStatus(): {
    browserRunning: boolean;
    contextActive: boolean;
    activePagesCount: number;
  } {
    return {
      browserRunning: this.browser !== null,
      contextActive: this.context !== null,
      activePagesCount: this.activePagesCount,
    };
  }
}
