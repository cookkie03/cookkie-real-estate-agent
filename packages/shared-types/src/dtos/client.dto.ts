/**
 * Client/Contact DTOs (Data Transfer Objects)
 * @packageDocumentation
 */

import { z } from 'zod';
import { ContactStatus } from '../enums';

/**
 * Create Contact DTO
 */
export const CreateContactDtoSchema = z.object({
  entityType: z.enum(['person', 'company']).default('person'),

  // Personal Info
  fullName: z.string().min(1, 'Full name is required'),
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

  // Fiscal Data
  taxCode: z.string().optional(),
  vatNumber: z.string().optional(),
  birthDate: z.date().optional(),
  nationality: z.string().optional(),

  // Privacy (GDPR)
  privacyFirstContact: z.boolean().default(false),
  privacyExtended: z.boolean().default(false),
  privacyMarketing: z.boolean().default(false),

  // Profiling
  source: z.string().optional(),
  leadScore: z.number().int().min(0).max(100).optional(),
  importance: z.enum(['low', 'normal', 'high', 'vip']).default('normal'),

  // Budget
  budgetMin: z.number().positive().optional(),
  budgetMax: z.number().positive().optional(),

  // Status
  status: z.nativeEnum(ContactStatus).default(ContactStatus.ACTIVE),
  notes: z.string().optional(),
});

export type CreateContactDto = z.infer<typeof CreateContactDtoSchema>;

/**
 * Update Contact DTO
 */
export const UpdateContactDtoSchema = CreateContactDtoSchema.partial();
export type UpdateContactDto = z.infer<typeof UpdateContactDtoSchema>;

/**
 * Contact Filters DTO
 */
export const ContactFiltersDtoSchema = z.object({
  status: z.nativeEnum(ContactStatus).optional(),
  importance: z.enum(['low', 'normal', 'high', 'vip']).optional(),
  source: z.string().optional(),
  city: z.string().optional(),
  leadScoreMin: z.number().int().min(0).max(100).optional(),
  hasEmail: z.boolean().optional(),
  hasPhone: z.boolean().optional(),
  search: z.string().optional(),
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(20),
  sortBy: z.enum(['createdAt', 'updatedAt', 'fullName', 'lastContactDate']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export type ContactFiltersDto = z.infer<typeof ContactFiltersDtoSchema>;

/**
 * Client Preferences DTO
 */
export const ClientPreferencesDtoSchema = z.object({
  contractType: z.enum(['sale', 'rent']),
  searchCities: z.array(z.string()).optional(),
  searchZones: z.array(z.string()).optional(),
  propertyTypes: z.array(z.string()).optional(),
  priceMin: z.number().positive().optional(),
  priceMax: z.number().positive().optional(),
  sqmMin: z.number().positive().optional(),
  sqmMax: z.number().positive().optional(),
  roomsMin: z.number().int().min(1).optional(),
  roomsMax: z.number().int().optional(),
  bedroomsMin: z.number().int().min(0).optional(),
  requiresElevator: z.boolean().default(false),
  requiresParking: z.boolean().default(false),
  requiresGarage: z.boolean().default(false),
  requiresGarden: z.boolean().default(false),
  requiresTerrace: z.boolean().default(false),
  notes: z.string().optional(),
});

export type ClientPreferencesDto = z.infer<typeof ClientPreferencesDtoSchema>;
