/**
 * Client Search Tool
 *
 * Tool for searching clients/contacts in the CRM database.
 * Used by AI agents to find clients matching specific criteria.
 */

import { z } from 'zod';
import { Tool } from '../types';

/**
 * Input schema for client search
 */
export const ClientSearchInputSchema = z.object({
  name: z.string().optional().describe('Client name (partial match)'),
  email: z.string().optional().describe('Client email'),
  phone: z.string().optional().describe('Client phone number'),
  status: z
    .enum(['active', 'inactive', 'archived', 'blacklist'])
    .optional()
    .describe('Client status'),
  contractType: z
    .enum(['sale', 'rent'])
    .optional()
    .describe('Contract type preference'),
  budgetMin: z.number().optional().describe('Minimum budget in euros'),
  budgetMax: z.number().optional().describe('Maximum budget in euros'),
  city: z.string().optional().describe('Preferred city'),
  limit: z
    .number()
    .max(100)
    .default(10)
    .describe('Maximum number of results to return'),
});

export type ClientSearchInput = z.infer<typeof ClientSearchInputSchema>;

export interface ClientSearchResult {
  id: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  status: string;
  contractType?: 'sale' | 'rent';
  budgetMin?: number;
  budgetMax?: number;
  preferredCities?: string[];
  preferredTypes?: string[];
  priority?: string;
  notes?: string;
  createdAt: Date;
  lastContactedAt?: Date;
}

/**
 * Client Search Tool implementation
 */
export class ClientSearchTool
  implements Tool<ClientSearchInput, ClientSearchResult[]>
{
  name = 'client_search';
  description =
    'Search for clients/contacts in the CRM database based on criteria like name, contact info, status, budget, and preferences.';
  schema = ClientSearchInputSchema;

  private dataFetcher?: (
    params: ClientSearchInput,
  ) => Promise<ClientSearchResult[]>;

  /**
   * Configure data fetcher (inject from API/repository)
   */
  setDataFetcher(
    fetcher: (params: ClientSearchInput) => Promise<ClientSearchResult[]>,
  ): void {
    this.dataFetcher = fetcher;
  }

  /**
   * Execute client search
   */
  async execute(input: ClientSearchInput): Promise<ClientSearchResult[]> {
    if (!this.dataFetcher) {
      throw new Error(
        'ClientSearchTool: data fetcher not configured. Call setDataFetcher() first.',
      );
    }

    try {
      const results = await this.dataFetcher(input);

      // Log search for analytics
      console.log(`[ClientSearchTool] Found ${results.length} clients`, {
        criteria: input,
        resultCount: results.length,
      });

      return results;
    } catch (error) {
      console.error('[ClientSearchTool] Search failed:', error);
      throw new Error(
        `Client search failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  /**
   * Format results for LLM consumption
   */
  formatResults(results: ClientSearchResult[]): string {
    if (results.length === 0) {
      return 'No clients found matching the criteria.';
    }

    let formatted = `Found ${results.length} clients:\n\n`;

    results.forEach((client, index) => {
      formatted += `${index + 1}. ${client.firstName} ${client.lastName}\n`;
      formatted += `   - ID: ${client.id}\n`;
      formatted += `   - Status: ${client.status}\n`;

      if (client.email) {
        formatted += `   - Email: ${client.email}\n`;
      }

      if (client.phone) {
        formatted += `   - Phone: ${client.phone}\n`;
      }

      if (client.contractType) {
        formatted += `   - Looking for: ${client.contractType}\n`;
      }

      if (client.budgetMin || client.budgetMax) {
        formatted += `   - Budget: €${client.budgetMin?.toLocaleString() || '?'} - €${client.budgetMax?.toLocaleString() || '?'}\n`;
      }

      if (client.preferredCities && client.preferredCities.length > 0) {
        formatted += `   - Preferred cities: ${client.preferredCities.join(', ')}\n`;
      }

      if (client.preferredTypes && client.preferredTypes.length > 0) {
        formatted += `   - Preferred types: ${client.preferredTypes.join(', ')}\n`;
      }

      if (client.priority) {
        formatted += `   - Priority: ${client.priority}\n`;
      }

      if (client.lastContactedAt) {
        const daysSince = Math.floor(
          (Date.now() - client.lastContactedAt.getTime()) /
            (1000 * 60 * 60 * 24),
        );
        formatted += `   - Last contacted: ${daysSince} days ago\n`;
      }

      if (client.notes) {
        formatted += `   - Notes: ${client.notes.substring(0, 100)}${client.notes.length > 100 ? '...' : ''}\n`;
      }

      formatted += '\n';
    });

    return formatted;
  }
}
