/**
 * Properties API Endpoint - REFACTORED WITH SERVICE LAYER
 * GET /api/properties - List properties with filters
 * POST /api/properties - Create new property
 */

export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getPaginationParams, generateCode } from '@/lib/utils';
import { PropertyService } from '@/services';
import { ServiceError } from '@/services/base/ServiceError';
import { Prisma } from '@prisma/client';

const propertyService = new PropertyService(prisma);

/**
 * GET /api/properties
 * List properties with optional filters and pagination
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const { skip, take } = getPaginationParams(searchParams);

    // Parse filters from query params
    const filters = {
      status: searchParams.get('status') || undefined,
      contractType: searchParams.get('contractType') || undefined,
      city: searchParams.get('city') || undefined,
      propertyType: searchParams.get('propertyType') || undefined,
      priceMin: searchParams.get('priceMin') ? Number(searchParams.get('priceMin')) : undefined,
      priceMax: searchParams.get('priceMax') ? Number(searchParams.get('priceMax')) : undefined,
      sqmMin: searchParams.get('sqmMin') ? Number(searchParams.get('sqmMin')) : undefined,
      sqmMax: searchParams.get('sqmMax') ? Number(searchParams.get('sqmMax')) : undefined,
      roomsMin: searchParams.get('roomsMin') ? Number(searchParams.get('roomsMin')) : undefined,
      roomsMax: searchParams.get('roomsMax') ? Number(searchParams.get('roomsMax')) : undefined,
      bedroomsMin: searchParams.get('bedroomsMin') ? Number(searchParams.get('bedroomsMin')) : undefined,
      hasElevator: searchParams.get('hasElevator') === 'true',
      hasParking: searchParams.get('hasParking') === 'true',
      hasGarden: searchParams.get('hasGarden') === 'true',
    };

    // Build Prisma where clause
    const where: Prisma.PropertyWhereInput = {};

    if (filters.status) where.status = filters.status;
    if (filters.contractType) where.contractType = filters.contractType;
    if (filters.city) where.city = { contains: filters.city, mode: 'insensitive' };
    if (filters.propertyType) where.propertyType = { contains: filters.propertyType, mode: 'insensitive' };

    // Price filters (handle sale vs rent)
    if (filters.priceMin !== undefined || filters.priceMax !== undefined) {
      if (filters.contractType === 'sale') {
        where.priceSale = {};
        if (filters.priceMin) where.priceSale.gte = filters.priceMin;
        if (filters.priceMax) where.priceSale.lte = filters.priceMax;
      } else if (filters.contractType === 'rent') {
        where.priceRentMonthly = {};
        if (filters.priceMin) where.priceRentMonthly.gte = filters.priceMin;
        if (filters.priceMax) where.priceRentMonthly.lte = filters.priceMax;
      }
    }

    // Size filters
    if (filters.sqmMin !== undefined || filters.sqmMax !== undefined) {
      where.sqmCommercial = {};
      if (filters.sqmMin) where.sqmCommercial.gte = filters.sqmMin;
      if (filters.sqmMax) where.sqmCommercial.lte = filters.sqmMax;
    }

    // Rooms filters
    if (filters.roomsMin !== undefined || filters.roomsMax !== undefined) {
      where.rooms = {};
      if (filters.roomsMin) where.rooms.gte = filters.roomsMin;
      if (filters.roomsMax) where.rooms.lte = filters.roomsMax;
    }

    if (filters.bedroomsMin) {
      where.bedrooms = { gte: filters.bedroomsMin };
    }

    // Boolean filters
    if (searchParams.has('hasElevator')) where.hasElevator = filters.hasElevator;
    if (searchParams.has('hasParking')) where.hasParking = filters.hasParking;
    if (searchParams.has('hasGarden')) where.hasGarden = filters.hasGarden;

    // Use service layer to fetch with includes
    const [properties, total] = await Promise.all([
      propertyService.findMany(where, {
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
      propertyService.count(where),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        properties,
        pagination: {
          total,
          page: Math.floor(skip / take) + 1,
          limit: take,
          pages: Math.ceil(total / take),
        },
      },
    });

  } catch (error) {
    console.error('[API] Properties GET error:', error);

    if (error instanceof ServiceError) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: error.statusCode }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/properties
 * Create new property
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Generate unique code
    const count = await prisma.property.count();
    const code = generateCode('PROP', count);

    // Add code to data
    const propertyData = {
      ...body,
      code,
    };

    // Use service layer (includes validation)
    const property = await propertyService.create(propertyData);

    return NextResponse.json({
      success: true,
      data: property,
    }, { status: 201 });

  } catch (error) {
    console.error('[API] Properties POST error:', error);

    if (error instanceof ServiceError) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: error.statusCode }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
