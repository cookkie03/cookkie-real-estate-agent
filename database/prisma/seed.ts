/**
 * =============================================================================
 * Prisma Seed Script - CRM Immobiliare
 * =============================================================================
 *
 * Seeds the database with initial sample data for development and testing.
 *
 * Usage:
 *   npx tsx seed.ts
 *
 * Or via npm script from root:
 *   npm run prisma:seed
 *
 * IMPORTANT: All data is FICTIONAL for privacy compliance (GDPR)
 * =============================================================================
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...\n');

  // ==========================================================================
  // 1. CREATE USER PROFILE
  // ==========================================================================
  console.log('👤 Creating user profile...');

  const userProfile = await prisma.userProfile.upsert({
    where: { email: 'mario.rossi@example.com' },
    update: {},
    create: {
      fullName: 'Mario Rossi',
      email: 'mario.rossi@example.com',
      phone: '+39 333 123 4567',
      agencyName: 'Agenzia Immobiliare Rossi & Partners',
      agencyVat: 'IT12345678901',
      agencyAddress: 'Via Roma 15, 20100 Milano (MI), Italia',
      settings: { commissionPercent: 3.0, currency: 'EUR', locale: 'it-IT' },
    },
  });

  console.log('✅ User profile created:', userProfile.email);

  // ==========================================================================
  // 2. CREATE CONTACTS (Clients, Owners, Leads)
  // ==========================================================================
  console.log('\n📇 Creating contacts...');

  const contacts = await Promise.all([
    // Client 1 - Buyer
    prisma.contact.upsert({
      where: { code: 'CLI-001' },
      update: {},
      create: {
        code: 'CLI-001',
        entityType: 'person',
        fullName: 'Giulia Bianchi',
        firstName: 'Giulia',
        lastName: 'Bianchi',
        primaryPhone: '+39 340 111 2222',
        primaryEmail: 'giulia.bianchi@example.com',
        city: 'Milano',
        province: 'MI',
        budgetMin: 200000,
        budgetMax: 350000,
        status: 'active',
        importance: 'high',
        leadScore: 85,
      },
    }),

    // Client 2 - Renter
    prisma.contact.upsert({
      where: { code: 'CLI-002' },
      update: {},
      create: {
        code: 'CLI-002',
        entityType: 'person',
        fullName: 'Luca Verdi',
        firstName: 'Luca',
        lastName: 'Verdi',
        primaryPhone: '+39 347 222 3333',
        primaryEmail: 'luca.verdi@example.com',
        city: 'Milano',
        province: 'MI',
        budgetMin: 800,
        budgetMax: 1200,
        status: 'active',
        importance: 'normal',
        leadScore: 70,
      },
    }),

    // Owner 1
    prisma.contact.upsert({
      where: { code: 'OWN-001' },
      update: {},
      create: {
        code: 'OWN-001',
        entityType: 'person',
        fullName: 'Anna Neri',
        firstName: 'Anna',
        lastName: 'Neri',
        primaryPhone: '+39 335 444 5555',
        primaryEmail: 'anna.neri@example.com',
        city: 'Milano',
        province: 'MI',
        status: 'active',
        importance: 'vip',
      },
    }),
  ]);

  console.log(`✅ Created ${contacts.length} contacts`);

  // ==========================================================================
  // 3. CREATE BUILDINGS
  // ==========================================================================
  console.log('\n🏢 Creating buildings...');

  const buildings = await Promise.all([
    prisma.building.upsert({
      where: { code: 'BLD-001' },
      update: {},
      create: {
        code: 'BLD-001',
        street: 'Via Garibaldi',
        civic: '15',
        city: 'Milano',
        province: 'MI',
        zip: '20100',
        latitude: 45.4642,
        longitude: 9.1900,
        yearBuilt: 1950,
        totalFloors: 5,
        totalUnits: 10,
        hasElevator: true,
        condition: 'good',
      },
    }),
  ]);

  console.log(`✅ Created ${buildings.length} buildings`);

  // ==========================================================================
  // 4. CREATE PROPERTIES
  // ==========================================================================
  console.log('\n🏠 Creating properties...');

  const properties = await Promise.all([
    // Property 1 - For Sale
    prisma.property.upsert({
      where: { code: 'PROP-001' },
      update: {},
      create: {
        code: 'PROP-001',
        ownerContactId: contacts[2].id, // Anna Neri
        buildingId: buildings[0].id,
        status: 'available',
        visibility: 'public',
        source: 'manual',
        verified: true,
        street: 'Via Garibaldi',
        civic: '15',
        internal: 'A',
        floor: '3',
        city: 'Milano',
        province: 'MI',
        zone: 'Centro',
        zip: '20100',
        latitude: 45.4642,
        longitude: 9.1900,
        contractType: 'sale',
        propertyType: 'apartment',
        sqmCommercial: 95,
        sqmLivable: 85,
        rooms: 3,
        bedrooms: 2,
        bathrooms: 1,
        hasElevator: true,
        hasParking: false,
        condition: 'good',
        heatingType: 'centralized',
        energyClass: 'C',
        yearBuilt: 1950,
        priceSale: 280000,
        title: 'Luminoso Trilocale in Centro Milano',
        description: 'Bellissimo appartamento trilocale completamente ristrutturato nel cuore di Milano. Composto da soggiorno, cucina abitabile, 2 camere da letto e bagno. Terzo piano con ascensore.',
      },
    }),

    // Property 2 - For Rent
    prisma.property.upsert({
      where: { code: 'PROP-002' },
      update: {},
      create: {
        code: 'PROP-002',
        ownerContactId: contacts[2].id,
        status: 'available',
        visibility: 'public',
        source: 'manual',
        verified: true,
        street: 'Via Dante',
        civic: '42',
        floor: '2',
        city: 'Milano',
        province: 'MI',
        zone: 'Sempione',
        zip: '20121',
        latitude: 45.4732,
        longitude: 9.1815,
        contractType: 'rent',
        propertyType: 'apartment',
        sqmCommercial: 65,
        sqmLivable: 60,
        rooms: 2,
        bedrooms: 1,
        bathrooms: 1,
        hasElevator: true,
        hasParking: true,
        condition: 'excellent',
        heatingType: 'autonomous',
        energyClass: 'B',
        yearBuilt: 2010,
        priceRentMonthly: 950,
        title: 'Bilocale Moderno Zona Sempione',
        description: 'Moderno bilocale arredato in zona Sempione. Composto da soggiorno con angolo cottura, camera da letto e bagno. Posto auto incluso. Ideale per professionisti.',
      },
    }),
  ]);

  console.log(`✅ Created ${properties.length} properties`);

  // ==========================================================================
  // 5. CREATE REQUESTS
  // ==========================================================================
  console.log('\n🔍 Creating requests...');

  const requests = await Promise.all([
    // Request 1 - Buy apartment
    prisma.request.upsert({
      where: { code: 'REQ-001' },
      update: {},
      create: {
        code: 'REQ-001',
        contactId: contacts[0].id, // Giulia Bianchi
        requestType: 'search_buy',
        status: 'active',
        urgency: 'high',
        contractType: 'sale',
        searchCities: JSON.stringify(['Milano']),
        searchZones: JSON.stringify(['Centro', 'Sempione', 'Porta Romana']),
        propertyTypes: JSON.stringify(['apartment']),
        priceMin: 200000,
        priceMax: 350000,
        sqmMin: 70,
        sqmMax: 100,
        roomsMin: 2,
        roomsMax: 3,
        requiresElevator: true,
        requiresParking: false,
        notes: 'Cliente cerca appartamento in zona centrale, max 3° piano con ascensore. Budget flessibile per immobile in ottime condizioni.',
      },
    }),

    // Request 2 - Rent apartment
    prisma.request.upsert({
      where: { code: 'REQ-002' },
      update: {},
      create: {
        code: 'REQ-002',
        contactId: contacts[1].id, // Luca Verdi
        requestType: 'search_rent',
        status: 'active',
        urgency: 'medium',
        contractType: 'rent',
        searchCities: JSON.stringify(['Milano']),
        searchZones: JSON.stringify(['Sempione', 'Porta Garibaldi', 'Isola']),
        propertyTypes: JSON.stringify(['apartment']),
        priceMin: 800,
        priceMax: 1200,
        sqmMin: 50,
        sqmMax: 70,
        roomsMin: 2,
        roomsMax: 2,
        requiresParking: true,
        notes: 'Cliente cerca bilocale arredato, disponibile da subito. Preferenza per zona Sempione/Porta Garibaldi. Contratto 4+4.',
      },
    }),
  ]);

  console.log(`✅ Created ${requests.length} requests`);

  // ==========================================================================
  // 6. CREATE MATCHES
  // ==========================================================================
  console.log('\n🎯 Creating matches...');

  const matches = await Promise.all([
    // Match 1: PROP-001 (sale) -> REQ-001 (Giulia looking to buy)
    prisma.match.create({
      data: {
        requestId: requests[0].id,
        propertyId: properties[0].id,
        contactId: contacts[0].id,
        scoreTotal: 85,
        scoreLocation: 90,
        scorePrice: 80,
        scoreSize: 85,
        scoreFeatures: 85,
        status: 'suggested',
      },
    }),

    // Match 2: PROP-002 (rent) -> REQ-002 (Luca looking to rent)
    prisma.match.create({
      data: {
        requestId: requests[1].id,
        propertyId: properties[1].id,
        contactId: contacts[1].id,
        scoreTotal: 92,
        scoreLocation: 95,
        scorePrice: 90,
        scoreSize: 90,
        scoreFeatures: 95,
        status: 'sent',
        sentDate: new Date(),
      },
    }),
  ]);

  console.log(`✅ Created ${matches.length} matches`);

  // ==========================================================================
  // 7. CREATE ACTIVITIES
  // ==========================================================================
  console.log('\n📅 Creating activities...');

  const activities = await Promise.all([
    // Activity 1 - Call with Giulia
    prisma.activity.create({
      data: {
        contactId: contacts[0].id,
        requestId: requests[0].id,
        activityType: 'call',
        status: 'completed',
        priority: 'high',
        title: 'Chiamata di follow-up - Giulia Bianchi',
        description: 'Discussione su preferenze immobile e budget',
        outcome: 'Cliente interessata a vedere PROP-001. Appuntamento fissato per la prossima settimana.',
        scheduledAt: new Date('2025-11-05T10:00:00'),
        completedAt: new Date('2025-11-05T10:30:00'),
      },
    }),

    // Activity 2 - Visit scheduled for Luca
    prisma.activity.create({
      data: {
        contactId: contacts[1].id,
        propertyId: properties[1].id,
        activityType: 'visit',
        status: 'scheduled',
        priority: 'normal',
        title: 'Visita immobile - Luca Verdi',
        description: 'Visita appartamento Via Dante 42',
        scheduledAt: new Date('2025-11-08T15:00:00'),
      },
    }),

    // Activity 3 - Email to send property details
    prisma.activity.create({
      data: {
        contactId: contacts[0].id,
        propertyId: properties[0].id,
        activityType: 'email',
        status: 'scheduled',
        priority: 'normal',
        title: 'Inviare scheda immobile - PROP-001',
        description: 'Inviare scheda dettagliata e foto di Via Garibaldi 15',
        scheduledAt: new Date('2025-11-07T09:00:00'),
      },
    }),
  ]);

  console.log(`✅ Created ${activities.length} activities`);

  // ==========================================================================
  // SUMMARY
  // ==========================================================================
  console.log('\n' + '='.repeat(60));
  console.log('✅ Database seeding completed successfully!');
  console.log('='.repeat(60));
  console.log('\n📊 Summary:');
  console.log(`   • 1 user profile (${userProfile.email})`);
  console.log(`   • ${contacts.length} contacts`);
  console.log(`   • ${buildings.length} buildings`);
  console.log(`   • ${properties.length} properties`);
  console.log(`   • ${requests.length} requests`);
  console.log(`   • ${matches.length} matches`);
  console.log(`   • ${activities.length} activities`);
  console.log('\n🎯 Application Ready:');
  console.log(`   Agency: ${userProfile.agencyName}`);
  console.log(`   Agent: ${userProfile.fullName}`);
  console.log(`   Email: ${userProfile.email}`);
  console.log('\n');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error('❌ Error seeding database:', e);
    await prisma.$disconnect();
    process.exit(1);
  });
