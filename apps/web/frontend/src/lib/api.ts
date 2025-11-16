/**
 * API Client for CRM Backend
 * Handles all HTTP requests to the backend API
 */

import { API_BASE_URL } from "./constants";
import type {
  Property,
  Contact,
  Request,
  Match,
  Activity,
  Building,
  Tag,
  UserProfile,
  ApiResponse,
  PaginatedResponse,
  PropertyFormData,
  ContactFormData,
  RequestFormData,
  ActivityFormData,
  SettingsFormData,
  PropertyFilters,
  ContactFilters,
  ActivityFilters,
  DashboardStats,
} from "./types";

/**
 * Base fetch wrapper with error handling
 */
async function apiFetch<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;

  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options?.headers,
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({
        error: `HTTP ${response.status}: ${response.statusText}`,
      }));
      throw new Error(error.error || `HTTP ${response.status}`);
    }

    return response.json();
  } catch (error) {
    console.error(`API Error (${endpoint}):`, error);
    throw error;
  }
}

/**
 * Build query string from object
 */
function buildQueryString(params: Record<string, any>): string {
  const filtered = Object.entries(params).filter(
    ([, value]) => value !== undefined && value !== null && value !== ""
  );
  if (filtered.length === 0) return "";
  const searchParams = new URLSearchParams(
    filtered.map(([key, value]) => [key, String(value)])
  );
  return `?${searchParams.toString()}`;
}

// ============================================================================
// HEALTH CHECK
// ============================================================================

export const healthApi = {
  check: () => apiFetch<ApiResponse<{ status: string; database: string }>>(
    "/api/health"
  ),
};

// ============================================================================
// PROPERTIES
// ============================================================================

export const propertiesApi = {
  list: (filters?: PropertyFilters) => {
    const query = filters ? buildQueryString(filters) : "";
    return apiFetch<PaginatedResponse<Property>>(`/api/properties${query}`);
  },

  get: (id: string) =>
    apiFetch<ApiResponse<Property>>(`/api/properties/${id}`),

  create: (data: PropertyFormData) =>
    apiFetch<ApiResponse<Property>>("/api/properties", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  update: (id: string, data: Partial<PropertyFormData>) =>
    apiFetch<ApiResponse<Property>>(`/api/properties/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  delete: (id: string) =>
    apiFetch<ApiResponse<{ deleted: boolean }>>(`/api/properties/${id}`, {
      method: "DELETE",
    }),
};

// ============================================================================
// CONTACTS
// ============================================================================

export const contactsApi = {
  list: (filters?: ContactFilters) => {
    const query = filters ? buildQueryString(filters) : "";
    return apiFetch<PaginatedResponse<Contact>>(`/api/contacts${query}`);
  },

  get: (id: string) =>
    apiFetch<ApiResponse<Contact>>(`/api/contacts/${id}`),

  create: (data: ContactFormData) =>
    apiFetch<ApiResponse<Contact>>("/api/contacts", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  update: (id: string, data: Partial<ContactFormData>) =>
    apiFetch<ApiResponse<Contact>>(`/api/contacts/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  delete: (id: string) =>
    apiFetch<ApiResponse<{ deleted: boolean }>>(`/api/contacts/${id}`, {
      method: "DELETE",
    }),
};

// ============================================================================
// REQUESTS
// ============================================================================

export const requestsApi = {
  list: (filters?: { contactId?: string; status?: string; page?: number; pageSize?: number }) => {
    const query = filters ? buildQueryString(filters) : "";
    return apiFetch<PaginatedResponse<Request>>(`/api/requests${query}`);
  },

  get: (id: string) =>
    apiFetch<ApiResponse<Request>>(`/api/requests/${id}`),

  create: (data: RequestFormData) =>
    apiFetch<ApiResponse<Request>>("/api/requests", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  update: (id: string, data: Partial<RequestFormData>) =>
    apiFetch<ApiResponse<Request>>(`/api/requests/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  delete: (id: string) =>
    apiFetch<ApiResponse<{ deleted: boolean }>>(`/api/requests/${id}`, {
      method: "DELETE",
    }),
};

// ============================================================================
// MATCHES
// ============================================================================

export const matchesApi = {
  list: (filters?: { requestId?: string; propertyId?: string; status?: string; page?: number; pageSize?: number }) => {
    const query = filters ? buildQueryString(filters) : "";
    return apiFetch<PaginatedResponse<Match>>(`/api/matches${query}`);
  },

  get: (id: string) =>
    apiFetch<ApiResponse<Match>>(`/api/matches/${id}`),

  create: (data: { requestId: string; propertyId: string; score: number; aiReasoning?: string }) =>
    apiFetch<ApiResponse<Match>>("/api/matches", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  updateStatus: (id: string, status: string, notes?: string) =>
    apiFetch<ApiResponse<Match>>(`/api/matches/${id}`, {
      method: "PUT",
      body: JSON.stringify({ status, notes }),
    }),
};

// ============================================================================
// ACTIVITIES
// ============================================================================

export const activitiesApi = {
  list: (filters?: ActivityFilters) => {
    const query = filters ? buildQueryString(filters) : "";
    return apiFetch<PaginatedResponse<Activity>>(`/api/activities${query}`);
  },

  get: (id: string) =>
    apiFetch<ApiResponse<Activity>>(`/api/activities/${id}`),

  create: (data: ActivityFormData) =>
    apiFetch<ApiResponse<Activity>>("/api/activities", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  update: (id: string, data: Partial<ActivityFormData>) =>
    apiFetch<ApiResponse<Activity>>(`/api/activities/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  delete: (id: string) =>
    apiFetch<ApiResponse<{ deleted: boolean }>>(`/api/activities/${id}`, {
      method: "DELETE",
    }),
};

// ============================================================================
// BUILDINGS
// ============================================================================

export const buildingsApi = {
  list: (filters?: { city?: string; page?: number; pageSize?: number }) => {
    const query = filters ? buildQueryString(filters) : "";
    return apiFetch<PaginatedResponse<Building>>(`/api/buildings${query}`);
  },

  get: (id: string) =>
    apiFetch<ApiResponse<Building>>(`/api/buildings/${id}`),

  create: (data: any) =>
    apiFetch<ApiResponse<Building>>("/api/buildings", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  update: (id: string, data: any) =>
    apiFetch<ApiResponse<Building>>(`/api/buildings/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  delete: (id: string) =>
    apiFetch<ApiResponse<{ deleted: boolean }>>(`/api/buildings/${id}`, {
      method: "DELETE",
    }),
};

// ============================================================================
// TAGS
// ============================================================================

export const tagsApi = {
  list: () =>
    apiFetch<ApiResponse<Tag[]>>("/api/tags"),

  create: (data: { name: string; color?: string }) =>
    apiFetch<ApiResponse<Tag>>("/api/tags", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  delete: (id: string) =>
    apiFetch<ApiResponse<{ deleted: boolean }>>(`/api/tags/${id}`, {
      method: "DELETE",
    }),
};

// ============================================================================
// SETTINGS
// ============================================================================

export const settingsApi = {
  get: () =>
    apiFetch<ApiResponse<UserProfile>>("/api/settings"),

  update: (data: Partial<SettingsFormData>) =>
    apiFetch<ApiResponse<UserProfile>>("/api/settings", {
      method: "PUT",
      body: JSON.stringify(data),
    }),
};

// ============================================================================
// DASHBOARD
// ============================================================================

export const dashboardApi = {
  stats: () =>
    apiFetch<ApiResponse<DashboardStats>>("/api/dashboard/stats"),
};

// ============================================================================
// MATCHING ALGORITHM
// ============================================================================

export const matchingApi = {
  findPropertiesForClient: (clientId: string, options?: {
    minScore?: number;
    limit?: number;
    includeBreakdown?: boolean;
  }) => {
    const query = options ? buildQueryString(options) : "";
    return apiFetch<ApiResponse<any>>(`/api/matching/clients/${clientId}/properties${query}`);
  },

  findClientsForProperty: (propertyId: string, options?: {
    minScore?: number;
    limit?: number;
    includeBreakdown?: boolean;
  }) => {
    const query = options ? buildQueryString(options) : "";
    return apiFetch<ApiResponse<any>>(`/api/matching/properties/${propertyId}/clients${query}`);
  },

  calculateSpecificMatch: (propertyId: string, clientId: string, options?: {
    includeBreakdown?: boolean;
  }) => {
    const query = options ? buildQueryString(options) : "";
    return apiFetch<ApiResponse<any>>(`/api/matching/properties/${propertyId}/clients/${clientId}${query}`);
  },
};

// ============================================================================
// AI FEATURES (Placeholder - will be implemented later)
// ============================================================================

export const aiApi = {
  generateMatches: (requestId: string) =>
    apiFetch<ApiResponse<Match[]>>("/api/ai/matching", {
      method: "POST",
      body: JSON.stringify({ requestId }),
    }),

  chat: (message: string, context?: any) =>
    apiFetch<ApiResponse<{ response: string }>>("/api/ai/chat", {
      method: "POST",
      body: JSON.stringify({ message, context }),
    }),

  briefing: (date?: string) =>
    apiFetch<ApiResponse<{ briefing: string }>>("/api/ai/briefing", {
      method: "POST",
      body: JSON.stringify({ date }),
    }),
};

// ============================================================================
// EXPORT ALL
// ============================================================================

export const api = {
  health: healthApi,
  properties: propertiesApi,
  contacts: contactsApi,
  requests: requestsApi,
  matches: matchesApi,
  matching: matchingApi,
  activities: activitiesApi,
  buildings: buildingsApi,
  tags: tagsApi,
  settings: settingsApi,
  dashboard: dashboardApi,
  ai: aiApi,
};

export default api;
