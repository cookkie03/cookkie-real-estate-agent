/**
 * Properties API Endpoint
 * GET /api/properties - List properties with filters
 * POST /api/properties - Create new property
 */

export const dynamic = 'force-dynamic';

import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { apiResponse, apiError, getPaginationParams, generateCode } from '@/lib/utils';
import { createPropertySchema, propertyFiltersSchema } from '@/lib/validation';

/**
 * GET /api/properties
 * List properties with optional filters and pagination
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const { skip, take } = getPaginationParams(searchParams);

    // Parse filters
    const filters = propertyFiltersSchema.parse({
      city: searchParams.get('city') || undefined,
      status: searchParams.get('status') || undefined,
      contractType: searchParams.get('contractType') || undefined,
      propertyType: searchParams.get('propertyType') || undefined,
      priceMin: searchParams.get('priceMin') || undefined,
      priceMax: searchParams.get('priceMax') || undefined,
      sqmMin: searchParams.get('sqmMin') || undefined,
      sqmMax: searchParams.get('sqmMax') || undefined,
      roomsMin: searchParams.get('roomsMin') || undefined,
      bedroomsMin: searchParams.get('bedroomsMin') || undefined,
      hasElevator: searchParams.get('hasElevator') || undefined,
      hasParking: searchParams.get('hasParking') || undefined,
      hasGarden: searchParams.get('hasGarden') || undefined,
    });

    // Build where clause
    const where: any = {};

    if (filters.city) where.city = { contains: filters.city, mode: 'insensitive' };
    if (filters.status) where.status = filters.status;
    if (filters.contractType) where.contractType = filters.contractType;
    if (filters.propertyType) where.propertyType = { contains: filters.propertyType, mode: 'insensitive' };

    // Price filters
    if (filters.priceMin || filters.priceMax) {
      if (filters.contractType === 'sale') {
        where.priceSale = {
          ...(filters.priceMin && { gte: filters.priceMin }),
          ...(filters.priceMax && { lte: filters.priceMax }),
        };
      } else if (filters.contractType === 'rent') {
        where.priceRentMonthly = {
          ...(filters.priceMin && { gte: filters.priceMin }),
          ...(filters.priceMax && { lte: filters.priceMax }),
        };
      }
    }

    // Size filters
    if (filters.sqmMin || filters.sqmMax) {
      where.sqmCommercial = {
        ...(filters.sqmMin && { gte: filters.sqmMin }),
        ...(filters.sqmMax && { lte: filters.sqmMax }),
      };
    }

    if (filters.roomsMin) where.rooms = { gte: filters.roomsMin };
    if (filters.bedroomsMin) where.bedrooms = { gte: filters.bedroomsMin };

    // Boolean filters
    if (filters.hasElevator !== undefined) where.hasElevator = filters.hasElevator;
    if (filters.hasParking !== undefined) where.hasParking = filters.hasParking;
    if (filters.hasGarden !== undefined) where.hasGarden = filters.hasGarden;

    // Execute query
    const [properties, total] = await Promise.all([
      prisma.property.findMany({
        where,
        skip,
        take,
        include: {
          owner: {
            select: {
              id: true,
              code: true,
              fullName: true,
              primaryPhone: true,
              primaryEmail: true,
            },
          },
          building: {
            select: {
              id: true,
              code: true,
              street: true,
              civic: true,
              city: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.property.count({ where }),
    ]);

    return apiResponse({
      properties,
      pagination: {
        total,
        page: Math.floor(skip / take) + 1,
        limit: take,
        pages: Math.ceil(total / take),
      },
    });
  } catch (error) {
    return apiError(error as Error);
  }
}

/**
 * POST /api/properties
 * Create new property
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate input
    const data = createPropertySchema.parse(body);

    // Generate unique code
    const count = await prisma.property.count();
    const code = generateCode('PROP', count);

    // Create property
    const property = await prisma.property.create({
      data: {
        ...data,
        code,
        // Convert JSON fields if needed
        searchCities: data.searchCities ? JSON.stringify(data.searchCities) : undefined,
        searchZones: data.searchZones ? JSON.stringify(data.searchZones) : undefined,
        propertyTypes: data.propertyTypes ? JSON.stringify(data.propertyTypes) : undefined,
      } as any,
      include: {
        owner: true,
        building: true,
      },
    });

    return apiResponse(property, 201);
  } catch (error) {
    return apiError(error as Error, 400);
  }
}
