/**
 * CRM IMMOBILIARE - Urgency Calculation Script
 *
 * Calculates urgency score for all properties based on:
 * - Days since last activity
 * - Visit count (last 30 days)
 * - Active match count and scores
 * - Property status
 * - Days on market
 *
 * Urgency Levels:
 * - 5 (🔴 URGENT):    >60 days inactive, no visits, high-score matches not proposed
 * - 4 (🟠 WARNING):   30-60 days inactive, few visits, missing documents
 * - 3 (🟡 MONITOR):   <30 days inactive, regular visits, negotiations ongoing
 * - 2 (🟢 OPTIMAL):   Frequent visits, offers received, high demand
 * - 1 (🔵 NEW):       Recently added (<7 days), awaiting setup
 * - 0 (⚫ SOLD):      Sold, rented, or archived
 *
 * Usage:
 *   npx tsx scripts/calculate-urgency.ts
 *
 * @module scripts/calculate-urgency
 * @since v3.2.0
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface PropertyWithData {
  id: string;
  code: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
  activities: Array<{
    completedAt: Date | null;
    activityType: string;
  }>;
  matches: Array<{
    scoreTotal: number;
    status: string;
  }>;
}

/**
 * Calculate days between two dates
 */
function daysBetween(date1: Date, date2: Date): number {
  const diffTime = Math.abs(date2.getTime() - date1.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Calculate urgency score for a property
 */
function calculateUrgencyScore(property: PropertyWithData): number {
  const now = new Date();

  // 0 (SOLD): Property is sold, rented, or archived
  if (['sold', 'rented', 'archived'].includes(property.status)) {
    return 0;
  }

  // Calculate days since creation
  const daysSinceCreated = daysBetween(property.createdAt, now);

  // 1 (NEW): Recently added (<7 days)
  if (daysSinceCreated <= 7) {
    return 1;
  }

  // Calculate last activity
  const completedActivities = property.activities
    .filter(a => a.completedAt !== null)
    .sort((a, b) => b.completedAt!.getTime() - a.completedAt!.getTime());

  const lastActivityDate = completedActivities.length > 0
    ? completedActivities[0].completedAt!
    : property.createdAt;

  const daysSinceLastActivity = daysBetween(lastActivityDate, now);

  // Count visits in last 30 days
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const visitCount30d = property.activities.filter(a =>
    a.activityType === 'visit' &&
    a.completedAt &&
    a.completedAt >= thirtyDaysAgo
  ).length;

  // Count high-score matches not yet sent
  const highScoreMatchesPending = property.matches.filter(m =>
    m.scoreTotal >= 85 &&
    m.status === 'suggested'
  ).length;

  const goodScoreMatchesPending = property.matches.filter(m =>
    m.scoreTotal >= 70 &&
    m.scoreTotal < 85 &&
    m.status === 'suggested'
  ).length;

  // 5 (URGENT): Critical attention needed
  if (daysSinceLastActivity > 60) return 5;
  if (visitCount30d === 0 && daysSinceLastActivity > 30) return 5;
  if (highScoreMatchesPending >= 3) return 5;

  // 4 (WARNING): Needs attention soon
  if (daysSinceLastActivity >= 30 && daysSinceLastActivity <= 60) return 4;
  if (visitCount30d <= 2 && daysSinceLastActivity > 15) return 4;
  if (goodScoreMatchesPending >= 2) return 4;

  // 3 (MONITOR): Under control but watch closely
  if (visitCount30d >= 3 && visitCount30d < 5) return 3;
  if (property.status === 'option') return 3; // Negotiating

  // 2 (OPTIMAL): Everything going well
  if (visitCount30d >= 5) return 2;
  if (property.matches.some(m => m.status === 'interested')) return 2;

  // Default: 3 (MONITOR)
  return 3;
}

/**
 * Update property urgency scores
 */
async function updatePropertyUrgency(): Promise<{ updated: number; distribution: Record<number, number> }> {
  console.log('📊 Calculating urgency scores for all properties...');

  // Fetch all properties with related data
  const properties = await prisma.property.findMany({
    include: {
      activities: {
        where: {
          status: 'completed'
        },
        select: {
          completedAt: true,
          activityType: true
        },
        orderBy: {
          completedAt: 'desc'
        }
      },
      matches: {
        select: {
          scoreTotal: true,
          status: true
        }
      }
    }
  });

  console.log(`   Found ${properties.length} properties`);

  const distribution: Record<number, number> = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  let updatedCount = 0;

  for (const property of properties) {
    const urgencyScore = calculateUrgencyScore(property as any);

    // Calculate lastActivityAt
    const completedActivities = property.activities
      .filter(a => a.completedAt !== null)
      .sort((a, b) => b.completedAt!.getTime() - a.completedAt!.getTime());

    const lastActivityAt = completedActivities.length > 0
      ? completedActivities[0].completedAt
      : null;

    // Update property
    await prisma.property.update({
      where: { id: property.id },
      data: {
        urgencyScore,
        lastActivityAt
      }
    });

    distribution[urgencyScore]++;
    updatedCount++;
  }

  return { updated: updatedCount, distribution };
}

/**
 * Update building average urgency
 */
async function updateBuildingAvgUrgency(): Promise<number> {
  console.log('🏢 Updating building average urgency...');

  const buildings = await prisma.building.findMany({
    include: {
      properties: {
        where: {
          status: {
            notIn: ['sold', 'rented', 'archived']
          }
        },
        select: {
          urgencyScore: true
        }
      }
    }
  });

  console.log(`   Found ${buildings.length} buildings`);

  let updatedCount = 0;

  for (const building of buildings) {
    const activeProperties = building.properties;

    if (activeProperties.length === 0) {
      // No active properties, set urgency to 0
      await prisma.building.update({
        where: { id: building.id },
        data: { avgUrgency: 0 }
      });
    } else {
      // Calculate average
      const sum = activeProperties.reduce((acc, p) => acc + (p.urgencyScore || 0), 0);
      const avg = sum / activeProperties.length;

      await prisma.building.update({
        where: { id: building.id },
        data: { avgUrgency: Math.round(avg * 100) / 100 }
      });
    }

    updatedCount++;
  }

  return updatedCount;
}

/**
 * Main urgency calculation process
 */
async function main() {
  console.log('🚨 CRM Immobiliare - Urgency Calculation Script\n');

  try {
    const startTime = Date.now();

    // Step 1: Calculate property urgency
    const propertyResult = await updatePropertyUrgency();

    console.log();

    // Step 2: Calculate building average urgency
    const buildingsUpdated = await updateBuildingAvgUrgency();

    console.log();

    // Summary
    console.log('━'.repeat(60));
    console.log('📊 URGENCY CALCULATION SUMMARY');
    console.log('━'.repeat(60));
    console.log(`📦 Properties updated:      ${propertyResult.updated}`);
    console.log(`🏢 Buildings updated:       ${buildingsUpdated}`);
    console.log('');
    console.log('📈 Urgency Distribution:');
    console.log(`   🔴 URGENT (5):           ${propertyResult.distribution[5]}`);
    console.log(`   🟠 WARNING (4):          ${propertyResult.distribution[4]}`);
    console.log(`   🟡 MONITOR (3):          ${propertyResult.distribution[3]}`);
    console.log(`   🟢 OPTIMAL (2):          ${propertyResult.distribution[2]}`);
    console.log(`   🔵 NEW (1):              ${propertyResult.distribution[1]}`);
    console.log(`   ⚫ SOLD (0):             ${propertyResult.distribution[0]}`);
    console.log('');
    console.log(`⏱️  Time:                    ${Math.round((Date.now() - startTime) / 1000)}s`);
    console.log('\n✨ Urgency calculation completed!');

    // Warnings
    if (propertyResult.distribution[5] > 0) {
      console.log(`\n⚠️  ${propertyResult.distribution[5]} properties need URGENT attention!`);
    }

  } catch (error) {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run script
main();
