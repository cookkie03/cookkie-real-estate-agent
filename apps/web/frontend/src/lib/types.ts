/**
 * TypeScript types for the CRM
 * Mirrors the Prisma schema types
 */

// User Profile
export interface UserProfile {
  id: string;
  fullName: string;
  email: string;
  phone: string | null;
  agencyName: string | null;
  agencyVat: string | null;
  agencyAddress: string | null;
  commissionPercentage: number | null;
  googleApiKey: string | null;
  openaiApiKey: string | null;
  createdAt: string;
  updatedAt: string;
}

// Contact
export interface Contact {
  id: string;
  firstName: string;
  lastName: string;
  email: string | null;
  phone: string | null;
  type: string;
  status: string;
  importance: string;
  source: string | null;
  city: string | null;
  notes: string | null;
  leadScore: number | null;
  lastContactDate: string | null;
  createdAt: string;
  updatedAt: string;
  // Relations
  ownedProperties?: Property[];
  requests?: Request[];
  activities?: Activity[];
}

// Building
export interface Building {
  id: string;
  name: string;
  street: string;
  streetNumber: string;
  city: string;
  postalCode: string | null;
  province: string | null;
  latitude: number | null;
  longitude: number | null;
  yearBuilt: number | null;
  totalFloors: number | null;
  totalUnits: number | null;
  hasElevator: boolean;
  hasParking: boolean;
  heatingType: string | null;
  energyClass: string | null;
  notes: string | null;
  lastVisitDate: string | null;
  createdAt: string;
  updatedAt: string;
  // Relations
  properties?: Property[];
}

// Property
export interface Property {
  id: string;
  code: string;
  street: string;
  streetNumber: string | null;
  city: string;
  postalCode: string | null;
  province: string | null;
  latitude: number;
  longitude: number;
  contractType: string;
  propertyType: string;
  price: number;
  squareMeters: number | null;
  rooms: number | null;
  bathrooms: number | null;
  floor: number | null;
  hasElevator: boolean;
  hasParking: boolean;
  hasGarden: boolean;
  hasBalcony: boolean;
  energyClass: string | null;
  status: string;
  description: string | null;
  internalNotes: string | null;
  images: string[];
  lastUpdatedDate: string | null;
  ownerId: string | null;
  buildingId: string | null;
  createdAt: string;
  updatedAt: string;
  // Relations
  owner?: Contact;
  building?: Building;
  matches?: Match[];
  activities?: Activity[];
  tags?: EntityTag[];
}

// Request
export interface Request {
  id: string;
  contactId: string;
  contractType: string;
  propertyType: string | null;
  minPrice: number | null;
  maxPrice: number | null;
  city: string | null;
  minSquareMeters: number | null;
  maxSquareMeters: number | null;
  minRooms: number | null;
  mustHaveElevator: boolean;
  mustHaveParking: boolean;
  mustHaveGarden: boolean;
  mustHaveBalcony: boolean;
  maxFloor: number | null;
  notes: string | null;
  status: string;
  createdAt: string;
  updatedAt: string;
  // Relations
  contact?: Contact;
  matches?: Match[];
}

// Match
export interface Match {
  id: string;
  requestId: string;
  propertyId: string;
  score: number;
  aiReasoning: string | null;
  status: string;
  contactedAt: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  // Relations
  request?: Request;
  property?: Property;
}

// Activity
export interface Activity {
  id: string;
  type: string;
  title: string;
  description: string | null;
  date: string;
  duration: number | null;
  contactId: string | null;
  propertyId: string | null;
  outcome: string | null;
  nextAction: string | null;
  createdAt: string;
  updatedAt: string;
  // Relations
  contact?: Contact;
  property?: Property;
}

// Tag
export interface Tag {
  id: string;
  name: string;
  color: string | null;
  createdAt: string;
  updatedAt: string;
}

// Entity Tag (polymorphic relation)
export interface EntityTag {
  id: string;
  tagId: string;
  entityType: string;
  entityId: string;
  createdAt: string;
  // Relations
  tag?: Tag;
}

// Audit Log
export interface AuditLog {
  id: string;
  entityType: string;
  entityId: string;
  action: string;
  changes: any;
  userId: string | null;
  createdAt: string;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data: T;
}

export interface ApiError {
  success: false;
  error: string;
  details?: any;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  };
}

// Form Types
export interface PropertyFormData {
  street: string;
  streetNumber?: string;
  city: string;
  postalCode?: string;
  province?: string;
  latitude: number;
  longitude: number;
  contractType: string;
  propertyType: string;
  price: number;
  squareMeters?: number;
  rooms?: number;
  bathrooms?: number;
  floor?: number;
  hasElevator: boolean;
  hasParking: boolean;
  hasGarden: boolean;
  hasBalcony: boolean;
  energyClass?: string;
  description?: string;
  internalNotes?: string;
  ownerId?: string;
  buildingId?: string;
}

export interface ContactFormData {
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  type: string;
  status: string;
  importance: string;
  source?: string;
  city?: string;
  notes?: string;
}

export interface RequestFormData {
  contactId: string;
  contractType: string;
  propertyType?: string;
  minPrice?: number;
  maxPrice?: number;
  city?: string;
  minSquareMeters?: number;
  maxSquareMeters?: number;
  minRooms?: number;
  mustHaveElevator: boolean;
  mustHaveParking: boolean;
  mustHaveGarden: boolean;
  mustHaveBalcony: boolean;
  maxFloor?: number;
  notes?: string;
}

export interface ActivityFormData {
  type: string;
  title: string;
  description?: string;
  date: string;
  duration?: number;
  contactId?: string;
  propertyId?: string;
  outcome?: string;
  nextAction?: string;
}

export interface SettingsFormData {
  fullName: string;
  email: string;
  phone?: string;
  agencyName?: string;
  agencyVat?: string;
  agencyAddress?: string;
  commissionPercentage?: number;
  googleApiKey?: string;
  openaiApiKey?: string;
}

// Filter Types
export interface PropertyFilters {
  city?: string;
  status?: string;
  contractType?: string;
  propertyType?: string;
  minPrice?: number;
  maxPrice?: number;
  minSquareMeters?: number;
  maxSquareMeters?: number;
  minRooms?: number;
  features?: string[];
  page?: number;
  pageSize?: number;
}

export interface ContactFilters {
  type?: string;
  status?: string;
  importance?: string;
  city?: string;
  search?: string;
  page?: number;
  pageSize?: number;
}

export interface ActivityFilters {
  type?: string;
  contactId?: string;
  propertyId?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  pageSize?: number;
}

// Dashboard Stats
export interface DashboardStats {
  properties: {
    total: number;
    available: number;
    sold: number;
    rented: number;
  };
  contacts: {
    total: number;
    active: number;
    leads: number;
  };
  requests: {
    total: number;
    active: number;
  };
  matches: {
    total: number;
    pending: number;
    contacted: number;
  };
  activities: {
    thisWeek: number;
    thisMonth: number;
  };
}
