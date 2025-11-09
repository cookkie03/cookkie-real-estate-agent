/**
 * CRM IMMOBILIARE - Zones API
 *
 * GET /api/zones - Get hierarchical zone statistics
 *
 * Query params:
 * - level: 'multi' | 'comune' | 'zone' (default: 'multi')
 * - comune: string (filter by comune, for zone level)
 * - cadastralZone: string (filter by zone, for building level)
 *
 * @module api/zones
 * @since v3.2.0
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

interface ZoneStats {
  totalBuildings: number;
  totalProperties: number;
  activeProperties: number;
  soldProperties: number;
  avgUrgency: number;
  urgencyDistribution: Record<number, number>;
}

interface Building {
  activeUnits: number;
  soldUnits: number;
  avgUrgency: number | null;
}

/**
 * Calculate stats from buildings array
 */
function calculateStats(buildings: Building[]): ZoneStats {
  let totalProperties = 0;
  let activeProperties = 0;
  let soldProperties = 0;
  let urgencySum = 0;
  let urgencyCount = 0;
  const urgencyDistribution: Record<number, number> = {};

  for (const building of buildings) {
    totalProperties += building.activeUnits + building.soldUnits;
    activeProperties += building.activeUnits;
    soldProperties += building.soldUnits;

    if (building.avgUrgency != null && building.activeUnits > 0) {
      urgencySum += building.avgUrgency * building.activeUnits;
      urgencyCount += building.activeUnits;

      const urgency = Math.round(building.avgUrgency);
      urgencyDistribution[urgency] = (urgencyDistribution[urgency] || 0) + 1;
    }
  }

  return {
    totalBuildings: buildings.length,
    totalProperties,
    activeProperties,
    soldProperties,
    avgUrgency: urgencyCount > 0 ? urgencySum / urgencyCount : 0,
    urgencyDistribution,
  };
}

/**
 * GET /api/zones
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const level = searchParams.get('level') || 'multi';
    const comune = searchParams.get('comune');
    const cadastralZone = searchParams.get('cadastralZone');

    // Get all buildings
    const buildings = await prisma.building.findMany({
      select: {
        id: true,
        code: true,
        street: true,
        civic: true,
        city: true,
        province: true,
        cadastralZone: true,
        latitude: true,
        longitude: true,
        activeUnits: true,
        soldUnits: true,
        avgUrgency: true,
      },
    });

    // LEVEL 1: Multi-Comune (Global stats + list of comuni)
    if (level === 'multi') {
      const comuniMap = new Map<string, Building[]>();

      for (const building of buildings) {
        const city = building.city || 'Sconosciuto';
        if (!comuniMap.has(city)) {
          comuniMap.set(city, []);
        }
        comuniMap.get(city)!.push(building);
      }

      const comuni = Array.from(comuniMap.entries())
        .map(([city, cityBuildings]) => ({
          comune: city,
          ...calculateStats(cityBuildings),
        }))
        .sort((a, b) => a.comune.localeCompare(b.comune));

      const globalStats = calculateStats(buildings);

      return NextResponse.json({
        success: true,
        level: 'multi',
        stats: globalStats,
        comuni,
      });
    }

    // LEVEL 2: Singolo Comune (Comune stats + list of zones)
    if (level === 'comune' && comune) {
      const comuneBuildings = buildings.filter(b => b.city === comune);

      if (comuneBuildings.length === 0) {
        return NextResponse.json({
          success: false,
          error: `Nessun edificio trovato per ${comune}`,
        }, { status: 404 });
      }

      const zonesMap = new Map<string, Building[]>();

      for (const building of comuneBuildings) {
        const zone = building.cadastralZone || 'Non classificata';
        if (!zonesMap.has(zone)) {
          zonesMap.set(zone, []);
        }
        zonesMap.get(zone)!.push(building);
      }

      const zones = Array.from(zonesMap.entries())
        .map(([zone, zoneBuildings]) => ({
          zone,
          ...calculateStats(zoneBuildings),
        }))
        .sort((a, b) => a.zone.localeCompare(b.zone));

      const comuneStats = calculateStats(comuneBuildings);

      return NextResponse.json({
        success: true,
        level: 'comune',
        comune,
        stats: comuneStats,
        zones,
      });
    }

    // LEVEL 3: Zona Catastale (Zone stats + list of buildings)
    if (level === 'zone' && comune && cadastralZone) {
      const zoneBuildings = buildings.filter(
        b => b.city === comune && (b.cadastralZone || 'Non classificata') === cadastralZone
      );

      if (zoneBuildings.length === 0) {
        return NextResponse.json({
          success: false,
          error: `Nessun edificio trovato per ${comune} - Zona ${cadastralZone}`,
        }, { status: 404 });
      }

      const buildingsData = zoneBuildings.map(b => ({
        id: b.id,
        code: b.code,
        address: `${b.street} ${b.civic}`,
        city: b.city,
        cadastralZone: b.cadastralZone,
        coordinates: {
          lat: b.latitude,
          lng: b.longitude,
        },
        stats: {
          total: b.activeUnits + b.soldUnits,
          active: b.activeUnits,
          avgUrgency: b.avgUrgency || 0,
        },
      }));

      const zoneStats = calculateStats(zoneBuildings);

      return NextResponse.json({
        success: true,
        level: 'zone',
        comune,
        cadastralZone,
        stats: zoneStats,
        buildings: buildingsData,
      });
    }

    // Invalid request
    return NextResponse.json({
      success: false,
      error: 'Parametri non validi. Specificare level e filtri appropriati.',
    }, { status: 400 });

  } catch (error) {
    console.error('[API /api/zones] Error:', error);
    return NextResponse.json({
      success: false,
      error: 'Errore nel caricamento delle zone',
    }, { status: 500 });
  }
}
