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
 * - city: Filter by city
 * - minUrgency: Minimum urgency score (0-5)
 *
 * @module api/buildings/geo
 * @since v3.2.0
 */

import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    // Parse filters
    const bbox = searchParams.get('bbox');
    const city = searchParams.get('city');
    const minUrgency = searchParams.get('minUrgency');

    // Build where clause
    const where: any = {};

    // Bounding box filter (for viewport)
    if (bbox) {
      const [minLat, minLng, maxLat, maxLng] = bbox.split(',').map(Number);
      where.latitude = { gte: minLat, lte: maxLat };
      where.longitude = { gte: minLng, lte: maxLng };
    }

    // City filter
    if (city) {
      where.city = city;
    }

    // Urgency filter
    if (minUrgency) {
      where.avgUrgency = { gte: Number(minUrgency) };
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
