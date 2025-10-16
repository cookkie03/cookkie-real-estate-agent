import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Inizio seeding del database V3...');

  // Pulisci database esistente (in ordine corretto per FK)
  await prisma.auditLog.deleteMany();
  await prisma.entityTag.deleteMany();
  await prisma.tag.deleteMany();
  await prisma.activity.deleteMany();
  await prisma.match.deleteMany();
  await prisma.request.deleteMany();
  await prisma.property.deleteMany();
  await prisma.building.deleteMany();
  await prisma.contact.deleteMany();
  await prisma.userProfile.deleteMany();

  console.log('✅ Database pulito');

  // ============================================================================
  // USER PROFILE
  // ============================================================================

  const userProfile = await prisma.userProfile.create({
    data: {
      fullName: 'Mario Agente',
      email: 'mario.agente@immobiliare.it',
      phone: '+39 335 1234567',
      agencyName: 'Immobiliare Milano Centro',
      agencyVat: 'IT01234567890',
      agencyAddress: 'Via Dante 15, 20121 Milano',
      settings: JSON.stringify({
        commissionPercent: 3.0,
        workHours: { start: '09:00', end: '19:00' },
        autoMatchEnabled: true,
        notificationEmail: true,
      }),
    },
  });

  console.log('✅ User profile creato');

  // ============================================================================
  // TAGS
  // ============================================================================

  const tags = await Promise.all([
    prisma.tag.create({ data: { name: 'Censimento', slug: 'censimento', category: 'source', color: '#8B5CF6', isSystem: true } }),
    prisma.tag.create({ data: { name: 'Web Scraping', slug: 'web-scraping', category: 'source', color: '#06B6D4', isSystem: true } }),
    prisma.tag.create({ data: { name: 'Catasto', slug: 'catasto', category: 'source', color: '#10B981', isSystem: true } }),
    prisma.tag.create({ data: { name: 'Portafoglio', slug: 'portafoglio', category: 'source', color: '#3B82F6', isSystem: true } }),
    prisma.tag.create({ data: { name: 'Da Verificare', slug: 'da-verificare', category: 'property_status', color: '#EF4444', isSystem: true } }),
    prisma.tag.create({ data: { name: 'Occasione', slug: 'occasione', category: 'property_feature', color: '#F59E0B', isSystem: true } }),
    prisma.tag.create({ data: { name: 'Luxury', slug: 'luxury', category: 'property_feature', color: '#F59E0B', isSystem: true } }),
    prisma.tag.create({ data: { name: 'VIP', slug: 'vip', category: 'contact_type', color: '#F59E0B', isSystem: true } }),
    prisma.tag.create({ data: { name: 'Investitore', slug: 'investitore', category: 'contact_type', color: '#10B981', isSystem: true } }),
    prisma.tag.create({ data: { name: 'Prima Casa', slug: 'prima-casa', category: 'contact_type', color: '#3B82F6', isSystem: true } }),
  ]);

  console.log(`✅ Creati ${tags.length} tags`);

  // ============================================================================
  // CONTACTS
  // ============================================================================

  const today = new Date();

  const contacts = await Promise.all([
    // Buyers - Alta priorità
    prisma.contact.create({
      data: {
        code: 'CNT-2025-0001',
        entityType: 'person',
        fullName: 'Laura Bianchi',
        firstName: 'Laura',
        lastName: 'Bianchi',
        primaryPhone: '+39 348 765 4321',
        primaryEmail: 'laura.bianchi@email.com',
        city: 'Milano',
        province: 'MI',
        source: 'website',
        leadScore: 85,
        importance: 'high',
        budgetMin: 280000,
        budgetMax: 350000,
        status: 'active',
        lastContactDate: new Date(today.getTime() - 2 * 24 * 60 * 60 * 1000),
        notes: 'Cliente molto motivata, cerca prima casa. Preferisce zone ben collegate con metro.',
        privacyFirstContact: true,
        privacyFirstContactDate: new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000),
        privacyExtended: true,
        privacyMarketing: true,
      },
    }),

    prisma.contact.create({
      data: {
        code: 'CNT-2025-0002',
        entityType: 'person',
        fullName: 'Marco Rossi',
        firstName: 'Marco',
        lastName: 'Rossi',
        primaryPhone: '+39 345 123 4567',
        primaryEmail: 'marco.rossi@email.com',
        city: 'Monza',
        province: 'MB',
        source: 'referral',
        leadScore: 92,
        importance: 'vip',
        budgetMin: 900000,
        budgetMax: 1300000,
        status: 'active',
        notes: 'Famiglia con 3 figli, cerca villa con giardino. Budget elevato.',
        privacyFirstContact: true,
        privacyExtended: true,
      },
    }),

    prisma.contact.create({
      data: {
        code: 'CNT-2025-0003',
        entityType: 'person',
        fullName: 'Giuseppe Verdi',
        firstName: 'Giuseppe',
        lastName: 'Verdi',
        primaryPhone: '+39 340 987 6543',
        primaryEmail: 'giuseppe.verdi@email.com',
        city: 'Milano',
        province: 'MI',
        source: 'cold_call',
        leadScore: 78,
        importance: 'high',
        budgetMin: 700000,
        budgetMax: 950000,
        status: 'active',
        notes: 'Professionista, cerca attico con terrazzo. Esigente sulle finiture.',
        privacyFirstContact: true,
      },
    }),

    // Property Owners
    prisma.contact.create({
      data: {
        code: 'CNT-2025-0004',
        entityType: 'person',
        fullName: 'Anna Proprietari',
        firstName: 'Anna',
        lastName: 'Proprietari',
        primaryPhone: '+39 333 456 7890',
        primaryEmail: 'anna.proprietari@email.com',
        street: 'Via Fiori Chiari',
        civic: '12',
        city: 'Milano',
        province: 'MI',
        zip: '20121',
        source: 'direct_contact',
        leadScore: 90,
        importance: 'high',
        status: 'active',
        notes: 'Proprietaria immobile Brera, incarico esclusivo.',
        privacyFirstContact: true,
        privacyExtended: true,
      },
    }),

    prisma.contact.create({
      data: {
        code: 'CNT-2025-0005',
        entityType: 'person',
        fullName: 'Paolo Venditore',
        firstName: 'Paolo',
        lastName: 'Venditore',
        primaryPhone: '+39 347 234 5678',
        primaryEmail: 'paolo.venditore@email.com',
        city: 'Milano',
        province: 'MI',
        source: 'website',
        leadScore: 75,
        importance: 'normal',
        status: 'active',
        notes: 'Propnet',
        privacyFirstContact: true,
      },
    }),

    // Altri contatti
    prisma.contact.create({
      data: {
        code: 'CNT-2025-0006',
        entityType: 'person',
        fullName: 'Francesca Blu',
        firstName: 'Francesca',
        lastName: 'Blu',
        primaryPhone: '+39 349 876 5432',
        primaryEmail: 'francesca.blu@email.com',
        city: 'Milano',
        province: 'MI',
        source: 'portal',
        leadScore: 70,
        importance: 'normal',
        budgetMin: 350000,
        budgetMax: 450000,
        status: 'active',
        notes: 'Cerca trilocale in zona centrale.',
        privacyFirstContact: true,
      },
    }),

    prisma.contact.create({
      data: {
        code: 'CNT-2025-0007',
        entityType: 'person',
        fullName: 'Andrea Investitore',
        firstName: 'Andrea',
        lastName: 'Investitore',
        primaryPhone: '+39 335 567 8901',
        primaryEmail: 'andrea.investitore@email.com',
        city: 'Milano',
        province: 'MI',
        source: 'referral',
        leadScore: 88,
        importance: 'high',
        budgetMin: 100000,
        budgetMax: 200000,
        status: 'active',
        notes: 'Investitore immobiliare, cerca monolocali per affitto.',
        privacyFirstContact: true,
        privacyExtended: true,
      },
    }),
  ]);

  console.log(`✅ Creati ${contacts.length} contacts`);

  // ============================================================================
  // BUILDINGS
  // ============================================================================

  const buildings = await Promise.all([
    prisma.building.create({
      data: {
        code: 'BLD-2025-0001',
        street: 'Via Fiori Chiari',
        civic: '12',
        city: 'Milano',
        province: 'MI',
        zip: '20121',
        latitude: 45.4719,
        longitude: 9.1881,
        yearBuilt: 1920,
        totalFloors: 5,
        totalUnits: 10,
        hasElevator: true,
        condition: 'good',
        lastSurveyDate: new Date(today.getTime() - 90 * 24 * 60 * 60 * 1000),
        unitsSurveyed: 10,
        unitsInterested: 3,
        administratorName: 'Studio Condominio Milano',
        administratorPhone: '+39 02 1234567',
        monthlyFeesAvg: 180,
      },
    }),

    prisma.building.create({
      data: {
        code: 'BLD-2025-0002',
        street: 'Corso Buenos Aires',
        civic: '78',
        city: 'Milano',
        province: 'MI',
        zip: '20124',
        latitude: 45.4773,
        longitude: 9.2058,
        yearBuilt: 1960,
        totalFloors: 8,
        totalUnits: 24,
        hasElevator: true,
        condition: 'excellent',
        unitsSurveyed: 5,
        unitsInterested: 1,
      },
    }),
  ]);

  console.log(`✅ Creati ${buildings.length} buildings`);

  // ============================================================================
  // PROPERTIES
  // ============================================================================

  const properties = await Promise.all([
    // Property 1: Elegante trilocale Brera
    prisma.property.create({
      data: {
        code: 'PROP-2025-0001',
        ownerContactId: contacts[3].id, // Anna Proprietari
        buildingId: buildings[0].id,
        status: 'available',
        visibility: 'public',
        source: 'direct_mandate',
        verified: true,
        street: 'Via Fiori Chiari',
        civic: '12',
        internal: 'Int. 5',
        floor: '3',
        city: 'Milano',
        province: 'MI',
        zone: 'Brera',
        zip: '20121',
        latitude: 45.4719,
        longitude: 9.1881,
        cadastralSheet: 'F123',
        cadastralParticle: '456',
        cadastralSubunit: '12',
        cadastralCategory: 'A/2',
        cadastralClass: '3',
        cadastralIncome: 850.50,
        contractType: 'sale',
        propertyType: 'apartment',
        propertyCategory: 'residential',
        sqmCommercial: 95,
        sqmLivable: 85,
        rooms: 3,
        bedrooms: 2,
        bathrooms: 2,
        hasElevator: true,
        hasParking: false,
        hasGarage: false,
        hasGarden: false,
        hasTerrace: false,
        hasBalcony: true,
        hasCellar: true,
        hasAlarm: false,
        furnished: false,
        condition: 'excellent',
        heatingType: 'autonomous',
        energyClass: 'B',
        orientation: 'south',
        yearBuilt: 1920,
        yearRenovated: 2022,
        priceSale: 485000,
        mandateType: 'exclusive',
        mandateStartDate: new Date(today.getTime() - 60 * 24 * 60 * 60 * 1000),
        mandateEndDate: new Date(today.getTime() + 120 * 24 * 60 * 60 * 1000),
        commissionPercent: 3,
        photosCount: 15,
        hasProfessionalPhotos: true,
        hasFloorPlan: true,
        title: 'Elegante trilocale in Brera',
        description: 'Splendido trilocale completamente ristrutturato nel cuore di Brera. Finiture di pregio, parquet, cucina abitabile, doppi servizi. Ideale per professionisti o coppia.',
        highlights: JSON.stringify(['Zona Brera', 'Ristrutturato 2022', 'Doppi servizi', 'Cucina abitabile']),
        publishedImmobiliare: true,
        publishedCasa: true,
        notes: 'Immobile di prestigio, facile da vendere.',
      },
    }),

    // Property 2: Attico Porta Venezia
    prisma.property.create({
      data: {
        code: 'PROP-2025-0002',
        ownerContactId: contacts[4].id,
        buildingId: buildings[1].id,
        status: 'available',
        visibility: 'public',
        source: 'direct_mandate',
        verified: true,
        street: 'Corso Buenos Aires',
        civic: '78',
        floor: '7',
        city: 'Milano',
        province: 'MI',
        zone: 'Porta Venezia',
        zip: '20124',
        latitude: 45.4773,
        longitude: 9.2058,
        contractType: 'sale',
        propertyType: 'apartment',
        propertyCategory: 'residential',
        sqmCommercial: 140,
        sqmLivable: 125,
        sqmTerrace: 60,
        rooms: 4,
        bedrooms: 3,
        bathrooms: 3,
        hasElevator: true,
        hasParking: true,
        hasGarage: true,
        hasTerrace: true,
        hasCellar: true,
        hasAlarm: true,
        condition: 'excellent',
        heatingType: 'autonomous',
        energyClass: 'A',
        orientation: 'south',
        yearBuilt: 1960,
        yearRenovated: 2021,
        priceSale: 890000,
        mandateType: 'exclusive',
        mandateStartDate: new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000),
        mandateEndDate: new Date(today.getTime() + 150 * 24 * 60 * 60 * 1000),
        commissionPercent: 3,
        photosCount: 20,
        hasProfessionalPhotos: true,
        hasVirtualTour: true,
        hasFloorPlan: true,
        title: 'Attico con terrazzo panoramico - Porta Venezia',
        description: 'Attico di prestigio con terrazzo di 60mq e vista panoramica sulla città. Doppio salone, cucina abitabile, 3 camere, 3 bagni. Box auto doppio.',
        highlights: JSON.stringify(['Terrazzo 60mq', 'Vista panoramica', 'Box doppio', 'Classe A']),
        publishedImmobiliare: true,
        publishedCasa: true,
        publishedIdealista: true,
        viewsCount: 245,
        inquiriesCount: 12,
        visitsCount: 3,
        daysOnMarket: 30,
      },
    }),

    // Property 3: Bilocale Isola (economico, moderno)
    prisma.property.create({
      data: {
        code: 'PROP-2025-0003',
        status: 'available',
        visibility: 'public',
        source: 'web_scraping',
        sourceUrl: 'https://immobiliare.it/property-123',
        verified: false,
        street: 'Via Borsieri',
        civic: '34',
        floor: '2',
        city: 'Milano',
        province: 'MI',
        zone: 'Isola',
        zip: '20159',
        latitude: 45.4869,
        longitude: 9.1897,
        contractType: 'sale',
        propertyType: 'apartment',
        propertyCategory: 'residential',
        sqmCommercial: 55,
        sqmLivable: 50,
        rooms: 2,
        bedrooms: 1,
        bathrooms: 1,
        hasElevator: true,
        hasBalcony: true,
        condition: 'new',
        heatingType: 'autonomous',
        energyClass: 'A+',
        yearBuilt: 2020,
        priceSale: 320000,
        photosCount: 8,
        title: 'Bilocale moderno zona Isola',
        description: 'Bilocale di nuova costruzione in zona Isola, vicino a Porta Garibaldi. Open space con cucina a vista, camera matrimoniale, bagno finestrato.',
        highlights: JSON.stringify(['Nuova costruzione', 'Zona Isola', 'Classe A+', 'Metro vicina']),
        publishedImmobiliare: true,
        viewsCount: 180,
        inquiriesCount: 8,
        daysOnMarket: 15,
      },
    }),

    // Property 4: Villa San Siro
    prisma.property.create({
      data: {
        code: 'PROP-2025-0004',
        status: 'available',
        visibility: 'public',
        source: 'direct_mandate',
        verified: true,
        street: 'Via Ippodromo',
        civic: '45',
        city: 'Milano',
        province: 'MI',
        zone: 'San Siro',
        zip: '20151',
        latitude: 45.4781,
        longitude: 9.1236,
        contractType: 'sale',
        propertyType: 'villa',
        propertyCategory: 'residential',
        sqmCommercial: 280,
        sqmLivable: 250,
        sqmGarden: 400,
        rooms: 6,
        bedrooms: 4,
        bathrooms: 4,
        hasParking: true,
        hasGarage: true,
        hasGarden: true,
        hasTerrace: true,
        hasCellar: true,
        hasAlarm: true,
        condition: 'good',
        heatingType: 'autonomous',
        energyClass: 'C',
        yearBuilt: 1985,
        yearRenovated: 2018,
        priceSale: 1250000,
        mandateType: 'non_exclusive',
        photosCount: 25,
        hasProfessionalPhotos: true,
        title: 'Villa indipendente con giardino - San Siro',
        description: 'Villa indipendente su tre livelli con giardino privato di 400mq. Ampi spazi, 4 camere da letto, studio, taverna, box triplo.',
        highlights: JSON.stringify(['Villa indipendente', 'Giardino 400mq', 'Box triplo', '4 camere']),
        publishedImmobiliare: true,
      },
    }),

    // Property 5: Monolocale Lambrate (investimento)
    prisma.property.create({
      data: {
        code: 'PROP-2025-0005',
        status: 'available',
        visibility: 'public',
        source: 'census',
        verified: true,
        street: 'Via Conte Rosso',
        civic: '45',
        floor: '3',
        city: 'Milano',
        province: 'MI',
        zone: 'Lambrate',
        zip: '20134',
        latitude: 45.4897,
        longitude: 9.2453,
        contractType: 'sale',
        propertyType: 'apartment',
        propertyCategory: 'residential',
        sqmCommercial: 35,
        sqmLivable: 32,
        rooms: 1,
        bedrooms: 0,
        bathrooms: 1,
        hasElevator: true,
        hasBalcony: true,
        condition: 'fair',
        heatingType: 'centralized',
        energyClass: 'E',
        yearBuilt: 1975,
        priceSale: 145000,
        photosCount: 5,
        title: 'Monolocale zona Lambrate',
        description: 'Monolocale ideale per investimento o prima casa. Vicino metro, zona universitaria.',
        highlights: JSON.stringify(['Prezzo conveniente', 'Zona universitaria', 'Metro vicina']),
        notes: 'Da proporre ad investitori.',
      },
    }),
  ]);

  console.log(`✅ Creati ${properties.length} properties`);

  // ============================================================================
  // REQUESTS
  // ============================================================================

  const requests = await Promise.all([
    // Request 1: Laura Bianchi cerca trilocale
    prisma.request.create({
      data: {
        code: 'REQ-2025-0001',
        contactId: contacts[0].id, // Laura Bianchi
        requestType: 'search_buy',
        status: 'active',
        urgency: 'high',
        contractType: 'sale',
        searchCities: JSON.stringify(['Milano']),
        searchZones: JSON.stringify(['Isola', 'Porta Venezia', 'Loreto', 'Brera']),
        propertyTypes: JSON.stringify(['apartment']),
        priceMin: 280000,
        priceMax: 350000,
        sqmMin: 70,
        sqmMax: 100,
        roomsMin: 3,
        bedroomsMin: 2,
        requiresElevator: true,
        minCondition: 'good',
        minEnergyClass: 'C',
        notes: 'Cerca prima casa, preferisce zone centrali ben collegate.',
      },
    }),

    // Request 2: Marco Rossi cerca villa
    prisma.request.create({
      data: {
        code: 'REQ-2025-0002',
        contactId: contacts[1].id, // Marco Rossi
        requestType: 'search_buy',
        status: 'active',
        urgency: 'medium',
        contractType: 'sale',
        searchCities: JSON.stringify(['Milano', 'Monza', 'Sesto San Giovanni']),
        searchZones: JSON.stringify(['San Siro', 'Centro Monza']),
        propertyTypes: JSON.stringify(['villa', 'house']),
        priceMin: 900000,
        priceMax: 1300000,
        sqmMin: 200,
        roomsMin: 5,
        bedroomsMin: 3,
        bathroomsMin: 2,
        requiresGarden: true,
        requiresParking: true,
        notes: 'Famiglia numerosa, necessario giardino grande e garage.',
      },
    }),

    // Request 3: Andrea Investitore cerca monolocali
    prisma.request.create({
      data: {
        code: 'REQ-2025-0003',
        contactId: contacts[6].id, // Andrea Investitore
        requestType: 'search_buy',
        status: 'active',
        urgency: 'low',
        contractType: 'sale',
        searchCities: JSON.stringify(['Milano']),
        searchZones: JSON.stringify(['Lambrate', 'Città Studi', 'Bicocca']),
        propertyTypes: JSON.stringify(['apartment', 'studio']),
        priceMin: 100000,
        priceMax: 180000,
        sqmMin: 25,
        sqmMax: 45,
        roomsMin: 1,
        roomsMax: 1,
        notes: 'Cerca investimenti per affitto a studenti. Interessato a più unità.',
      },
    }),
  ]);

  console.log(`✅ Creati ${requests.length} requests`);

  // ============================================================================
  // MATCHES (Auto-generated from algorithm)
  // ============================================================================

  const matches = await Promise.all([
    // Match: Laura Bianchi <> Bilocale Isola (score 75 - buono ma non perfetto, è un bilocale non trilocale)
    prisma.match.create({
      data: {
        requestId: requests[0].id,
        propertyId: properties[2].id,
        contactId: contacts[0].id,
        scoreTotal: 75,
        scoreLocation: 95, // Zona perfetta (Isola)
        scorePrice: 92, // Prezzo ottimo (320k vs 280-350k)
        scoreSize: 65, // Piccolo (55mq vs min 70mq)
        scoreFeatures: 85, // Ha ascensore, moderno
        status: 'suggested',
      },
    }),

    // Match: Marco Rossi <> Villa San Siro (score 95 - perfetto)
    prisma.match.create({
      data: {
        requestId: requests[1].id,
        propertyId: properties[3].id,
        contactId: contacts[1].id,
        scoreTotal: 95,
        scoreLocation: 100,
        scorePrice: 95,
        scoreSize: 90,
        scoreFeatures: 100,
        status: 'sent',
        sentDate: new Date(today.getTime() - 5 * 24 * 60 * 60 * 1000),
        agentNotes: 'Match perfetto, cliente molto interessato.',
      },
    }),

    // Match: Andrea Investitore <> Monolocale Lambrate (score 92 - ottimo per investimento)
    prisma.match.create({
      data: {
        requestId: requests[2].id,
        propertyId: properties[4].id,
        contactId: contacts[6].id,
        scoreTotal: 92,
        scoreLocation: 100,
        scorePrice: 95,
        scoreSize: 85,
        scoreFeatures: 90,
        status: 'viewed',
        sentDate: new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000),
        viewedDate: new Date(today.getTime() - 6 * 24 * 60 * 60 * 1000),
        clientReaction: 'positive',
        clientNotes: 'Interessato, vuole visitare.',
      },
    }),
  ]);

  console.log(`✅ Creati ${matches.length} matches`);

  // ============================================================================
  // ACTIVITIES
  // ============================================================================

  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const nextWeek = new Date(today);
  nextWeek.setDate(nextWeek.getDate() + 7);

  const activities = await Promise.all([
    // Activity 1: Chiamata in uscita
    prisma.activity.create({
      data: {
        contactId: contacts[0].id, // Laura Bianchi
        activityType: 'call_out',
        status: 'completed',
        priority: 'high',
        scheduledAt: new Date(today.getTime() - 2 * 24 * 60 * 60 * 1000),
        completedAt: new Date(today.getTime() - 2 * 24 * 60 * 60 * 1000),
        title: 'Chiamata conoscitiva Laura Bianchi',
        description: 'Prima chiamata per comprendere esigenze cliente',
        outcome: 'Cliente molto interessata, cerca trilocale zona Isola. Budget 280-350k.',
        details: JSON.stringify({
          durationSeconds: 420,
          answered: true,
          callOutcome: 'positive',
        }),
      },
    }),

    // Activity 2: Viewing programmata
    prisma.activity.create({
      data: {
        contactId: contacts[1].id, // Marco Rossi
        propertyId: properties[3].id, // Villa San Siro
        activityType: 'viewing',
        status: 'scheduled',
        priority: 'high',
        scheduledAt: tomorrow,
        title: 'Visita Villa San Siro con famiglia Rossi',
        description: 'Visita programmata alle 10:00. Portare planimetrie aggiornate.',
        reminderEnabled: true,
        reminderMinutesBefore: 60,
      },
    }),

    // Activity 3: Email inviata
    prisma.activity.create({
      data: {
        contactId: contacts[0].id,
        requestId: requests[0].id,
        activityType: 'email_out',
        status: 'completed',
        priority: 'normal',
        completedAt: new Date(today.getTime() - 1 * 24 * 60 * 60 * 1000),
        title: 'Invio proposte immobiliari Laura Bianchi',
        description: 'Inviate 3 proposte via email con schede dettagliate',
        outcome: 'Email inviata con successo, cliente ha confermato ricezione',
      },
    }),

    // Activity 4: Task da completare
    prisma.activity.create({
      data: {
        propertyId: properties[1].id, // Attico Porta Venezia
        activityType: 'task',
        status: 'scheduled',
        priority: 'normal',
        dueDate: nextWeek,
        title: 'Programmare servizio fotografico professionale',
        description: 'Contattare fotografo per aggiornare foto attico',
        details: JSON.stringify({
          checklist: [
            { item: 'Chiamare fotografo', done: false },
            { item: 'Fissare appuntamento', done: false },
            { item: 'Preparare immobile', done: false },
          ],
        }),
      },
    }),

    // Activity 5: Offerta ricevuta
    prisma.activity.create({
      data: {
        contactId: contacts[1].id,
        propertyId: properties[3].id,
        activityType: 'offer_received',
        status: 'completed',
        priority: 'urgent',
        completedAt: new Date(today.getTime() - 3 * 24 * 60 * 60 * 1000),
        title: 'Offerta Marco Rossi per Villa San Siro',
        description: 'Cliente ha presentato offerta formale',
        outcome: 'Offerta presentata al proprietario, in attesa risposta',
        details: JSON.stringify({
          offerAmount: 1180000,
          conditions: 'Soggetto a mutuo bancario',
          validityDays: 7,
        }),
      },
    }),
  ]);

  console.log(`✅ Creati ${activities.length} activities`);

  // ============================================================================
  // AUDIT LOG (alcuni esempi)
  // ============================================================================

  const auditLogs = await Promise.all([
    prisma.auditLog.create({
      data: {
        entityType: 'property',
        entityId: properties[0].id,
        entityCode: 'PROP-2025-0001',
        actionType: 'created',
        changedFields: JSON.stringify(['all']),
        newValues: JSON.stringify({ status: 'available', price: 485000 }),
        changesSummary: 'Immobile creato con incarico esclusivo',
        changedAt: new Date(today.getTime() - 60 * 24 * 60 * 60 * 1000),
      },
    }),

    prisma.auditLog.create({
      data: {
        entityType: 'property',
        entityId: properties[1].id,
        entityCode: 'PROP-2025-0002',
        actionType: 'updated',
        changedFields: JSON.stringify(['priceSale', 'updatedAt']),
        oldValues: JSON.stringify({ priceSale: 920000 }),
        newValues: JSON.stringify({ priceSale: 890000 }),
        changesSummary: 'Riduzione prezzo richiesta dal proprietario',
        changedAt: new Date(today.getTime() - 15 * 24 * 60 * 60 * 1000),
      },
    }),

    prisma.auditLog.create({
      data: {
        entityType: 'contact',
        entityId: contacts[0].id,
        entityCode: 'CNT-2025-0001',
        actionType: 'status_changed',
        changedFields: JSON.stringify(['leadScore']),
        oldValues: JSON.stringify({ leadScore: 70 }),
        newValues: JSON.stringify({ leadScore: 85 }),
        changesSummary: 'Lead score aumentato dopo visita',
        changedAt: new Date(today.getTime() - 5 * 24 * 60 * 60 * 1000),
      },
    }),
  ]);

  console.log(`✅ Creati ${auditLogs.length} audit logs`);

  // ============================================================================
  // RIEPILOGO
  // ============================================================================

  console.log('\n🎉 Seeding completato con successo!');
  console.log('=====================================');
  console.log(`👤 User Profile: 1`);
  console.log(`🏷️  Tags: ${tags.length}`);
  console.log(`👥 Contacts: ${contacts.length}`);
  console.log(`🏢 Buildings: ${buildings.length}`);
  console.log(`🏠 Properties: ${properties.length}`);
  console.log(`📋 Requests: ${requests.length}`);
  console.log(`🎯 Matches: ${matches.length}`);
  console.log(`📅 Activities: ${activities.length}`);
  console.log(`📜 Audit Logs: ${auditLogs.length}`);
  console.log('=====================================\n');
}

main()
  .catch((e) => {
    console.error('❌ Errore durante il seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
