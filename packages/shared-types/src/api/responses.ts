/**
 * API Response Types
 * @packageDocumentation
 */

/**
 * Standard API Response
 */
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

/**
 * Paginated Response
 */
export interface PaginatedResponse<T = unknown> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasMore: boolean;
  };
}

/**
 * Match Result Response
 */
export interface MatchResultResponse {
  id: string;
  requestId: string;
  propertyId: string;
  scoreTotal: number;
  scoreBreakdown: {
    location: number;
    price: number;
    size: number;
    features: number;
    condition: number;
  };
  status: string;
  property: {
    id: string;
    code: string;
    title?: string;
    street: string;
    city: string;
    propertyType: string;
    priceSale?: number;
    priceRentMonthly?: number;
    rooms?: number;
    sqmCommercial?: number;
  };
}

/**
 * Dashboard Stats Response
 */
export interface DashboardStatsResponse {
  properties: {
    total: number;
    available: number;
    draft: number;
    sold: number;
    rented: number;
    urgentCount: number;
  };
  contacts: {
    total: number;
    active: number;
    leads: number;
    vip: number;
  };
  activities: {
    scheduled: number;
    overdue: number;
    completed: number;
  };
  matches: {
    suggested: number;
    sent: number;
    interested: number;
  };
}

/**
 * Chat Response
 */
export interface ChatResponse {
  conversationId: string;
  message: string;
  results?: unknown;
  sources?: string[];
  confidence?: number;
}
