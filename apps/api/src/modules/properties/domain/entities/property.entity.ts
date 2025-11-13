/**
 * Property Entity (Domain)
 *
 * Core business entity for real estate properties.
 * Contains business logic and validation.
 */

import { PropertyStatus } from '@crm-immobiliare/shared-types';

export class Property {
  id: string;
  code: string;
  status: PropertyStatus;

  // Address
  street: string;
  civic?: string;
  city: string;
  province: string;
  latitude: number;
  longitude: number;

  // Type
  contractType: string;
  propertyType: string;

  // Dimensions
  sqmCommercial?: number;
  rooms?: number;
  bedrooms?: number;

  // Prices
  priceSale?: number;
  priceRentMonthly?: number;

  // Marketing
  title?: string;
  description?: string;

  // Timestamps
  createdAt: Date;
  updatedAt: Date;

  constructor(data: Partial<Property>) {
    Object.assign(this, data);
  }

  /**
   * Business validation
   */
  isValid(): boolean {
    if (!this.street || !this.city || !this.contractType || !this.propertyType) {
      return false;
    }

    if (this.contractType === 'sale' && !this.priceSale) {
      return false;
    }

    if (this.contractType === 'rent' && !this.priceRentMonthly) {
      return false;
    }

    return true;
  }

  /**
   * Calculate urgency score (0-5)
   */
  calculateUrgency(): number {
    // Implementation of urgency calculation algorithm
    // Based on days on market, last activity, status, etc.
    return 0; // Placeholder
  }
}
