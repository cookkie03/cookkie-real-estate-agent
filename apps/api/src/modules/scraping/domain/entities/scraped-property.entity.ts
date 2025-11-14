/**
 * Scraped Property Entity (Domain Layer)
 *
 * Represents a property extracted from a real estate portal.
 */

import { ScrapingPortal } from './scraping-job.entity';

export interface ScrapedPropertyData {
  // Source information
  portal: ScrapingPortal;
  externalId: string;
  externalUrl: string;

  // Basic information
  title: string;
  description?: string;

  // Location
  street?: string;
  city: string;
  province?: string;
  region?: string;
  zone?: string;
  latitude?: number;
  longitude?: number;
  cap?: string;

  // Property details
  contractType: 'sale' | 'rent';
  propertyType: string;
  priceSale?: number;
  priceRent?: number;
  surfaceTotal?: number;
  surfaceInternal?: number;
  rooms?: number;
  bedrooms?: number;
  bathrooms?: number;
  floor?: number;
  totalFloors?: number;

  // Features
  hasElevator?: boolean;
  hasParking?: boolean;
  hasGarden?: boolean;
  hasTerrace?: boolean;
  hasBalcony?: boolean;
  hasPool?: boolean;
  hasGym?: boolean;
  hasConcierge?: boolean;
  hasStorageRoom?: boolean;
  petFriendly?: boolean;
  furnished?: 'yes' | 'no' | 'partial';
  condition?: 'new' | 'excellent' | 'good' | 'to_renovate';
  energyClass?: string;
  hasAirConditioning?: boolean;
  hasHeating?: boolean;
  heatingType?: string;
  exposition?: string;

  // Metadata
  publishedAt?: Date;
  images?: string[];
  agentName?: string;
  agentPhone?: string;
  agentEmail?: string;

  // Additional data
  rawData?: any; // Store original JSON for debugging
}

export class ScrapedProperty {
  data: ScrapedPropertyData;
  scrapedAt: Date;
  jobId?: string;

  constructor(data: ScrapedPropertyData, jobId?: string) {
    this.data = data;
    this.scrapedAt = new Date();
    this.jobId = jobId;
  }

  /**
   * Validate if property has minimum required data
   */
  isValid(): boolean {
    const required = [
      this.data.portal,
      this.data.externalId,
      this.data.externalUrl,
      this.data.title,
      this.data.city,
      this.data.contractType,
      this.data.propertyType,
    ];

    return required.every((field) => field !== undefined && field !== null);
  }

  /**
   * Check if property has price information
   */
  hasPrice(): boolean {
    if (this.data.contractType === 'sale') {
      return this.data.priceSale !== undefined && this.data.priceSale > 0;
    }
    return this.data.priceRent !== undefined && this.data.priceRent > 0;
  }

  /**
   * Check if property has location coordinates
   */
  hasCoordinates(): boolean {
    return (
      this.data.latitude !== undefined &&
      this.data.longitude !== undefined &&
      this.data.latitude !== 0 &&
      this.data.longitude !== 0
    );
  }

  /**
   * Get unique identifier for deduplication
   */
  getUniqueKey(): string {
    return `${this.data.portal}:${this.data.externalId}`;
  }

  /**
   * Convert to database property format
   */
  toDatabaseFormat(): any {
    const price =
      this.data.contractType === 'sale'
        ? this.data.priceSale
        : this.data.priceRent;

    return {
      code: `${this.data.portal.toUpperCase()}-${this.data.externalId}`,
      status: 'draft', // New scraped properties start as draft
      street: this.data.street || 'N/A',
      city: this.data.city,
      province: this.data.province,
      region: this.data.region,
      zone: this.data.zone,
      cap: this.data.cap,
      latitude: this.data.latitude || 0,
      longitude: this.data.longitude || 0,
      contractType: this.data.contractType,
      propertyType: this.data.propertyType,
      priceSale: this.data.contractType === 'sale' ? this.data.priceSale : null,
      priceRent: this.data.contractType === 'rent' ? this.data.priceRent : null,
      surfaceTotal: this.data.surfaceTotal,
      surfaceInternal: this.data.surfaceInternal,
      rooms: this.data.rooms,
      bedrooms: this.data.bedrooms,
      bathrooms: this.data.bathrooms,
      floor: this.data.floor,
      totalFloors: this.data.totalFloors,
      hasElevator: this.data.hasElevator || false,
      hasParking: this.data.hasParking || false,
      hasGarden: this.data.hasGarden || false,
      hasTerrace: this.data.hasTerrace || false,
      hasBalcony: this.data.hasBalcony || false,
      hasPool: this.data.hasPool || false,
      hasGym: this.data.hasGym || false,
      hasConcierge: this.data.hasConcierge || false,
      hasStorageRoom: this.data.hasStorageRoom || false,
      petFriendly: this.data.petFriendly || false,
      furnished: this.data.furnished || 'no',
      condition: this.data.condition || 'good',
      energyClass: this.data.energyClass,
      hasAirConditioning: this.data.hasAirConditioning || false,
      hasHeating: this.data.hasHeating || false,
      heatingType: this.data.heatingType,
      exposition: this.data.exposition,
      title: this.data.title,
      description: this.data.description,
      images: this.data.images ? JSON.stringify(this.data.images) : null,
      externalUrl: this.data.externalUrl,
      source: this.data.portal,
      sourceId: this.data.externalId,
      isImported: true,
      importedAt: this.scrapedAt,
    };
  }

  /**
   * Get property summary for logging
   */
  getSummary(): string {
    const price = this.hasPrice()
      ? this.data.contractType === 'sale'
        ? `€${this.data.priceSale?.toLocaleString()}`
        : `€${this.data.priceRent}/month`
      : 'Price N/A';

    return `${this.data.propertyType} in ${this.data.city} - ${price} (${this.data.portal}:${this.data.externalId})`;
  }
}
