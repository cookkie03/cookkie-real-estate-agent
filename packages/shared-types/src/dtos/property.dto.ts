/**
 * Property DTOs (Data Transfer Objects)
 * @packageDocumentation
 */

import { z } from 'zod';
import { PropertyStatus } from '../enums';

/**
 * Create Property DTO
 */
export const CreatePropertyDtoSchema = z.object({
  ownerContactId: z.string().optional(),
  buildingId: z.string().optional(),
  status: z.nativeEnum(PropertyStatus).default(PropertyStatus.DRAFT),

  // Address
  street: z.string().min(1, 'Street is required'),
  civic: z.string().optional(),
  internal: z.string().optional(),
  floor: z.string().optional(),
  city: z.string().min(1, 'City is required'),
  province: z.string().min(1, 'Province is required'),
  zone: z.string().optional(),
  zip: z.string().optional(),
  latitude: z.number(),
  longitude: z.number(),

  // Type
  contractType: z.enum(['sale', 'rent']),
  propertyType: z.string().min(1, 'Property type is required'),
  propertyCategory: z.string().optional(),

  // Dimensions
  sqmCommercial: z.number().positive().optional(),
  sqmLivable: z.number().positive().optional(),
  rooms: z.number().int().min(1).optional(),
  bedrooms: z.number().int().min(0).optional(),
  bathrooms: z.number().int().min(0).optional(),

  // Features
  hasElevator: z.boolean().default(false),
  hasParking: z.boolean().default(false),
  hasGarage: z.boolean().default(false),
  hasGarden: z.boolean().default(false),
  hasTerrace: z.boolean().default(false),
  hasBalcony: z.boolean().default(false),
  hasCellar: z.boolean().default(false),
  hasAttic: z.boolean().default(false),
  hasSwimmingPool: z.boolean().default(false),
  hasFireplace: z.boolean().default(false),
  hasAlarm: z.boolean().default(false),
  hasAirConditioning: z.boolean().default(false),

  // Prices
  priceSale: z.number().positive().optional(),
  priceRentMonthly: z.number().positive().optional(),
  priceMinAcceptable: z.number().positive().optional(),
  condominiumFees: z.number().min(0).optional(),

  // Marketing
  title: z.string().optional(),
  description: z.string().optional(),

  // Notes
  notes: z.string().optional(),
  internalNotes: z.string().optional(),
});

export type CreatePropertyDto = z.infer<typeof CreatePropertyDtoSchema>;

/**
 * Update Property DTO
 */
export const UpdatePropertyDtoSchema = CreatePropertyDtoSchema.partial();
export type UpdatePropertyDto = z.infer<typeof UpdatePropertyDtoSchema>;

/**
 * Property Filters DTO
 */
export const PropertyFiltersDtoSchema = z.object({
  status: z.nativeEnum(PropertyStatus).optional(),
  contractType: z.enum(['sale', 'rent']).optional(),
  propertyType: z.string().optional(),
  city: z.string().optional(),
  zone: z.string().optional(),
  priceMin: z.number().optional(),
  priceMax: z.number().optional(),
  sqmMin: z.number().optional(),
  sqmMax: z.number().optional(),
  roomsMin: z.number().optional(),
  roomsMax: z.number().optional(),
  bedroomsMin: z.number().optional(),
  hasElevator: z.boolean().optional(),
  hasParking: z.boolean().optional(),
  hasGarage: z.boolean().optional(),
  urgencyScoreMin: z.number().min(0).max(5).optional(),
  search: z.string().optional(),
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(20),
  sortBy: z.enum(['createdAt', 'updatedAt', 'price', 'urgency']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export type PropertyFiltersDto = z.infer<typeof PropertyFiltersDtoSchema>;
