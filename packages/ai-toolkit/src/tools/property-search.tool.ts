/**
 * Property Search Tool
 *
 * Tool for searching properties in the CRM database.
 * Used by AI agents to find properties matching specific criteria.
 */

import { z } from 'zod';
import { Tool } from '../types';

/**
 * Input schema for property search
 */
export const PropertySearchInputSchema = z.object({
  city: z.string().optional().describe('City name (e.g., "Milano", "Roma")'),
  zone: z.string().optional().describe('Zone/neighborhood name'),
  contractType: z
    .enum(['sale', 'rent'])
    .optional()
    .describe('Contract type: sale or rent'),
  propertyType: z
    .string()
    .optional()
    .describe('Property type (e.g., "Appartamento", "Villa", "Attico")'),
  budgetMin: z
    .number()
    .optional()
    .describe('Minimum budget/price in euros'),
  budgetMax: z
    .number()
    .optional()
    .describe('Maximum budget/price in euros'),
  surfaceMin: z.number().optional().describe('Minimum surface area in m²'),
  surfaceMax: z.number().optional().describe('Maximum surface area in m²'),
  roomsMin: z.number().optional().describe('Minimum number of rooms'),
  roomsMax: z.number().optional().describe('Maximum number of rooms'),
  features: z
    .array(z.string())
    .optional()
    .describe('Required features (e.g., ["garage", "giardino", "terrazzo"])'),
  limit: z
    .number()
    .max(100)
    .default(10)
    .describe('Maximum number of results to return'),
});

export type PropertySearchInput = z.infer<typeof PropertySearchInputSchema>;

export interface PropertySearchResult {
  id: string;
  code: string;
  title: string;
  city: string;
  zone?: string;
  contractType: 'sale' | 'rent';
  propertyType: string;
  price?: number;
  surface?: number;
  rooms?: number;
  bedrooms?: number;
  bathrooms?: number;
  features?: string[];
  status: string;
  createdAt: Date;
}

/**
 * Property Search Tool implementation
 */
export class PropertySearchTool
  implements Tool<PropertySearchInput, PropertySearchResult[]>
{
  name = 'property_search';
  description =
    'Search for properties in the CRM database based on criteria like location, type, price, size, and features.';
  schema = PropertySearchInputSchema;

  private dataFetcher?: (
    params: PropertySearchInput,
  ) => Promise<PropertySearchResult[]>;

  /**
   * Configure data fetcher (inject from API/repository)
   */
  setDataFetcher(
    fetcher: (params: PropertySearchInput) => Promise<PropertySearchResult[]>,
  ): void {
    this.dataFetcher = fetcher;
  }

  /**
   * Execute property search
   */
  async execute(input: PropertySearchInput): Promise<PropertySearchResult[]> {
    if (!this.dataFetcher) {
      throw new Error(
        'PropertySearchTool: data fetcher not configured. Call setDataFetcher() first.',
      );
    }

    try {
      const results = await this.dataFetcher(input);

      // Log search for analytics
      console.log(`[PropertySearchTool] Found ${results.length} properties`, {
        criteria: input,
        resultCount: results.length,
      });

      return results;
    } catch (error) {
      console.error('[PropertySearchTool] Search failed:', error);
      throw new Error(
        `Property search failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  /**
   * Format results for LLM consumption
   */
  formatResults(results: PropertySearchResult[]): string {
    if (results.length === 0) {
      return 'No properties found matching the criteria.';
    }

    let formatted = `Found ${results.length} properties:\n\n`;

    results.forEach((property, index) => {
      formatted += `${index + 1}. ${property.title}\n`;
      formatted += `   - ID: ${property.id}\n`;
      formatted += `   - Location: ${property.city}${property.zone ? `, ${property.zone}` : ''}\n`;
      formatted += `   - Type: ${property.propertyType} (${property.contractType})\n`;

      if (property.price) {
        formatted += `   - Price: €${property.price.toLocaleString()}\n`;
      }

      if (property.surface) {
        formatted += `   - Surface: ${property.surface}m²\n`;
      }

      if (property.rooms) {
        formatted += `   - Rooms: ${property.rooms}`;
        if (property.bedrooms) {
          formatted += ` (${property.bedrooms} bedrooms)`;
        }
        formatted += '\n';
      }

      if (property.features && property.features.length > 0) {
        formatted += `   - Features: ${property.features.join(', ')}\n`;
      }

      formatted += `   - Status: ${property.status}\n\n`;
    });

    return formatted;
  }
}
