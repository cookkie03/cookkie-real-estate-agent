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

    // Client 3 - Luxury Buyer
    prisma.contact.upsert({
      where: { code: 'CLI-003' },
      update: {},
      create: {
        code: 'CLI-003',
        entityType: 'person',
        fullName: 'Marco Ferrari',
        firstName: 'Marco',
        lastName: 'Ferrari',
        primaryPhone: '+39 338 555 6666',
        primaryEmail: 'marco.ferrari@example.com',
        city: 'Milano',
        province: 'MI',
        budgetMin: 500000,
        budgetMax: 800000,
        status: 'active',
        importance: 'vip',
        leadScore: 95,
      },
    }),

    // Client 4 - Family Buyer
    prisma.contact.upsert({
      where: { code: 'CLI-004' },
      update: {},
      create: {
        code: 'CLI-004',
        entityType: 'person',
        fullName: 'Sara Romano',
        firstName: 'Sara',
        lastName: 'Romano',
        primaryPhone: '+39 345 777 8888',
        primaryEmail: 'sara.romano@example.com',
        city: 'Milano',
        province: 'MI',
        budgetMin: 300000,
        budgetMax: 450000,
        status: 'active',
        importance: 'high',
        leadScore: 80,
      },
    }),

    // Client 5 - Investor
    prisma.contact.upsert({
      where: { code: 'CLI-005' },
      update: {},
      create: {
        code: 'CLI-005',
        entityType: 'person',
        fullName: 'Paolo Marino',
        firstName: 'Paolo',
        lastName: 'Marino',
        primaryPhone: '+39 339 999 0000',
        primaryEmail: 'paolo.marino@example.com',
        city: 'Milano',
        province: 'MI',
        budgetMin: 150000,
        budgetMax: 250000,
        status: 'active',
        importance: 'normal',
        leadScore: 65,
      },
    }),

    // Client 6 - Student Renter
    prisma.contact.upsert({
      where: { code: 'CLI-006' },
      update: {},
      create: {
        code: 'CLI-006',
        entityType: 'person',
        fullName: 'Elena Costa',
        firstName: 'Elena',
        lastName: 'Costa',
        primaryPhone: '+39 342 123 9999',
        primaryEmail: 'elena.costa@example.com',
        city: 'Milano',
        province: 'MI',
        budgetMin: 500,
        budgetMax: 750,
        status: 'active',
        importance: 'low',
        leadScore: 50,
      },
    }),

    // Client 7 - Corporate Renter
    prisma.contact.upsert({
      where: { code: 'CLI-007' },
      update: {},
      create: {
        code: 'CLI-007',
        entityType: 'company',
        fullName: 'Tech Solutions SRL',
        companyName: 'Tech Solutions SRL',
        primaryPhone: '+39 02 1234 5678',
        primaryEmail: 'hr@techsolutions.example.com',
        city: 'Milano',
        province: 'MI',
        budgetMin: 2000,
        budgetMax: 3500,
        status: 'active',
        importance: 'high',
        leadScore: 88,
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

    // Owner 2
    prisma.contact.upsert({
      where: { code: 'OWN-002' },
      update: {},
      create: {
        code: 'OWN-002',
        entityType: 'person',
        fullName: 'Roberto Colombo',
        firstName: 'Roberto',
        lastName: 'Colombo',
        primaryPhone: '+39 334 666 7777',
        primaryEmail: 'roberto.colombo@example.com',
        city: 'Milano',
        province: 'MI',
        status: 'active',
        importance: 'normal',
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

  const owner1 = contacts[7]; // Anna Neri
  const owner2 = contacts[8]; // Roberto Colombo

  const properties = await Promise.all([
    // Property 1 - Trilocale Centro Sale
    prisma.property.upsert({
      where: { code: 'PROP-001' },
      update: {},
      create: {
        code: 'PROP-001',
        ownerContactId: owner1.id,
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

    // Property 2 - Bilocale Sempione Rent
    prisma.property.upsert({
      where: { code: 'PROP-002' },
      update: {},
      create: {
        code: 'PROP-002',
        ownerContactId: owner1.id,
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

    // Property 3 - Quadrilocale Porta Romana Sale
    prisma.property.upsert({
      where: { code: 'PROP-003' },
      update: {},
      create: {
        code: 'PROP-003',
        ownerContactId: owner2.id,
        status: 'available',
        visibility: 'public',
        source: 'manual',
        verified: true,
        street: 'Viale Montenero',
        civic: '28',
        floor: '5',
        city: 'Milano',
        province: 'MI',
        zone: 'Porta Romana',
        zip: '20135',
        latitude: 45.4515,
        longitude: 9.2033,
        contractType: 'sale',
        propertyType: 'apartment',
        sqmCommercial: 120,
        sqmLivable: 110,
        rooms: 4,
        bedrooms: 3,
        bathrooms: 2,
        hasElevator: true,
        hasParking: true,
        hasBalcony: true,
        condition: 'excellent',
        heatingType: 'centralized',
        energyClass: 'B',
        yearBuilt: 2005,
        priceSale: 420000,
        title: 'Quadrilocale con Terrazzo Porta Romana',
        description: 'Splendido quadrilocale con terrazzo panoramico in zona Porta Romana. 3 camere, 2 bagni, cucina abitabile, doppio box auto.',
      },
    }),

    // Property 4 - Monolocale Rent
    prisma.property.upsert({
      where: { code: 'PROP-004' },
      update: {},
      create: {
        code: 'PROP-004',
        ownerContactId: owner1.id,
        status: 'available',
        visibility: 'public',
        source: 'manual',
        verified: true,
        street: 'Via Boccaccio',
        civic: '10',
        floor: '1',
        city: 'Milano',
        province: 'MI',
        zone: 'Porta Venezia',
        zip: '20122',
        latitude: 45.4778,
        longitude: 9.2047,
        contractType: 'rent',
        propertyType: 'apartment',
        sqmCommercial: 40,
        sqmLivable: 38,
        rooms: 1,
        bedrooms: 0,
        bathrooms: 1,
        hasElevator: false,
        hasParking: false,
        condition: 'good',
        heatingType: 'autonomous',
        energyClass: 'D',
        yearBuilt: 1970,
        priceRentMonthly: 650,
        title: 'Monolocale Zona Universitaria',
        description: 'Monolocale ideale per studenti, vicino Politecnico e Università. Arredato, primo piano senza ascensore.',
      },
    }),

    // Property 5 - Villa Luxury Sale
    prisma.property.upsert({
      where: { code: 'PROP-005' },
      update: {},
      create: {
        code: 'PROP-005',
        ownerContactId: owner2.id,
        status: 'available',
        visibility: 'public',
        source: 'manual',
        verified: true,
        street: 'Via Monte Rosa',
        civic: '35',
        floor: '0',
        city: 'Milano',
        province: 'MI',
        zone: 'CityLife',
        zip: '20149',
        latitude: 45.4785,
        longitude: 9.1565,
        contractType: 'sale',
        propertyType: 'villa',
        sqmCommercial: 250,
        sqmLivable: 220,
        rooms: 6,
        bedrooms: 4,
        bathrooms: 3,
        hasElevator: false,
        hasParking: true,
        hasGarden: true,
        condition: 'new',
        heatingType: 'autonomous',
        energyClass: 'A',
        yearBuilt: 2020,
        priceSale: 750000,
        title: 'Villa di Lusso CityLife con Giardino',
        description: 'Esclusiva villa di design in zona CityLife. 4 camere, 3 bagni, giardino privato 300 mq, box doppio, domotica.',
      },
    }),

    // Property 6 - Ufficio Rent
    prisma.property.upsert({
      where: { code: 'PROP-006' },
      update: {},
      create: {
        code: 'PROP-006',
        ownerContactId: owner2.id,
        status: 'available',
        visibility: 'public',
        source: 'manual',
        verified: true,
        street: 'Corso Buenos Aires',
        civic: '77',
        floor: '4',
        city: 'Milano',
        province: 'MI',
        zone: 'Porta Venezia',
        zip: '20124',
        latitude: 45.4805,
        longitude: 9.2065,
        contractType: 'rent',
        propertyType: 'office',
        sqmCommercial: 150,
        sqmLivable: 140,
        rooms: 5,
        bathrooms: 2,
        hasElevator: true,
        hasParking: false,
        condition: 'excellent',
        heatingType: 'centralized',
        energyClass: 'C',
        yearBuilt: 1980,
        priceRentMonthly: 2800,
        title: 'Ufficio Open Space Corso Buenos Aires',
        description: 'Ufficio rappresentativo in posizione strategica. 5 vani, sala riunioni, reception, bagni. Metro MM1 Porta Venezia.',
      },
    }),

    // Property 7 - Penthouse Sale
    prisma.property.upsert({
      where: { code: 'PROP-007' },
      update: {},
      create: {
        code: 'PROP-007',
        ownerContactId: owner1.id,
        status: 'available',
        visibility: 'public',
        source: 'manual',
        verified: true,
        street: 'Via Tortona',
        civic: '12',
        floor: '7',
        city: 'Milano',
        province: 'MI',
        zone: 'Navigli',
        zip: '20144',
        latitude: 45.4523,
        longitude: 9.1642,
        contractType: 'sale',
        propertyType: 'apartment',
        sqmCommercial: 180,
        sqmLivable: 160,
        rooms: 5,
        bedrooms: 3,
        bathrooms: 2,
        hasElevator: true,
        hasParking: true,
        hasBalcony: true,
        condition: 'new',
        heatingType: 'autonomous',
        energyClass: 'A+',
        yearBuilt: 2022,
        priceSale: 680000,
        title: 'Attico di Prestigio con Terrazza Navigli',
        description: 'Attico luxury con terrazza panoramica 80 mq, zona Navigli/Tortona. Finiture di pregio, domotica, doppia esposizione.',
      },
    }),

    // Property 8 - Trilocale Budget Sale
    prisma.property.upsert({
      where: { code: 'PROP-008' },
      update: {},
      create: {
        code: 'PROP-008',
        ownerContactId: owner2.id,
        status: 'available',
        visibility: 'public',
        source: 'manual',
        verified: true,
        street: 'Via Padova',
        civic: '150',
        floor: '2',
        city: 'Milano',
        province: 'MI',
        zone: 'Loreto',
        zip: '20127',
        latitude: 45.4888,
        longitude: 9.2200,
        contractType: 'sale',
        propertyType: 'apartment',
        sqmCommercial: 75,
        sqmLivable: 68,
        rooms: 3,
        bedrooms: 2,
        bathrooms: 1,
        hasElevator: false,
        hasParking: false,
        condition: 'to_renovate',
        heatingType: 'centralized',
        energyClass: 'G',
        yearBuilt: 1960,
        priceSale: 180000,
        title: 'Trilocale da Ristrutturare Zona Loreto',
        description: 'Appartamento trilocale da ristrutturare, ottima opportunità investimento. Zona ben collegata MM1 Loreto.',
      },
    }),

    // Property 9 - Trilocale Rent Corporate
    prisma.property.upsert({
      where: { code: 'PROP-009' },
      update: {},
      create: {
        code: 'PROP-009',
        ownerContactId: owner1.id,
        status: 'available',
        visibility: 'public',
        source: 'manual',
        verified: true,
        street: 'Via Melchiorre Gioia',
        civic: '8',
        floor: '6',
        city: 'Milano',
        province: 'MI',
        zone: 'Porta Nuova',
        zip: '20124',
        latitude: 45.4863,
        longitude: 9.1905,
        contractType: 'rent',
        propertyType: 'apartment',
        sqmCommercial: 110,
        sqmLivable: 100,
        rooms: 3,
        bedrooms: 2,
        bathrooms: 2,
        hasElevator: true,
        hasParking: true,
        hasBalcony: true,
        condition: 'excellent',
        heatingType: 'autonomous',
        energyClass: 'A',
        yearBuilt: 2018,
        priceRentMonthly: 2200,
        title: 'Trilocale Luxury Porta Nuova Arredato',
        description: 'Appartamento di rappresentanza completamente arredato zona Porta Nuova/Gae Aulenti. Ideale corporate housing.',
      },
    }),

    // Property 10 - Bilocale Sale
    prisma.property.upsert({
      where: { code: 'PROP-010' },
      update: {},
      create: {
        code: 'PROP-010',
        ownerContactId: owner2.id,
        status: 'available',
        visibility: 'public',
        source: 'manual',
        verified: true,
        street: 'Corso Magenta',
        civic: '55',
        floor: '1',
        city: 'Milano',
        province: 'MI',
        zone: 'Centro Storico',
        zip: '20123',
        latitude: 45.4642,
        longitude: 9.1755,
        contractType: 'sale',
        propertyType: 'apartment',
        sqmCommercial: 70,
        sqmLivable: 65,
        rooms: 2,
        bedrooms: 1,
        bathrooms: 1,
        hasElevator: true,
        hasParking: false,
        condition: 'good',
        heatingType: 'centralized',
        energyClass: 'C',
        yearBuilt: 1920,
        priceSale: 320000,
        title: 'Bilocale D\'Epoca Corso Magenta',
        description: 'Elegante bilocale in palazzo d\'epoca su Corso Magenta. Soffitti alti, pavimenti originali, luminoso.',
      },
    }),

    // Property 11 - Loft Sale
    prisma.property.upsert({
      where: { code: 'PROP-011' },
      update: {},
      create: {
        code: 'PROP-011',
        ownerContactId: owner1.id,
        status: 'available',
        visibility: 'public',
        source: 'manual',
        verified: true,
        street: 'Via Vigevano',
        civic: '18',
        floor: '0',
        city: 'Milano',
        province: 'MI',
        zone: 'Navigli',
        zip: '20144',
        latitude: 45.4512,
        longitude: 9.1655,
        contractType: 'sale',
        propertyType: 'apartment',
        sqmCommercial: 140,
        sqmLivable: 130,
        rooms: 3,
        bedrooms: 2,
        bathrooms: 2,
        hasElevator: false,
        hasParking: false,
        hasGarden: true,
        condition: 'excellent',
        heatingType: 'autonomous',
        energyClass: 'B',
        yearBuilt: 2015,
        priceSale: 550000,
        title: 'Loft Industrial Chic con Giardino Navigli',
        description: 'Loft di design in ex area industriale, zona Navigli. Soppalco, giardino privato, finiture moderne.',
      },
    }),

    // Property 12 - Quadrilocale Rent
    prisma.property.upsert({
      where: { code: 'PROP-012' },
      update: {},
      create: {
        code: 'PROP-012',
        ownerContactId: owner2.id,
        status: 'available',
        visibility: 'public',
        source: 'manual',
        verified: true,
        street: 'Viale Monza',
        civic: '205',
        floor: '3',
        city: 'Milano',
        province: 'MI',
        zone: 'Greco',
        zip: '20125',
        latitude: 45.5050,
        longitude: 9.2135,
        contractType: 'rent',
        propertyType: 'apartment',
        sqmCommercial: 105,
        sqmLivable: 95,
        rooms: 4,
        bedrooms: 3,
        bathrooms: 2,
        hasElevator: true,
        hasParking: true,
        hasBalcony: true,
        condition: 'good',
        heatingType: 'centralized',
        energyClass: 'D',
        yearBuilt: 1975,
        priceRentMonthly: 1400,
        title: 'Quadrilocale Spazioso Zona Greco',
        description: 'Ampio quadrilocale per famiglie, zona Greco. 3 camere, 2 bagni, balconi, cantina, posto auto.',
      },
    }),
  ]);

  console.log(`✅ Created ${properties.length} properties`);

  // ==========================================================================
  // 5. CREATE REQUESTS
  // ==========================================================================
  console.log('\n🔍 Creating requests...');

  const client1 = contacts[0]; // Giulia Bianchi
  const client2 = contacts[1]; // Luca Verdi
  const client3 = contacts[2]; // Marco Ferrari
  const client4 = contacts[3]; // Sara Romano
  const client5 = contacts[4]; // Paolo Marino
  const client6 = contacts[5]; // Elena Costa
  const client7 = contacts[6]; // Tech Solutions SRL

  const requests = await Promise.all([
    // Request 1 - Giulia: Buy apartment 200-350k
    prisma.request.upsert({
      where: { code: 'REQ-001' },
      update: {},
      create: {
        code: 'REQ-001',
        contactId: client1.id,
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

    // Request 2 - Luca: Rent bilocale 800-1200
    prisma.request.upsert({
      where: { code: 'REQ-002' },
      update: {},
      create: {
        code: 'REQ-002',
        contactId: client2.id,
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

    // Request 3 - Marco: Buy luxury 500-800k
    prisma.request.upsert({
      where: { code: 'REQ-003' },
      update: {},
      create: {
        code: 'REQ-003',
        contactId: client3.id,
        requestType: 'search_buy',
        status: 'active',
        urgency: 'low',
        contractType: 'sale',
        searchCities: JSON.stringify(['Milano']),
        searchZones: JSON.stringify(['CityLife', 'Porta Nuova', 'Navigli']),
        propertyTypes: JSON.stringify(['villa', 'apartment']),
        priceMin: 500000,
        priceMax: 800000,
        sqmMin: 150,
        sqmMax: 300,
        roomsMin: 4,
        roomsMax: 6,
        requiresElevator: false,
        requiresParking: true,
        requiresGarden: true,
        notes: 'Cliente cerca immobile di prestigio, villa o attico con terrazza. Budget elevato, priorità a finiture di lusso e posizione esclusiva.',
      },
    }),

    // Request 4 - Sara: Buy family apartment 300-450k
    prisma.request.upsert({
      where: { code: 'REQ-004' },
      update: {},
      create: {
        code: 'REQ-004',
        contactId: client4.id,
        requestType: 'search_buy',
        status: 'active',
        urgency: 'high',
        contractType: 'sale',
        searchCities: JSON.stringify(['Milano']),
        searchZones: JSON.stringify(['Porta Romana', 'Greco', 'Loreto']),
        propertyTypes: JSON.stringify(['apartment']),
        priceMin: 300000,
        priceMax: 450000,
        sqmMin: 100,
        sqmMax: 130,
        roomsMin: 3,
        roomsMax: 4,
        requiresElevator: true,
        requiresParking: true,
        requiresBalcony: true,
        notes: 'Famiglia con 2 figli cerca quadrilocale spazioso. Necessari 3 camere, ascensore e posto auto. Zona ben servita da mezzi pubblici.',
      },
    }),

    // Request 5 - Elena: Rent studio 500-750
    prisma.request.upsert({
      where: { code: 'REQ-005' },
      update: {},
      create: {
        code: 'REQ-005',
        contactId: client6.id,
        requestType: 'search_rent',
        status: 'active',
        urgency: 'high',
        contractType: 'rent',
        searchCities: JSON.stringify(['Milano']),
        searchZones: JSON.stringify(['Porta Venezia', 'Città Studi', 'Loreto']),
        propertyTypes: JSON.stringify(['apartment']),
        priceMin: 500,
        priceMax: 750,
        sqmMin: 30,
        sqmMax: 50,
        roomsMin: 1,
        roomsMax: 1,
        requiresElevator: false,
        requiresParking: false,
        notes: 'Studentessa cerca monolocale vicino università. Budget limitato, zona ben collegata. Contratto transitorio 12 mesi.',
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
