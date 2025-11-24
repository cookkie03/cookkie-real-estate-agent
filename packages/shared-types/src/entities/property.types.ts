/**
 * Property Entity Types
 * @packageDocumentation
 */

import { PropertyStatus } from '../enums';

export interface PropertyEntity {
  id: string;
  code: string;
  ownerContactId?: string;
  buildingId?: string;
  status: PropertyStatus;
  visibility: string;
  source: string;
  sourceUrl?: string;
  importDate?: Date;
  verified: boolean;

  // Address
  street: string;
  civic?: string;
  internal?: string;
  floor?: string;
  city: string;
  province: string;
  zone?: string;
  zip?: string;
  latitude: number;
  longitude: number;

  // Type
  contractType: string;
  propertyType: string;
  propertyCategory?: string;

  // Dimensions
  sqmCommercial?: number;
  sqmLivable?: number;
  rooms?: number;
  bedrooms?: number;
  bathrooms?: number;

  // Features
  hasElevator: boolean;
  hasParking: boolean;
  hasGarage: boolean;
  hasGarden: boolean;
  hasTerrace: boolean;
  hasBalcony: boolean;
  hasCellar: boolean;
  hasAttic: boolean;
  hasSwimmingPool: boolean;
  hasFireplace: boolean;
  hasAlarm: boolean;
  hasAirConditioning: boolean;

  // Prices
  priceSale?: number;
  priceRentMonthly?: number;
  priceMinAcceptable?: number;
  condominiumFees?: number;

  // Marketing
  title?: string;
  description?: string;

  // Urgency
  urgencyScore: number;
  lastActivityAt?: Date;

  // Timestamps
  createdAt: Date;
  updatedAt: Date;
  publishedAt?: Date;
  archivedAt?: Date;
}

export interface PropertyListItem {
  id: string;
  code: string;
  status: PropertyStatus;
  title?: string;
  street: string;
  city: string;
  zone?: string;
  contractType: string;
  propertyType: string;
  priceSale?: number;
  priceRentMonthly?: number;
  rooms?: number;
  sqmCommercial?: number;
  urgencyScore: number;
  photosCount: number;
  lastActivityAt?: Date;
  createdAt: Date;
}

export interface PropertyMapMarker {
  id: string;
  code: string;
  latitude: number;
  longitude: number;
  contractType: string;
  propertyType: string;
  priceSale?: number;
  priceRentMonthly?: number;
  urgencyScore: number;
  status: PropertyStatus;
}
