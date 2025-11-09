/**
 * CRM IMMOBILIARE - Building Detail API
 *
 * GET /api/buildings/[id] - Get building details with properties list
 *
 * @module api/buildings/[id]
 * @since v3.2.0
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const buildingId = params.id;

    // Get building with all properties
    const building = await prisma.building.findUnique({
      where: { id: buildingId },
      include: {
        properties: {
          orderBy: [
            { status: 'asc' }, // active first
            { urgencyScore: 'desc' }, // highest urgency first
          ],
          select: {
            id: true,
            code: true,
            status: true,
            visibility: true,
            propertyType: true,
            contractType: true,
            street: true,
            civic: true,
            internal: true,
            floor: true,
            sqmCommercial: true,
            rooms: true,
            bedrooms: true,
            bathrooms: true,
            priceSale: true,
            priceRentMonthly: true,
            urgencyScore: true,
            lastActivityAt: true,
            title: true,
            photosCount: true,
          },
        },
      },
    });

    if (!building) {
      return NextResponse.json({
        success: false,
        error: 'Edificio non trovato',
      }, { status: 404 });
    }

    // Format response
    const response = {
      success: true,
      building: {
        id: building.id,
        code: building.code,
        address: {
          street: building.street,
          civic: building.civic,
          city: building.city,
          province: building.province,
          zip: building.zip,
        },
        coordinates: {
          lat: building.latitude,
          lng: building.longitude,
        },
        cadastral: {
          sheet: building.cadastralSheet,
          particle: building.cadastralParticle,
          zone: building.cadastralZone,
        },
        info: {
          yearBuilt: building.yearBuilt,
          totalFloors: building.totalFloors,
          totalUnits: building.totalUnits,
          hasElevator: building.hasElevator,
          condition: building.condition,
        },
        census: {
          lastSurveyDate: building.lastSurveyDate,
          nextSurveyDue: building.nextSurveyDue,
          unitsSurveyed: building.unitsSurveyed,
          unitsInterested: building.unitsInterested,
        },
        administrator: building.administratorName ? {
          name: building.administratorName,
          phone: building.administratorPhone,
          email: building.administratorEmail,
        } : null,
        stats: {
          total: building.activeUnits + building.soldUnits,
          active: building.activeUnits,
          sold: building.soldUnits,
          avgUrgency: building.avgUrgency,
        },
        notes: building.notes,
        createdAt: building.createdAt,
        updatedAt: building.updatedAt,
      },
      properties: building.properties.map(p => ({
        id: p.id,
        code: p.code,
        status: p.status,
        visibility: p.visibility,
        type: p.propertyType,
        contractType: p.contractType,
        location: {
          street: p.street,
          civic: p.civic,
          internal: p.internal,
          floor: p.floor,
        },
        size: {
          sqm: p.sqmCommercial,
          rooms: p.rooms,
          bedrooms: p.bedrooms,
          bathrooms: p.bathrooms,
        },
        price: {
          sale: p.priceSale,
          rentMonthly: p.priceRentMonthly,
        },
        urgency: {
          score: p.urgencyScore,
          lastActivity: p.lastActivityAt,
        },
        title: p.title,
        photosCount: p.photosCount,
      })),
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('[API /api/buildings/[id]] Error:', error);
    return NextResponse.json({
      success: false,
      error: 'Errore nel caricamento dell\'edificio',
    }, { status: 500 });
  }
}
