/**
 * CRM IMMOBILIARE - Urgency Recalculation API
 *
 * POST /api/urgency/recalculate - Recalculate urgency for all properties and buildings
 *
 * Query params:
 * - propertyId: string (optional - recalculate single property)
 * - buildingId: string (optional - recalculate all properties in building)
 *
 * @module api/urgency/recalculate
 * @since v3.2.0
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { differenceInDays } from 'date-fns';

/**
 * Calculate urgency score for a property
 *
 * Scoring algorithm:
 * - 5 (URGENT): >60 days inactive, no visits, or 3+ high-score matches
 * - 4 (WARNING): 30-60 days inactive, few visits
 * - 3 (MONITOR): Regular activity
 * - 2 (OPTIMAL): Frequent visits
 * - 1 (NEW): Recently added (<7 days)
 * - 0 (SOLD): Completed status
 */
function calculateUrgencyScore(property: {
  status: string;
  createdAt: Date;
  lastActivityAt: Date | null;
  activities: { createdAt: Date; type: string }[];
  matches: { scoreTotal: number }[];
}): number {
  const now = new Date();

  // Score 0: SOLD/RENTED/ARCHIVED
  if (['sold', 'rented', 'archived'].includes(property.status)) {
    return 0;
  }

  // Score 1: NEW (created in last 7 days)
  const daysSinceCreated = differenceInDays(now, property.createdAt);
  if (daysSinceCreated <= 7) {
    return 1;
  }

  // Calculate activity metrics
  const lastActivityDate = property.lastActivityAt || property.createdAt;
  const daysSinceLastActivity = differenceInDays(now, lastActivityDate);

  // Count visits in last 30 days
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const visitCount30d = property.activities.filter(
    a => a.activityType === 'visit' && a.createdAt >= thirtyDaysAgo
  ).length;

  // Count high-score pending matches (score >= 85)
  const highScoreMatchesPending = property.matches.filter(
    m => m.scoreTotal >= 85
  ).length;

  // Score 5: URGENT
  if (daysSinceLastActivity > 60) return 5;
  if (visitCount30d === 0 && daysSinceLastActivity > 30) return 5;
  if (highScoreMatchesPending >= 3) return 5;

  // Score 4: WARNING
  if (daysSinceLastActivity >= 30 && daysSinceLastActivity <= 60) return 4;
  if (visitCount30d === 1 && daysSinceLastActivity > 20) return 4;

  // Score 2: OPTIMAL (frequent visits)
  if (visitCount30d >= 5) return 2;

  // Score 3: MONITOR (default for active properties with some activity)
  return 3;
}

/**
 * Update building aggregate stats
 */
async function updateBuildingStats(buildingId: string) {
  const properties = await prisma.property.findMany({
    where: { buildingId },
    select: {
      status: true,
      urgencyScore: true,
    },
  });

  const activeProperties = properties.filter(
    p => !['sold', 'rented', 'archived'].includes(p.status)
  );
  const soldProperties = properties.filter(
    p => ['sold', 'rented', 'archived'].includes(p.status)
  );

  // Calculate average urgency (only for active properties)
  const urgencySum = activeProperties.reduce((sum, p) => sum + p.urgencyScore, 0);
  const avgUrgency = activeProperties.length > 0
    ? urgencySum / activeProperties.length
    : null;

  await prisma.building.update({
    where: { id: buildingId },
    data: {
      activeUnits: activeProperties.length,
      soldUnits: soldProperties.length,
      avgUrgency,
    },
  });
}

/**
 * POST /api/urgency/recalculate
 */
export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const propertyId = searchParams.get('propertyId');
    const buildingId = searchParams.get('buildingId');

    let updatedCount = 0;
    let buildingsUpdated = new Set<string>();

    // Recalculate single property
    if (propertyId) {
      const property = await prisma.property.findUnique({
        where: { id: propertyId },
        include: {
          activities: {
            select: { createdAt: true, activityType: true },
            orderBy: { createdAt: 'desc' },
          },
          matches: {
            select: { scoreTotal: true },
          },
        },
      });

      if (!property) {
        return NextResponse.json({
          success: false,
          error: 'Immobile non trovato',
        }, { status: 404 });
      }

      const urgencyScore = calculateUrgencyScore(property);

      await prisma.property.update({
        where: { id: propertyId },
        data: { urgencyScore },
      });

      updatedCount = 1;

      // Update building stats if property has a building
      if (property.buildingId) {
        await updateBuildingStats(property.buildingId);
        buildingsUpdated.add(property.buildingId);
      }

      return NextResponse.json({
        success: true,
        message: 'Urgency ricalcolata per 1 immobile',
        updated: updatedCount,
        buildingsUpdated: buildingsUpdated.size,
      });
    }

    // Recalculate all properties in a building
    if (buildingId) {
      const properties = await prisma.property.findMany({
        where: { buildingId },
        include: {
          activities: {
            select: { createdAt: true, activityType: true },
            orderBy: { createdAt: 'desc' },
          },
          matches: {
            select: { scoreTotal: true },
          },
        },
      });

      if (properties.length === 0) {
        return NextResponse.json({
          success: false,
          error: 'Nessun immobile trovato per questo edificio',
        }, { status: 404 });
      }

      for (const property of properties) {
        const urgencyScore = calculateUrgencyScore(property);
        await prisma.property.update({
          where: { id: property.id },
          data: { urgencyScore },
        });
        updatedCount++;
      }

      await updateBuildingStats(buildingId);
      buildingsUpdated.add(buildingId);

      return NextResponse.json({
        success: true,
        message: `Urgency ricalcolata per ${updatedCount} immobili`,
        updated: updatedCount,
        buildingsUpdated: buildingsUpdated.size,
      });
    }

    // Recalculate ALL properties (full recalculation)
    const allProperties = await prisma.property.findMany({
      include: {
        activities: {
          select: { createdAt: true, activityType: true },
          orderBy: { createdAt: 'desc' },
        },
        matches: {
          select: { scoreTotal: true },
        },
      },
    });

    console.log(`[Urgency Recalc] Processing ${allProperties.length} properties...`);

    for (const property of allProperties) {
      const urgencyScore = calculateUrgencyScore(property);

      await prisma.property.update({
        where: { id: property.id },
        data: { urgencyScore },
      });

      updatedCount++;

      if (property.buildingId) {
        buildingsUpdated.add(property.buildingId);
      }
    }

    // Update all buildings
    console.log(`[Urgency Recalc] Updating ${buildingsUpdated.size} buildings...`);

    for (const bldgId of buildingsUpdated) {
      await updateBuildingStats(bldgId);
    }

    console.log(`[Urgency Recalc] Complete! Updated ${updatedCount} properties, ${buildingsUpdated.size} buildings`);

    return NextResponse.json({
      success: true,
      message: `Urgency ricalcolata per tutti gli immobili`,
      updated: updatedCount,
      buildingsUpdated: buildingsUpdated.size,
    });

  } catch (error) {
    console.error('[API /api/urgency/recalculate] Error:', error);
    return NextResponse.json({
      success: false,
      error: 'Errore nel ricalcolo urgency',
    }, { status: 500 });
  }
}
