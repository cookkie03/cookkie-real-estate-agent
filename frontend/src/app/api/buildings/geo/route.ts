/**
 * CRM IMMOBILIARE - Buildings Geo API
 *
 * Returns building coordinates and metadata for map visualization.
 * Optimized for performance with minimal data transfer.
 *
 * GET /api/buildings/geo
 *
 * Query params:
 * - bbox: Bounding box filter (minLat,minLng,maxLat,maxLng)
 * - city: Filter by city (single)
 * - comuni: Filter by multiple cities (comma-separated)
 * - minUrgency: Minimum urgency score (0-5)
 * - propertyTypes: Filter by property types (comma-separated)
 * - contractType: Filter by contract type (sale, rent)
 * - priceMin: Minimum price
 * - priceMax: Maximum price
 * - roomsMin: Minimum rooms
 * - roomsMax: Maximum rooms
 *
 * @module api/buildings/geo
 * @since v3.2.0
 */

import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    // Parse filters
    const bbox = searchParams.get('bbox');
    const city = searchParams.get('city');
    const comuni = searchParams.get('comuni');
    const minUrgency = searchParams.get('minUrgency');
    const propertyTypes = searchParams.get('propertyTypes');
    const contractType = searchParams.get('contractType');
    const priceMin = searchParams.get('priceMin');
    const priceMax = searchParams.get('priceMax');
    const roomsMin = searchParams.get('roomsMin');
    const roomsMax = searchParams.get('roomsMax');

    // Build where clause for buildings
    const where: any = {};

    // Bounding box filter (for viewport)
    if (bbox) {
      const [minLat, minLng, maxLat, maxLng] = bbox.split(',').map(Number);
      where.latitude = { gte: minLat, lte: maxLat };
      where.longitude = { gte: minLng, lte: maxLng };
    }

    // City filters
    if (city) {
      where.city = city;
    } else if (comuni) {
      where.city = { in: comuni.split(',') };
    }

    // Urgency filter
    if (minUrgency) {
      where.avgUrgency = { gte: Number(minUrgency) };
    }

    // Property filters (applied to properties within buildings)
    const propertyWhere: any = {
      status: { in: ['draft', 'available', 'option'] } // Only active properties
    };

    if (propertyTypes) {
      propertyWhere.propertyType = { in: propertyTypes.split(',') };
    }

    if (contractType) {
      propertyWhere.contractType = contractType;
    }

    if (priceMin || priceMax) {
      const priceField = contractType === 'rent' ? 'priceRentMonthly' : 'priceSale';
      if (priceMin) {
        propertyWhere[priceField] = { gte: Number(priceMin) };
      }
      if (priceMax) {
        propertyWhere[priceField] = {
          ...propertyWhere[priceField],
          lte: Number(priceMax)
        };
      }
    }

    if (roomsMin) {
      propertyWhere.rooms = { gte: Number(roomsMin) };
    }
    if (roomsMax) {
      propertyWhere.rooms = {
        ...propertyWhere.rooms,
        lte: Number(roomsMax)
      };
    }

    // If property filters are applied, filter buildings that have matching properties
    const hasPropertyFilters = propertyTypes || contractType || priceMin || priceMax || roomsMin || roomsMax;
    if (hasPropertyFilters) {
      where.properties = {
        some: propertyWhere
      };
    }

    // Fetch buildings with minimal fields for performance
    const buildings = await prisma.building.findMany({
      where,
      select: {
        id: true,
        code: true,
        street: true,
        civic: true,
        city: true,
        province: true,
        zip: true,
        latitude: true,
        longitude: true,
        cadastralZone: true,
        totalUnits: true,
        activeUnits: true,
        soldUnits: true,
        avgUrgency: true,
        _count: {
          select: {
            properties: true
          }
        }
      },
      orderBy: {
        avgUrgency: 'desc' // Prioritize urgent buildings
      },
      take: 500 // Limit to 500 buildings for performance
    });

    // Transform data for map
    const geoData = buildings.map(building => ({
      id: building.id,
      code: building.code,
      address: `${building.street} ${building.civic}`,
      city: building.city,
      province: building.province,
      zip: building.zip,
      coordinates: {
        lat: building.latitude,
        lng: building.longitude
      },
      cadastralZone: building.cadastralZone,
      stats: {
        total: building.totalUnits || building._count.properties,
        active: building.activeUnits,
        sold: building.soldUnits,
        avgUrgency: building.avgUrgency || 0
      }
    }));

    return NextResponse.json({
      success: true,
      count: geoData.length,
      buildings: geoData
    });

  } catch (error) {
    console.error('[API] Buildings Geo error:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch buildings geo data',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
