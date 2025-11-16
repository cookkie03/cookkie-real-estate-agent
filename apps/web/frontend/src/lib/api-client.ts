/**
 * API Client for Backend Communication
 *
 * Centralized HTTP client for calling the NestJS backend API
 * Base URL: http://localhost:3001/api
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

interface RequestOptions extends RequestInit {
  params?: Record<string, string | number | boolean>;
}

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  /**
   * Build URL with query parameters
   */
  private buildUrl(path: string, params?: Record<string, any>): string {
    const url = new URL(`${this.baseUrl}${path}`);

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          url.searchParams.append(key, String(value));
        }
      });
    }

    return url.toString();
  }

  /**
   * Generic request method
   */
  private async request<T>(
    path: string,
    options: RequestOptions = {}
  ): Promise<T> {
    const { params, ...fetchOptions } = options;
    const url = this.buildUrl(path, params);

    const response = await fetch(url, {
      ...fetchOptions,
      headers: {
        'Content-Type': 'application/json',
        ...fetchOptions.headers,
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({
        message: response.statusText,
      }));
      throw new Error(error.message || `HTTP ${response.status}: ${response.statusText}`);
    }

    // Handle 204 No Content
    if (response.status === 204) {
      return null as T;
    }

    return response.json();
  }

  // ============================================================
  // CLIENTS / CONTACTS
  // ============================================================

  async getClients(params?: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
  }) {
    return this.request('/clients', { params });
  }

  async getClient(id: string) {
    return this.request(`/clients/${id}`);
  }

  async createClient(data: any) {
    return this.request('/clients', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateClient(id: string, data: any) {
    return this.request(`/clients/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteClient(id: string) {
    return this.request(`/clients/${id}`, {
      method: 'DELETE',
    });
  }

  // ============================================================
  // PROPERTIES
  // ============================================================

  async getProperties(params?: {
    page?: number;
    limit?: number;
    search?: string;
    city?: string;
    type?: string;
    contractType?: string;
    priceMin?: number;
    priceMax?: number;
    mqMin?: number;
    mqMax?: number;
  }) {
    return this.request('/properties', { params });
  }

  async getProperty(id: string) {
    return this.request(`/properties/${id}`);
  }

  async createProperty(data: any) {
    return this.request('/properties', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateProperty(id: string, data: any) {
    return this.request(`/properties/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteProperty(id: string) {
    return this.request(`/properties/${id}`, {
      method: 'DELETE',
    });
  }

  // ============================================================
  // REQUESTS (Client Requests)
  // ============================================================

  async getRequests(params?: {
    page?: number;
    limit?: number;
    clientId?: string;
    status?: string;
  }) {
    return this.request('/requests', { params });
  }

  async getRequest(id: string) {
    return this.request(`/requests/${id}`);
  }

  async createRequest(data: any) {
    return this.request('/requests', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateRequest(id: string, data: any) {
    return this.request(`/requests/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteRequest(id: string) {
    return this.request(`/requests/${id}`, {
      method: 'DELETE',
    });
  }

  // ============================================================
  // MATCHING
  // ============================================================

  async calculateMatch(requestId: string) {
    return this.request(`/matching/${requestId}/calculate`, {
      method: 'POST',
    });
  }

  async getMatches(requestId: string, params?: {
    minScore?: number;
    limit?: number;
  }) {
    return this.request(`/matching/${requestId}/matches`, { params });
  }

  // ============================================================
  // SCRAPING
  // ============================================================

  async createScrapingJob(data: {
    type: 'portale_immobiliare' | 'crm_esterno' | 'portale_istituzionale';
    url: string;
    selectors?: Record<string, string>;
    headful?: boolean;
    streaming?: boolean;
  }) {
    return this.request('/scraping/jobs', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getScrapingJobs(params?: {
    status?: string;
    type?: string;
  }) {
    return this.request('/scraping/jobs', { params });
  }

  async getScrapingJob(id: string) {
    return this.request(`/scraping/jobs/${id}`);
  }

  async stopScrapingJob(id: string) {
    return this.request(`/scraping/jobs/${id}/stop`, {
      method: 'POST',
    });
  }

  // ============================================================
  // ANALYTICS
  // ============================================================

  async getDashboardStats() {
    return this.request('/analytics/dashboard');
  }

  async getReports(params?: {
    startDate?: string;
    endDate?: string;
    type?: string;
  }) {
    return this.request('/analytics/reports', { params });
  }

  // ============================================================
  // CALENDAR (Read-Only)
  // ============================================================

  async connectGoogleCalendar() {
    return this.request('/calendar/connect', {
      method: 'POST',
    });
  }

  async syncCalendar() {
    return this.request('/calendar/sync', {
      method: 'POST',
    });
  }

  async getCalendarEvents(params?: {
    startDate?: string;
    endDate?: string;
  }) {
    return this.request('/calendar/events', { params });
  }

  // ============================================================
  // ACTIVITIES / TASKS
  // ============================================================

  async getActivities(params?: {
    page?: number;
    limit?: number;
    entityType?: string;
    entityId?: string;
  }) {
    return this.request('/activities', { params });
  }

  async getTasks(params?: {
    status?: string;
    assignedTo?: string;
  }) {
    return this.request('/tasks', { params });
  }
}

// Export singleton instance
export const apiClient = new ApiClient();

// Export class for testing
export default ApiClient;
