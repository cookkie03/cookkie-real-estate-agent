/**
 * CRM IMMOBILIARE - Building Aggregation Script
 *
 * Aggregates properties to create/update buildings and calculates statistics.
 * Automatically creates buildings from properties with same address.
 *
 * Usage:
 *   npx tsx scripts/aggregate-buildings.ts
 *
 * Features:
 * - Auto-create buildings from properties
 * - Calculate aggregate statistics (activeUnits, soldUnits, avgUrgency)
 * - Link orphan properties to buildings
 * - Update building coordinates from properties
 * - Batch processing with progress tracking
 *
 * @module scripts/aggregate-buildings
 * @since v3.2.0
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface BuildingStats {
  totalUnits: number;
  activeUnits: number;
  soldUnits: number;
  avgUrgency: number;
}

/**
 * Normalize address for comparison
 */
function normalizeAddress(street: string, civic: string, city: string): string {
  const normalize = (str: string) => str.toLowerCase().trim().replace(/\s+/g, ' ');
  return `${normalize(street)}|${normalize(civic)}|${normalize(city)}`;
}

/**
 * Calculate building statistics from properties
 */
function calculateBuildingStats(properties: any[]): BuildingStats {
  const total = properties.length;
  const sold = properties.filter(p => ['sold', 'rented', 'archived'].includes(p.status)).length;
  const active = total - sold;

  // Calculate average urgency (only active properties)
  const activeProperties = properties.filter(p => !['sold', 'rented', 'archived'].includes(p.status));
  const avgUrgency = activeProperties.length > 0
    ? activeProperties.reduce((sum, p) => sum + (p.urgencyScore || 0), 0) / activeProperties.length
    : 0;

  return {
    totalUnits: total,
    activeUnits: active,
    soldUnits: sold,
    avgUrgency: Math.round(avgUrgency * 100) / 100 // Round to 2 decimals
  };
}

/**
 * Get or create building for property
 */
async function getOrCreateBuilding(property: any): Promise<string> {
  const normalizedAddress = normalizeAddress(property.street, property.civic || '', property.city);

  // Try to find existing building with same address
  const existingBuilding = await prisma.building.findFirst({
    where: {
      city: property.city,
      street: property.street,
      civic: property.civic || ''
    }
  });

  if (existingBuilding) {
    return existingBuilding.id;
  }

  // Create new building
  console.log(`  🏗️  Creating new building: ${property.street} ${property.civic}, ${property.city}`);

  // Generate building code
  const count = await prisma.building.count();
  const year = new Date().getFullYear();
  const code = `BLD-${year}-${String(count + 1).padStart(4, '0')}`;

  const newBuilding = await prisma.building.create({
    data: {
      code,
      street: property.street,
      civic: property.civic || '',
      city: property.city,
      province: property.province,
      zip: property.zip,
      latitude: property.latitude,
      longitude: property.longitude
    }
  });

  return newBuilding.id;
}

/**
 * Link properties to buildings
 */
async function linkPropertiesToBuildings(): Promise<number> {
  console.log('🔗 Linking properties to buildings...');

  // Fetch properties without building link
  const orphanProperties = await prisma.property.findMany({
    where: {
      buildingId: null
    },
    select: {
      id: true,
      street: true,
      civic: true,
      city: true,
      province: true,
      zip: true,
      latitude: true,
      longitude: true,
      status: true
    }
  });

  console.log(`   Found ${orphanProperties.length} properties without building`);

  let linkedCount = 0;

  for (const property of orphanProperties) {
    const buildingId = await getOrCreateBuilding(property);

    await prisma.property.update({
      where: { id: property.id },
      data: { buildingId }
    });

    linkedCount++;
  }

  console.log(`   ✅ Linked ${linkedCount} properties to buildings`);
  return linkedCount;
}

/**
 * Update building statistics
 */
async function updateBuildingStatistics(): Promise<number> {
  console.log('📊 Updating building statistics...');

  // Fetch all buildings with their properties
  const buildings = await prisma.building.findMany({
    include: {
      properties: {
        select: {
          status: true,
          urgencyScore: true
        }
      }
    }
  });

  console.log(`   Found ${buildings.length} buildings`);

  let updatedCount = 0;

  for (const building of buildings) {
    const stats = calculateBuildingStats(building.properties);

    await prisma.building.update({
      where: { id: building.id },
      data: {
        totalUnits: stats.totalUnits,
        activeUnits: stats.activeUnits,
        soldUnits: stats.soldUnits,
        avgUrgency: stats.avgUrgency
      }
    });

    updatedCount++;
  }

  console.log(`   ✅ Updated ${updatedCount} buildings`);
  return updatedCount;
}

/**
 * Update building coordinates from properties
 */
async function updateBuildingCoordinates(): Promise<number> {
  console.log('📍 Updating building coordinates from properties...');

  // Fetch buildings without coordinates
  const buildingsWithoutCoords = await prisma.building.findMany({
    where: {
      OR: [
        { latitude: null },
        { longitude: null }
      ]
    },
    include: {
      properties: {
        where: {
          AND: [
            { latitude: { not: null } },
            { longitude: { not: null } }
          ]
        },
        select: {
          latitude: true,
          longitude: true
        },
        take: 1
      }
    }
  });

  console.log(`   Found ${buildingsWithoutCoords.length} buildings without coordinates`);

  let updatedCount = 0;

  for (const building of buildingsWithoutCoords) {
    if (building.properties.length > 0) {
      const property = building.properties[0];

      await prisma.building.update({
        where: { id: building.id },
        data: {
          latitude: property.latitude,
          longitude: property.longitude
        }
      });

      updatedCount++;
    }
  }

  console.log(`   ✅ Updated ${updatedCount} building coordinates`);
  return updatedCount;
}

/**
 * Main aggregation process
 */
async function main() {
  console.log('🏢 CRM Immobiliare - Building Aggregation Script\n');

  try {
    const startTime = Date.now();

    // Step 1: Link orphan properties to buildings
    const linkedCount = await linkPropertiesToBuildings();

    console.log();

    // Step 2: Update building coordinates from properties
    const coordsUpdated = await updateBuildingCoordinates();

    console.log();

    // Step 3: Update building statistics
    const statsUpdated = await updateBuildingStatistics();

    console.log();

    // Summary
    console.log('━'.repeat(60));
    console.log('📊 AGGREGATION SUMMARY');
    console.log('━'.repeat(60));
    console.log(`🔗 Properties linked:       ${linkedCount}`);
    console.log(`📍 Coordinates updated:     ${coordsUpdated}`);
    console.log(`📊 Statistics updated:      ${statsUpdated}`);
    console.log(`⏱️  Time:                    ${Math.round((Date.now() - startTime) / 1000)}s`);
    console.log('\n✨ Aggregation completed!');

  } catch (error) {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run script
main();
