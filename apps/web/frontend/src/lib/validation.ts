/**
 * Validation Schemas - Zod
 * Centralized validation for API requests
 */

import { z } from 'zod';

// ============================================================================
// COMMON SCHEMAS
// ============================================================================

export const idSchema = z.object({
  id: z.string().cuid(),
});

export const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
});

// ============================================================================
// PROPERTY SCHEMAS
// ============================================================================

export const createPropertySchema = z.object({
  // Required
  street: z.string().min(1),
  city: z.string().min(1),
  province: z.string().min(2).max(2),
  latitude: z.number(),
  longitude: z.number(),
  contractType: z.enum(['sale', 'rent']),
  propertyType: z.string().min(1),
  source: z.string().default('direct_mandate'),

  // Optional
  ownerContactId: z.string().cuid().optional(),
  buildingId: z.string().cuid().optional(),
  civic: z.string().optional(),
  internal: z.string().optional(),
  floor: z.string().optional(),
  zone: z.string().optional(),
  zip: z.string().optional(),
  status: z.enum(['draft', 'available', 'option', 'sold', 'rented', 'suspended', 'archived']).default('draft'),

  // Dimensions
  sqmCommercial: z.number().positive().optional(),
  sqmLivable: z.number().positive().optional(),
  rooms: z.number().int().positive().optional(),
  bedrooms: z.number().int().positive().optional(),
  bathrooms: z.number().int().positive().optional(),

  // Features
  hasElevator: z.boolean().default(false),
  hasParking: z.boolean().default(false),
  hasGarage: z.boolean().default(false),
  hasGarden: z.boolean().default(false),
  hasTerrace: z.boolean().default(false),

  // Characteristics
  condition: z.string().optional(),
  heatingType: z.string().optional(),
  energyClass: z.string().optional(),
  yearBuilt: z.number().int().min(1800).max(2100).optional(),

  // Prices
  priceSale: z.number().positive().optional(),
  priceRentMonthly: z.number().positive().optional(),
  priceMinAcceptable: z.number().positive().optional(),

  // Marketing
  title: z.string().optional(),
  description: z.string().optional(),
  notes: z.string().optional(),
  internalNotes: z.string().optional(),
});

export const updatePropertySchema = createPropertySchema.partial();

export const propertyFiltersSchema = z.object({
  city: z.string().optional(),
  status: z.string().optional(),
  contractType: z.enum(['sale', 'rent']).optional(),
  propertyType: z.string().optional(),
  priceMin: z.coerce.number().optional(),
  priceMax: z.coerce.number().optional(),
  sqmMin: z.coerce.number().optional(),
  sqmMax: z.coerce.number().optional(),
  roomsMin: z.coerce.number().int().optional(),
  bedroomsMin: z.coerce.number().int().optional(),
  hasElevator: z.coerce.boolean().optional(),
  hasParking: z.coerce.boolean().optional(),
  hasGarden: z.coerce.boolean().optional(),
});

// ============================================================================
// CONTACT SCHEMAS
// ============================================================================

export const createContactSchema = z.object({
  // Required
  fullName: z.string().min(1),

  // Optional
  entityType: z.enum(['person', 'company']).default('person'),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  companyName: z.string().optional(),

  // Contact Info
  primaryPhone: z.string().optional(),
  secondaryPhone: z.string().optional(),
  primaryEmail: z.string().email().optional(),
  secondaryEmail: z.string().email().optional(),

  // Address
  street: z.string().optional(),
  civic: z.string().optional(),
  city: z.string().optional(),
  province: z.string().optional(),
  zip: z.string().optional(),
  country: z.string().default('Italia'),
  latitude: z.number().optional(),
  longitude: z.number().optional(),

  // Fiscal
  taxCode: z.string().optional(),
  vatNumber: z.string().optional(),
  birthDate: z.string().datetime().optional(),
  nationality: z.string().optional(),

  // Privacy
  privacyFirstContact: z.boolean().default(false),
  privacyExtended: z.boolean().default(false),
  privacyMarketing: z.boolean().default(false),

  // Profiling
  source: z.string().optional(),
  leadScore: z.number().int().min(0).max(100).optional(),
  importance: z.enum(['low', 'normal', 'high', 'vip']).default('normal'),
  budgetMin: z.number().optional(),
  budgetMax: z.number().optional(),
  status: z.enum(['active', 'inactive', 'archived', 'blacklist']).default('active'),
  notes: z.string().optional(),
});

export const updateContactSchema = createContactSchema.partial();

export const contactFiltersSchema = z.object({
  status: z.string().optional(),
  importance: z.string().optional(),
  city: z.string().optional(),
  source: z.string().optional(),
  entityType: z.enum(['person', 'company']).optional(),
});

// ============================================================================
// REQUEST SCHEMAS
// ============================================================================

export const createRequestSchema = z.object({
  // Required
  contactId: z.string().cuid(),

  // Optional
  requestType: z.enum(['search_buy', 'search_rent', 'valuation']).default('search_buy'),
  status: z.enum(['active', 'paused', 'satisfied', 'cancelled']).default('active'),
  urgency: z.enum(['low', 'medium', 'high']).default('medium'),

  // Search Criteria
  contractType: z.enum(['sale', 'rent']).optional(),
  searchCities: z.array(z.string()).optional(),
  searchZones: z.array(z.string()).optional(),
  propertyTypes: z.array(z.string()).optional(),

  // Budget
  priceMin: z.number().optional(),
  priceMax: z.number().optional(),

  // Size
  sqmMin: z.number().optional(),
  sqmMax: z.number().optional(),
  roomsMin: z.number().int().optional(),
  roomsMax: z.number().int().optional(),
  bedroomsMin: z.number().int().optional(),
  bedroomsMax: z.number().int().optional(),
  bathroomsMin: z.number().int().optional(),

  // Features
  requiresElevator: z.boolean().default(false),
  requiresParking: z.boolean().default(false),
  requiresGarage: z.boolean().default(false),
  requiresGarden: z.boolean().default(false),

  // Exclusions
  excludeGroundFloor: z.boolean().default(false),
  excludeTopFloorNoElevator: z.boolean().default(false),

  // Quality
  minCondition: z.string().optional(),
  minEnergyClass: z.string().optional(),

  notes: z.string().optional(),
});

export const updateRequestSchema = createRequestSchema.partial();

// ============================================================================
// MATCH SCHEMAS
// ============================================================================

export const createMatchSchema = z.object({
  requestId: z.string().cuid(),
  propertyId: z.string().cuid(),
  scoreTotal: z.number().int().min(0).max(100),
  scoreLocation: z.number().int().min(0).max(100).optional(),
  scorePrice: z.number().int().min(0).max(100).optional(),
  scoreSize: z.number().int().min(0).max(100).optional(),
  scoreFeatures: z.number().int().min(0).max(100).optional(),
  aiReasoning: z.string().optional(),
  agentNotes: z.string().optional(),
});

export const updateMatchSchema = z.object({
  status: z.enum(['suggested', 'sent', 'viewed', 'visited', 'interested', 'rejected', 'closed']).optional(),
  clientReaction: z.string().optional(),
  rejectionReason: z.string().optional(),
  clientNotes: z.string().optional(),
  agentNotes: z.string().optional(),
});

// ============================================================================
// ACTIVITY SCHEMAS
// ============================================================================

export const createActivitySchema = z.object({
  // Required
  title: z.string().min(1),
  activityType: z.string().min(1),

  // Optional Relations
  contactId: z.string().cuid().optional(),
  propertyId: z.string().cuid().optional(),
  requestId: z.string().cuid().optional(),
  buildingId: z.string().cuid().optional(),

  // Optional
  status: z.enum(['scheduled', 'completed', 'cancelled', 'missed']).default('scheduled'),
  priority: z.enum(['low', 'normal', 'high', 'urgent']).default('normal'),
  scheduledAt: z.string().datetime().optional(),
  dueDate: z.string().datetime().optional(),
  duration: z.number().int().positive().optional(),
  description: z.string().optional(),
  outcome: z.string().optional(),
  locationAddress: z.string().optional(),
  locationCity: z.string().optional(),
  notes: z.string().optional(),
});

export const updateActivitySchema = createActivitySchema.partial();

// ============================================================================
// SETTINGS SCHEMAS
// ============================================================================

export const updateSettingsSchema = z.object({
  googleApiKey: z.string().optional(),
  smtpHost: z.string().optional(),
  smtpPort: z.coerce.number().int().positive().optional(),
  smtpUser: z.string().optional(),
  smtpPassword: z.string().optional(),
  corsOrigins: z.string().optional(),
});
