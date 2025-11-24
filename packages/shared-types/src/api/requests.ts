/**
 * API Request Types
 * @packageDocumentation
 */

/**
 * Pagination Request
 */
export interface PaginationRequest {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

/**
 * Search Request
 */
export interface SearchRequest extends PaginationRequest {
  search?: string;
}

/**
 * Bounding Box Request (for map queries)
 */
export interface BBoxRequest {
  northEast: {
    lat: number;
    lng: number;
  };
  southWest: {
    lat: number;
    lng: number;
  };
}

/**
 * Matching Request
 */
export interface MatchingRequest {
  requestId: string;
  minScore?: number;
  maxResults?: number;
}

/**
 * Scraping Job Request
 */
export interface ScrapingJobRequest {
  portal: string;
  location?: string;
  contractType?: 'sale' | 'rent';
  propertyType?: string;
  priceMin?: number;
  priceMax?: number;
  maxPages?: number;
}

/**
 * Chat Message Request
 */
export interface ChatMessageRequest {
  message: string;
  conversationId?: string;
}
