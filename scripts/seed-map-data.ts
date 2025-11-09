/**
 * CRM IMMOBILIARE - Map Seed Data Script
 *
 * Creates realistic test data for Interactive Property Map development.
 * Focuses on Corbetta area (Milano province) and nearby municipalities.
 *
 * Usage:
 *   npx tsx scripts/seed-map-data.ts
 *
 * Features:
 * - 15-20 buildings in Corbetta + nearby (Vittuone, Cassinetta, Albairate, Cisliano)
 * - Multiple properties per building (apartments, units)
 * - Realistic coordinates (actual locations)
 * - Varied urgency levels
 * - Sample activities and matches
 * - Cadastral zones (Centro, Nord, Sud, Periferia)
 *
 * ⚠️  WARNING: This will DELETE existing data! Use only in development.
 *
 * @module scripts/seed-map-data
 * @since v3.2.0
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Test data: Buildings in Corbetta area
// Coordinates are real locations in Corbetta and nearby municipalities
const TEST_BUILDINGS = [
  // CORBETTA (Centro Storico)
  {
    street: 'Piazza della Libertà',
    civic: '5',
    city: 'Corbetta',
    province: 'Milano',
    zip: '20011',
    cadastralZone: 'A', // Centro
    latitude: 45.4711,
    longitude: 8.9203,
    yearBuilt: 1920,
    totalFloors: 3,
    hasElevator: false,
    condition: 'good',
    properties: [
      { floor: '2', internal: 'int. 3', rooms: 3, bedrooms: 2, sqm: 85, price: 195000, urgency: 5 },
      { floor: '1', internal: 'int. 1', rooms: 4, bedrooms: 3, sqm: 105, price: 240000, urgency: 3 },
    ]
  },
  {
    street: 'Via Matteotti',
    civic: '12',
    city: 'Corbetta',
    province: 'Milano',
    zip: '20011',
    cadastralZone: 'A',
    latitude: 45.4723,
    longitude: 8.9189,
    yearBuilt: 1950,
    totalFloors: 4,
    hasElevator: true,
    condition: 'excellent',
    properties: [
      { floor: '3', internal: null, rooms: 2, bedrooms: 1, sqm: 65, price: 175000, urgency: 2 },
      { floor: '2', internal: null, rooms: 3, bedrooms: 2, sqm: 80, price: 210000, urgency: 4 },
      { floor: '1', internal: null, rooms: 3, bedrooms: 2, sqm: 75, price: 195000, urgency: 1 },
    ]
  },

  // CORBETTA (Zona Nord)
  {
    street: 'Via Milano',
    civic: '45',
    city: 'Corbetta',
    province: 'Milano',
    zip: '20011',
    cadastralZone: 'B',
    latitude: 45.4755,
    longitude: 8.9178,
    yearBuilt: 2005,
    totalFloors: 3,
    hasElevator: true,
    condition: 'excellent',
    properties: [
      { floor: '2', internal: 'scala A', rooms: 4, bedrooms: 3, sqm: 120, price: 285000, urgency: 3 },
      { floor: '1', internal: 'scala B', rooms: 3, bedrooms: 2, sqm: 95, price: 235000, urgency: 2 },
    ]
  },
  {
    street: 'Via Amendola',
    civic: '8',
    city: 'Corbetta',
    province: 'Milano',
    zip: '20011',
    cadastralZone: 'B',
    latitude: 45.4768,
    longitude: 8.9156,
    yearBuilt: 1985,
    totalFloors: 2,
    hasElevator: false,
    condition: 'good',
    properties: [
      { floor: '1', internal: null, rooms: 2, bedrooms: 1, sqm: 60, price: 165000, urgency: 4 },
      { floor: 'T', internal: null, rooms: 3, bedrooms: 2, sqm: 90, price: 220000, urgency: 0 }, // SOLD
    ]
  },

  // CORBETTA (Zona Sud/Periferia)
  {
    street: 'Via Magenta',
    civic: '22',
    city: 'Corbetta',
    province: 'Milano',
    zip: '20011',
    cadastralZone: 'C',
    latitude: 45.4685,
    longitude: 8.9234,
    yearBuilt: 2010,
    totalFloors: 3,
    hasElevator: true,
    condition: 'excellent',
    properties: [
      { floor: '2', internal: null, rooms: 4, bedrooms: 3, sqm: 110, price: 270000, urgency: 5 },
      { floor: '1', internal: null, rooms: 3, bedrooms: 2, sqm: 85, price: 215000, urgency: 3 },
      { floor: 'T', internal: null, rooms: 2, bedrooms: 1, sqm: 70, price: 185000, urgency: 2 },
    ]
  },

  // VITTUONE (limitrofo)
  {
    street: 'Via Roma',
    civic: '15',
    city: 'Vittuone',
    province: 'Milano',
    zip: '20010',
    cadastralZone: 'A',
    latitude: 45.4834,
    longitude: 8.9523,
    yearBuilt: 1975,
    totalFloors: 4,
    hasElevator: true,
    condition: 'fair',
    properties: [
      { floor: '3', internal: 'int. 6', rooms: 3, bedrooms: 2, sqm: 75, price: 180000, urgency: 4 },
      { floor: '2', internal: 'int. 4', rooms: 2, bedrooms: 1, sqm: 55, price: 145000, urgency: 3 },
    ]
  },
  {
    street: 'Piazza Villoresi',
    civic: '3',
    city: 'Vittuone',
    province: 'Milano',
    zip: '20010',
    cadastralZone: 'A',
    latitude: 45.4821,
    longitude: 8.9534,
    yearBuilt: 1960,
    totalFloors: 3,
    hasElevator: false,
    condition: 'good',
    properties: [
      { floor: '2', internal: null, rooms: 4, bedrooms: 3, sqm: 100, price: 225000, urgency: 2 },
      { floor: '1', internal: null, rooms: 3, bedrooms: 2, sqm: 80, price: 195000, urgency: 1 },
    ]
  },

  // CASSINETTA DI LUGAGNANO
  {
    street: 'Via Naviglio Grande',
    civic: '12',
    city: 'Cassinetta di Lugagnano',
    province: 'Milano',
    zip: '20081',
    cadastralZone: 'A',
    latitude: 45.4412,
    longitude: 8.9145,
    yearBuilt: 1890,
    totalFloors: 2,
    hasElevator: false,
    condition: 'fair',
    properties: [
      { floor: '1', internal: null, rooms: 5, bedrooms: 3, sqm: 140, price: 295000, urgency: 5 }, // Historic building
    ]
  },
  {
    street: 'Via San Giorgio',
    civic: '7',
    city: 'Cassinetta di Lugagnano',
    province: 'Milano',
    zip: '20081',
    cadastralZone: 'A',
    latitude: 45.4425,
    longitude: 8.9167,
    yearBuilt: 2000,
    totalFloors: 2,
    hasElevator: false,
    condition: 'excellent',
    properties: [
      { floor: '1', internal: null, rooms: 3, bedrooms: 2, sqm: 90, price: 215000, urgency: 3 },
      { floor: 'T', internal: null, rooms: 4, bedrooms: 3, sqm: 120, price: 265000, urgency: 2 },
    ]
  },

  // ALBAIRATE
  {
    street: 'Via Vittorio Veneto',
    civic: '28',
    city: 'Albairate',
    province: 'Milano',
    zip: '20080',
    cadastralZone: 'B',
    latitude: 45.4323,
    longitude: 8.9534,
    yearBuilt: 1995,
    totalFloors: 3,
    hasElevator: true,
    condition: 'good',
    properties: [
      { floor: '2', internal: 'scala A', rooms: 3, bedrooms: 2, sqm: 85, price: 205000, urgency: 4 },
      { floor: '1', internal: 'scala A', rooms: 2, bedrooms: 1, sqm: 65, price: 170000, urgency: 3 },
      { floor: 'T', internal: 'scala B', rooms: 4, bedrooms: 3, sqm: 105, price: 245000, urgency: 0 }, // SOLD
    ]
  },
  {
    street: 'Via Manzoni',
    civic: '16',
    city: 'Albairate',
    province: 'Milano',
    zip: '20080',
    cadastralZone: 'A',
    latitude: 45.4345,
    longitude: 8.9512,
    yearBuilt: 2008,
    totalFloors: 2,
    hasElevator: false,
    condition: 'excellent',
    properties: [
      { floor: '1', internal: null, rooms: 3, bedrooms: 2, sqm: 95, price: 230000, urgency: 2 },
    ]
  },

  // CISLIANO
  {
    street: 'Via Garibaldi',
    civic: '34',
    city: 'Cisliano',
    province: 'Milano',
    zip: '20080',
    cadastralZone: 'A',
    latitude: 45.4556,
    longitude: 8.9823,
    yearBuilt: 1980,
    totalFloors: 3,
    hasElevator: false,
    condition: 'fair',
    properties: [
      { floor: '2', internal: 'int. 5', rooms: 3, bedrooms: 2, sqm: 78, price: 185000, urgency: 5 },
      { floor: '1', internal: 'int. 3', rooms: 2, bedrooms: 1, sqm: 58, price: 155000, urgency: 4 },
    ]
  },
  {
    street: 'Piazza Italia',
    civic: '9',
    city: 'Cisliano',
    province: 'Milano',
    zip: '20080',
    cadastralZone: 'A',
    latitude: 45.4567,
    longitude: 8.9845,
    yearBuilt: 2012,
    totalFloors: 3,
    hasElevator: true,
    condition: 'excellent',
    properties: [
      { floor: '2', internal: null, rooms: 4, bedrooms: 3, sqm: 115, price: 275000, urgency: 1 }, // NEW
      { floor: '1', internal: null, rooms: 3, bedrooms: 2, sqm: 90, price: 225000, urgency: 2 },
    ]
  },
];

/**
 * Generate building code
 */
function generateBuildingCode(index: number): string {
  const year = new Date().getFullYear();
  return `BLD-${year}-${String(index + 1).padStart(4, '0')}`;
}

/**
 * Generate property code
 */
function generatePropertyCode(index: number): string {
  const year = new Date().getFullYear();
  return `PROP-${year}-${String(index + 1).padStart(4, '0')}`;
}

/**
 * Map urgency to status
 */
function getPropertyStatus(urgency: number): string {
  if (urgency === 0) return 'sold';
  if (urgency === 1) return 'available'; // NEW
  if (urgency === 2) return 'available'; // OPTIMAL
  if (urgency === 3) return 'option';    // MONITOR (some negotiating)
  return 'available'; // WARNING/URGENT
}

/**
 * Create activities for property based on urgency
 */
function getActivitiesForUrgency(urgency: number): Array<{ type: string; daysAgo: number }> {
  const now = new Date();

  switch (urgency) {
    case 5: // URGENT: >60 days no activity
      return [
        { type: 'call', daysAgo: 65 },
        { type: 'email', daysAgo: 70 }
      ];
    case 4: // WARNING: 30-60 days, few activities
      return [
        { type: 'visit', daysAgo: 45 },
        { type: 'call', daysAgo: 35 }
      ];
    case 3: // MONITOR: regular activities
      return [
        { type: 'visit', daysAgo: 20 },
        { type: 'call', daysAgo: 15 },
        { type: 'visit', daysAgo: 25 }
      ];
    case 2: // OPTIMAL: frequent visits
      return [
        { type: 'visit', daysAgo: 5 },
        { type: 'visit', daysAgo: 10 },
        { type: 'visit', daysAgo: 15 },
        { type: 'visit', daysAgo: 20 },
        { type: 'visit', daysAgo: 25 },
        { type: 'email', daysAgo: 3 }
      ];
    case 1: // NEW: minimal activity
      return [
        { type: 'valuation', daysAgo: 2 }
      ];
    case 0: // SOLD: closing activities
      return [
        { type: 'meeting', daysAgo: 10 },
        { type: 'call', daysAgo: 5 }
      ];
    default:
      return [];
  }
}

/**
 * Seed database with test data
 */
async function main() {
  console.log('🌱 CRM Immobiliare - Seeding Map Test Data\n');

  try {
    // WARNING: Clear existing data
    console.log('⚠️  WARNING: This will DELETE all existing data!');
    console.log('⚠️  Press Ctrl+C within 3 seconds to cancel...\n');
    await new Promise(resolve => setTimeout(resolve, 3000));

    console.log('🗑️  Clearing existing data...');
    await prisma.activity.deleteMany();
    await prisma.match.deleteMany();
    await prisma.property.deleteMany();
    await prisma.building.deleteMany();
    console.log('✅ Data cleared\n');

    let propertyCounter = 0;

    for (let buildingIndex = 0; buildingIndex < TEST_BUILDINGS.length; buildingIndex++) {
      const buildingData = TEST_BUILDINGS[buildingIndex];

      console.log(`🏢 Creating building ${buildingIndex + 1}/${TEST_BUILDINGS.length}: ${buildingData.street} ${buildingData.civic}, ${buildingData.city}`);

      // Create building
      const building = await prisma.building.create({
        data: {
          code: generateBuildingCode(buildingIndex),
          street: buildingData.street,
          civic: buildingData.civic,
          city: buildingData.city,
          province: buildingData.province,
          zip: buildingData.zip,
          cadastralZone: buildingData.cadastralZone,
          latitude: buildingData.latitude,
          longitude: buildingData.longitude,
          yearBuilt: buildingData.yearBuilt,
          totalFloors: buildingData.totalFloors,
          hasElevator: buildingData.hasElevator,
          condition: buildingData.condition,
          totalUnits: buildingData.properties.length,
          activeUnits: buildingData.properties.filter(p => p.urgency > 0).length,
          soldUnits: buildingData.properties.filter(p => p.urgency === 0).length,
        }
      });

      // Create properties in this building
      for (const propData of buildingData.properties) {
        const property = await prisma.property.create({
          data: {
            code: generatePropertyCode(propertyCounter),
            buildingId: building.id,
            status: getPropertyStatus(propData.urgency),
            street: buildingData.street,
            civic: buildingData.civic,
            internal: propData.internal,
            floor: propData.floor,
            city: buildingData.city,
            province: buildingData.province,
            zip: buildingData.zip,
            latitude: buildingData.latitude,
            longitude: buildingData.longitude,
            contractType: 'sale',
            propertyType: 'apartment',
            propertyCategory: 'residential',
            rooms: propData.rooms,
            bedrooms: propData.bedrooms,
            bathrooms: 1,
            sqmCommercial: propData.sqm,
            sqmLivable: propData.sqm - 5,
            priceSale: propData.price,
            urgencyScore: propData.urgency,
            yearBuilt: buildingData.yearBuilt,
            condition: buildingData.condition,
            hasElevator: buildingData.hasElevator,
            publishedAt: propData.urgency > 0 ? new Date() : null,
          }
        });

        // Create activities
        const activities = getActivitiesForUrgency(propData.urgency);
        for (const activity of activities) {
          const completedAt = new Date();
          completedAt.setDate(completedAt.getDate() - activity.daysAgo);

          await prisma.activity.create({
            data: {
              propertyId: property.id,
              activityType: activity.type,
              status: 'completed',
              title: `${activity.type} - ${buildingData.street} ${buildingData.civic}`,
              scheduledAt: completedAt,
              completedAt: completedAt,
            }
          });
        }

        console.log(`   📦 Property ${propertyCounter + 1}: ${propData.rooms} locali, ${propData.sqm}mq, €${propData.price} - Urgency: ${propData.urgency}`);
        propertyCounter++;
      }

      // Update building avgUrgency
      const avgUrgency = buildingData.properties
        .filter(p => p.urgency > 0)
        .reduce((sum, p) => sum + p.urgency, 0) / buildingData.properties.filter(p => p.urgency > 0).length || 0;

      await prisma.building.update({
        where: { id: building.id },
        data: { avgUrgency: Math.round(avgUrgency * 100) / 100 }
      });
    }

    console.log('\n━'.repeat(60));
    console.log('📊 SEED SUMMARY');
    console.log('━'.repeat(60));
    console.log(`🏢 Buildings created:       ${TEST_BUILDINGS.length}`);
    console.log(`📦 Properties created:      ${propertyCounter}`);
    console.log('\n📍 Geographic Coverage:');
    const cityCounts = TEST_BUILDINGS.reduce((acc, b) => {
      acc[b.city] = (acc[b.city] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    Object.entries(cityCounts).forEach(([city, count]) => {
      console.log(`   ${city}: ${count} buildings`);
    });

    console.log('\n✨ Seed data created successfully!');
    console.log('\n🗺️  Ready for map development!');

  } catch (error) {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run script
main();
