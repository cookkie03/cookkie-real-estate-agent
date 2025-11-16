/**
 * Scraping Job Entity (Domain Layer)
 *
 * Represents a scraping job for extracting property listings from real estate portals.
 */

export enum ScrapingStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
}

export enum ScrapingPortal {
  IMMOBILIARE_IT = 'immobiliare.it',
  CASA_IT = 'casa.it',
  IDEALISTA_IT = 'idealista.it',
}

export interface ScrapingJobConfig {
  portal: ScrapingPortal;
  searchUrl: string;
  maxPages?: number;
  maxProperties?: number;
  filters?: {
    contractType?: 'sale' | 'rent';
    propertyType?: string;
    city?: string;
    priceMin?: number;
    priceMax?: number;
    surfaceMin?: number;
    surfaceMax?: number;
  };
  deduplication?: boolean;
  importToDatabase?: boolean;
  headful?: boolean;
  mode?: 'portal' | 'crm' | 'institutional';
}

export interface ScrapingJobResult {
  propertiesFound: number;
  propertiesImported: number;
  propertiesDuplicated: number;
  propertiesSkipped: number;
  pagesScraped: number;
  errors: string[];
  startedAt: Date;
  completedAt?: Date;
  duration?: number; // milliseconds
}

export class ScrapingJob {
  id: string;
  status: ScrapingStatus;
  config: ScrapingJobConfig;
  result?: ScrapingJobResult;
  progress: number; // 0-100
  currentPage?: number;
  error?: string;
  createdAt: Date;
  startedAt?: Date;
  completedAt?: Date;
  createdBy?: string;

  constructor(data: Partial<ScrapingJob>) {
    this.id = data.id || this.generateId();
    this.status = data.status || ScrapingStatus.PENDING;
    this.config = data.config!;
    this.progress = data.progress || 0;
    this.createdAt = data.createdAt || new Date();
    this.currentPage = data.currentPage;
    this.error = data.error;
    this.startedAt = data.startedAt;
    this.completedAt = data.completedAt;
    this.result = data.result;
    this.createdBy = data.createdBy;
  }

  /**
   * Start the job
   */
  start(): void {
    if (this.status !== ScrapingStatus.PENDING) {
      throw new Error(`Cannot start job in status: ${this.status}`);
    }

    this.status = ScrapingStatus.IN_PROGRESS;
    this.startedAt = new Date();
    this.progress = 0;

    this.result = {
      propertiesFound: 0,
      propertiesImported: 0,
      propertiesDuplicated: 0,
      propertiesSkipped: 0,
      pagesScraped: 0,
      errors: [],
      startedAt: this.startedAt,
    };
  }

  /**
   * Update progress
   */
  updateProgress(page: number, totalPages: number): void {
    this.currentPage = page;
    this.progress = Math.round((page / totalPages) * 100);
  }

  /**
   * Complete the job successfully
   */
  complete(): void {
    if (this.status !== ScrapingStatus.IN_PROGRESS) {
      throw new Error(`Cannot complete job in status: ${this.status}`);
    }

    this.status = ScrapingStatus.COMPLETED;
    this.completedAt = new Date();
    this.progress = 100;

    if (this.result && this.startedAt) {
      this.result.completedAt = this.completedAt;
      this.result.duration = this.completedAt.getTime() - this.startedAt.getTime();
    }
  }

  /**
   * Fail the job
   */
  fail(error: string): void {
    this.status = ScrapingStatus.FAILED;
    this.completedAt = new Date();
    this.error = error;

    if (this.result) {
      this.result.errors.push(error);
      this.result.completedAt = this.completedAt;
      if (this.startedAt) {
        this.result.duration = this.completedAt.getTime() - this.startedAt.getTime();
      }
    }
  }

  /**
   * Cancel the job
   */
  cancel(): void {
    if (this.status === ScrapingStatus.COMPLETED || this.status === ScrapingStatus.FAILED) {
      throw new Error(`Cannot cancel job in status: ${this.status}`);
    }

    this.status = ScrapingStatus.CANCELLED;
    this.completedAt = new Date();
  }

  /**
   * Add property to results
   */
  addPropertyFound(): void {
    if (this.result) {
      this.result.propertiesFound++;
    }
  }

  /**
   * Add imported property
   */
  addPropertyImported(): void {
    if (this.result) {
      this.result.propertiesImported++;
    }
  }

  /**
   * Add duplicated property
   */
  addPropertyDuplicated(): void {
    if (this.result) {
      this.result.propertiesDuplicated++;
    }
  }

  /**
   * Add skipped property
   */
  addPropertySkipped(): void {
    if (this.result) {
      this.result.propertiesSkipped++;
    }
  }

  /**
   * Add scraped page
   */
  addPageScraped(): void {
    if (this.result) {
      this.result.pagesScraped++;
    }
  }

  /**
   * Add error
   */
  addError(error: string): void {
    if (this.result) {
      this.result.errors.push(error);
    }
  }

  /**
   * Check if job is active
   */
  isActive(): boolean {
    return this.status === ScrapingStatus.IN_PROGRESS;
  }

  /**
   * Check if job is finished
   */
  isFinished(): boolean {
    return [
      ScrapingStatus.COMPLETED,
      ScrapingStatus.FAILED,
      ScrapingStatus.CANCELLED,
    ].includes(this.status);
  }

  /**
   * Get success rate
   */
  getSuccessRate(): number {
    if (!this.result || this.result.propertiesFound === 0) {
      return 0;
    }

    return Math.round(
      (this.result.propertiesImported / this.result.propertiesFound) * 100,
    );
  }

  /**
   * Generate unique job ID
   */
  private generateId(): string {
    return `scrape_${Date.now()}_${Math.random().toString(36).substring(7)}`;
  }
}
