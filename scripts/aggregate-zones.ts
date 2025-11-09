/**
 * CRM IMMOBILIARE - Zone Aggregation Script
 *
 * Calcola statistiche aggregate per livelli gerarchici:
 * - Multi-Comune (tutti i comuni)
 * - Singolo Comune
 * - Zona Catastale (A, B, C all'interno di un comune)
 *
 * @module scripts/aggregate-zones
 * @since v3.2.0
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface ZoneStats {
  totalBuildings: number;
  totalProperties: number;
  activeProperties: number;
  soldProperties: number;
  avgUrgency: number;
  urgencyDistribution: Record<number, number>;
}

interface ComuneStats extends ZoneStats {
  comune: string;
  zones: {
    zone: string;
    stats: ZoneStats;
  }[];
}

interface MultiComuneStats extends ZoneStats {
  comuni: ComuneStats[];
}

/**
 * Calculate stats for a set of buildings
 */
function calculateStats(buildings: any[]): ZoneStats {
  let totalProperties = 0;
  let activeProperties = 0;
  let soldProperties = 0;
  let urgencySum = 0;
  let urgencyCount = 0;
  const urgencyDistribution: Record<number, number> = {};

  for (const building of buildings) {
    totalProperties += building.stats.total;
    activeProperties += building.stats.active;
    soldProperties += building.stats.total - building.stats.active;

    if (building.stats.avgUrgency != null) {
      urgencySum += building.stats.avgUrgency * building.stats.active;
      urgencyCount += building.stats.active;

      const urgency = Math.round(building.stats.avgUrgency);
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
 * Get all buildings with their stats
 */
async function getAllBuildings() {
  return prisma.building.findMany({
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
}

/**
 * Aggregate by city
 */
function aggregateByCity(buildings: any[]): ComuneStats[] {
  const byCity = new Map<string, any[]>();

  for (const building of buildings) {
    const city = building.city || 'Sconosciuto';
    if (!byCity.has(city)) {
      byCity.set(city, []);
    }
    byCity.get(city)!.push(building);
  }

  const result: ComuneStats[] = [];

  for (const [city, cityBuildings] of byCity.entries()) {
    // Aggregate zones within city
    const zoneMap = new Map<string, any[]>();

    for (const building of cityBuildings) {
      const zone = building.cadastralZone || 'Non classificata';
      if (!zoneMap.has(zone)) {
        zoneMap.set(zone, []);
      }
      zoneMap.get(zone)!.push(building);
    }

    const zones = Array.from(zoneMap.entries()).map(([zone, zoneBuildings]) => ({
      zone,
      stats: calculateStats(zoneBuildings.map(b => ({
        stats: {
          total: b.activeUnits + b.soldUnits,
          active: b.activeUnits,
          avgUrgency: b.avgUrgency,
        },
      }))),
    }));

    const cityStats = calculateStats(cityBuildings.map(b => ({
      stats: {
        total: b.activeUnits + b.soldUnits,
        active: b.activeUnits,
        avgUrgency: b.avgUrgency,
      },
    })));

    result.push({
      comune: city,
      zones,
      ...cityStats,
    });
  }

  return result.sort((a, b) => a.comune.localeCompare(b.comune));
}

/**
 * Aggregate all data
 */
async function aggregateAll(): Promise<MultiComuneStats> {
  console.log('🔄 Aggregating zone statistics...\n');

  const buildings = await getAllBuildings();
  console.log(`📊 Found ${buildings.length} buildings with coordinates\n`);

  const comuni = aggregateByCity(buildings);

  // Multi-comune stats (global)
  const globalStats = calculateStats(buildings.map(b => ({
    stats: {
      total: b.activeUnits + b.soldUnits,
      active: b.activeUnits,
      avgUrgency: b.avgUrgency,
    },
  })));

  const result: MultiComuneStats = {
    ...globalStats,
    comuni,
  };

  console.log('✅ Aggregation complete!\n');
  console.log('📈 GLOBAL STATS:');
  console.log(`   Comuni: ${result.comuni.length}`);
  console.log(`   Edifici: ${result.totalBuildings}`);
  console.log(`   Immobili totali: ${result.totalProperties}`);
  console.log(`   Immobili attivi: ${result.activeProperties}`);
  console.log(`   Immobili venduti: ${result.soldProperties}`);
  console.log(`   Urgency media: ${result.avgUrgency.toFixed(2)}\n`);

  console.log('🏘️  PER COMUNE:');
  for (const comune of result.comuni) {
    console.log(`   ${comune.comune}:`);
    console.log(`      Edifici: ${comune.totalBuildings}`);
    console.log(`      Immobili: ${comune.totalProperties} (${comune.activeProperties} attivi)`);
    console.log(`      Urgency: ${comune.avgUrgency.toFixed(2)}`);
    console.log(`      Zone: ${comune.zones.map(z => z.zone).join(', ')}`);
  }

  return result;
}

/**
 * Main execution
 */
async function main() {
  try {
    const stats = await aggregateAll();

    // Save to JSON file for inspection
    const fs = require('fs');
    const path = require('path');
    const outputPath = path.join(__dirname, '../data/zone-stats.json');

    // Create data directory if it doesn't exist
    const dataDir = path.join(__dirname, '../data');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    fs.writeFileSync(outputPath, JSON.stringify(stats, null, 2));
    console.log(`\n💾 Stats saved to: ${outputPath}`);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
