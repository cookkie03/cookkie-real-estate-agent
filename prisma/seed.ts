import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Inizio seeding del database...');

  // Pulisci database esistente
  await prisma.azione.deleteMany();
  await prisma.match.deleteMany();
  await prisma.cliente.deleteMany();
  await prisma.immobile.deleteMany();

  console.log('✅ Database pulito');

  // ============================================================================
  // IMMOBILI
  // ============================================================================

  const immobili = await Promise.all([
    // Appartamenti Milano Centro
    prisma.immobile.create({
      data: {
        titolo: 'Elegante trilocale in Brera',
        tipologia: 'appartamento',
        prezzo: 485000,
        superficie: 95,
        locali: 3,
        bagni: 2,
        indirizzo: 'Via Fiori Chiari 12',
        citta: 'Milano',
        cap: '20121',
        provincia: 'MI',
        zona: 'Brera',
        latitudine: 45.4719,
        longitudine: 9.1881,
        descrizione: 'Splendido trilocale completamente ristrutturato nel cuore di Brera. Finiture di pregio, parquet, cucina abitabile, doppi servizi. Ideale per professionisti o coppia.',
        caratteristiche: JSON.stringify({
          ascensore: true,
          balcone: true,
          terrazzo: false,
          cantina: true,
          boxAuto: false,
          riscaldamentoAutonomo: true,
          climatizzatore: true,
          piano: 3,
          annoCostruzione: 1920,
          annoRistrutturazione: 2022,
        }),
        foto: JSON.stringify([
          'https://images.unsplash.com/photo-1502672260066-6bc35f0a1f80?w=800',
          'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800',
          'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800',
        ]),
        fonte: 'Agenzia',
        stato: 'disponibile',
      },
    }),

    prisma.immobile.create({
      data: {
        titolo: 'Attico con terrazzo panoramico - Porta Venezia',
        tipologia: 'attico',
        prezzo: 890000,
        superficie: 140,
        locali: 4,
        bagni: 3,
        indirizzo: 'Corso Buenos Aires 78',
        citta: 'Milano',
        cap: '20124',
        provincia: 'MI',
        zona: 'Porta Venezia',
        latitudine: 45.4773,
        longitudine: 9.2058,
        descrizione: 'Attico di prestigio con terrazzo di 60mq e vista panoramica sulla città. Doppio salone, cucina abitabile, 3 camere, 3 bagni. Box auto doppio.',
        caratteristiche: JSON.stringify({
          ascensore: true,
          balcone: false,
          terrazzo: true,
          cantina: true,
          boxAuto: true,
          riscaldamentoAutonomo: true,
          climatizzatore: true,
          piano: 7,
          annoCostruzione: 1960,
          annoRistrutturazione: 2021,
        }),
        foto: JSON.stringify([
          'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800',
          'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800',
          'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800',
        ]),
        fonte: 'Agenzia',
        stato: 'disponibile',
      },
    }),

    prisma.immobile.create({
      data: {
        titolo: 'Bilocale moderno zona Isola',
        tipologia: 'appartamento',
        prezzo: 320000,
        superficie: 55,
        locali: 2,
        bagni: 1,
        indirizzo: 'Via Borsieri 34',
        citta: 'Milano',
        cap: '20159',
        provincia: 'MI',
        zona: 'Isola',
        latitudine: 45.4869,
        longitudine: 9.1897,
        descrizione: 'Bilocale di nuova costruzione in zona Isola, vicino a Porta Garibaldi. Open space con cucina a vista, camera matrimoniale, bagno finestrato. Classe energetica A.',
        caratteristiche: JSON.stringify({
          ascensore: true,
          balcone: true,
          terrazzo: false,
          cantina: false,
          boxAuto: false,
          riscaldamentoAutonomo: true,
          climatizzatore: true,
          piano: 2,
          annoCostruzione: 2020,
        }),
        foto: JSON.stringify([
          'https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800',
          'https://images.unsplash.com/photo-1556912173-46c336c7fd55?w=800',
        ]),
        fonte: 'Portale',
        urlOriginale: 'https://example.com/immobile-123',
        stato: 'disponibile',
      },
    }),

    // Ville e case indipendenti
    prisma.immobile.create({
      data: {
        titolo: 'Villa indipendente con giardino - San Siro',
        tipologia: 'villa',
        prezzo: 1250000,
        superficie: 280,
        locali: 6,
        bagni: 4,
        indirizzo: 'Via Ippodromo 45',
        citta: 'Milano',
        cap: '20151',
        provincia: 'MI',
        zona: 'San Siro',
        latitudine: 45.4781,
        longitudine: 9.1236,
        descrizione: 'Villa indipendente su tre livelli con giardino privato di 400mq. Ampi spazi, 4 camere da letto, studio, taverna, box triplo. Ideale per famiglie.',
        caratteristiche: JSON.stringify({
          ascensore: false,
          balcone: true,
          terrazzo: true,
          cantina: true,
          boxAuto: true,
          riscaldamentoAutonomo: true,
          climatizzatore: true,
          piano: 0,
          annoCostruzione: 1985,
          annoRistrutturazione: 2018,
        }),
        foto: JSON.stringify([
          'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800',
          'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800',
          'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800',
        ]),
        fonte: 'Agenzia',
        stato: 'disponibile',
      },
    }),

    prisma.immobile.create({
      data: {
        titolo: 'Loft industriale zona Navigli',
        tipologia: 'loft',
        prezzo: 650000,
        superficie: 120,
        locali: 2,
        bagni: 2,
        indirizzo: 'Alzaia Naviglio Grande 88',
        citta: 'Milano',
        cap: '20144',
        provincia: 'MI',
        zona: 'Navigli',
        latitudine: 45.4484,
        longitudine: 9.1696,
        descrizione: 'Loft di design ricavato da ex fabbrica, soffitti alti 4 metri, soppalco, grandi vetrate. Perfetto per chi cerca spazi unici e caratteristici.',
        caratteristiche: JSON.stringify({
          ascensore: true,
          balcone: false,
          terrazzo: false,
          cantina: true,
          boxAuto: true,
          riscaldamentoAutonomo: true,
          climatizzatore: true,
          piano: 1,
          annoCostruzione: 1950,
          annoRistrutturazione: 2019,
        }),
        foto: JSON.stringify([
          'https://images.unsplash.com/photo-1600607687644-c7171b42498b?w=800',
          'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?w=800',
        ]),
        fonte: 'Agenzia',
        stato: 'disponibile',
      },
    }),

    // Appartamenti zona City Life
    prisma.immobile.create({
      data: {
        titolo: 'Quadrilocale moderno City Life',
        tipologia: 'appartamento',
        prezzo: 720000,
        superficie: 115,
        locali: 4,
        bagni: 2,
        indirizzo: 'Via Spinola 12',
        citta: 'Milano',
        cap: '20149',
        provincia: 'MI',
        zona: 'City Life',
        latitudine: 45.4781,
        longitudine: 9.1567,
        descrizione: 'Appartamento di nuova costruzione nel complesso City Life. Finiture di lusso, domotica, aria condizionata, box auto. Vista sul parco.',
        caratteristiche: JSON.stringify({
          ascensore: true,
          balcone: true,
          terrazzo: false,
          cantina: true,
          boxAuto: true,
          riscaldamentoAutonomo: true,
          climatizzatore: true,
          piano: 5,
          annoCostruzione: 2018,
        }),
        foto: JSON.stringify([
          'https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=800',
          'https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=800',
        ]),
        fonte: 'Agenzia',
        stato: 'disponibile',
      },
    }),

    // Immobili in trattativa/venduti
    prisma.immobile.create({
      data: {
        titolo: 'Trilocale luminoso zona Loreto',
        tipologia: 'appartamento',
        prezzo: 380000,
        superficie: 85,
        locali: 3,
        bagni: 1,
        indirizzo: 'Viale Monza 156',
        citta: 'Milano',
        cap: '20127',
        provincia: 'MI',
        zona: 'Loreto',
        latitudine: 45.4865,
        longitudine: 9.2177,
        descrizione: 'Trilocale luminoso, ben tenuto, in zona servita. Cucina abitabile, due camere, balcone. Ideale prima casa.',
        caratteristiche: JSON.stringify({
          ascensore: true,
          balcone: true,
          terrazzo: false,
          cantina: true,
          boxAuto: false,
          riscaldamentoAutonomo: false,
          climatizzatore: false,
          piano: 4,
          annoCostruzione: 1970,
        }),
        foto: JSON.stringify([
          'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800',
        ]),
        fonte: 'Agenzia',
        stato: 'in_trattativa',
      },
    }),

    prisma.immobile.create({
      data: {
        titolo: 'Bilocale ristrutturato Porta Romana',
        tipologia: 'appartamento',
        prezzo: 295000,
        superficie: 50,
        locali: 2,
        bagni: 1,
        indirizzo: 'Via Orti 23',
        citta: 'Milano',
        cap: '20122',
        provincia: 'MI',
        zona: 'Porta Romana',
        latitudine: 45.4515,
        longitudine: 9.2034,
        descrizione: 'Bilocale completamente ristrutturato, pronto da abitare. Cucina nuova, bagno moderno, parquet.',
        caratteristiche: JSON.stringify({
          ascensore: false,
          balcone: true,
          terrazzo: false,
          cantina: false,
          boxAuto: false,
          riscaldamentoAutonomo: true,
          climatizzatore: true,
          piano: 2,
          annoCostruzione: 1950,
          annoRistrutturazione: 2023,
        }),
        foto: JSON.stringify([
          'https://images.unsplash.com/photo-1600566753151-384129cf4e3e?w=800',
        ]),
        fonte: 'Portale',
        urlOriginale: 'https://example.com/immobile-456',
        stato: 'venduto',
      },
    }),

    // Altri immobili varie zone
    prisma.immobile.create({
      data: {
        titolo: 'Mansarda con terrazzo zona Sempione',
        tipologia: 'mansarda',
        prezzo: 420000,
        superficie: 75,
        locali: 2,
        bagni: 1,
        indirizzo: 'Via Procaccini 67',
        citta: 'Milano',
        cap: '20154',
        provincia: 'MI',
        zona: 'Sempione',
        latitudine: 45.4842,
        longitudine: 9.1689,
        descrizione: 'Mansarda luminosa con terrazzo di 30mq, travi a vista, open space. Zona tranquilla e ben servita.',
        caratteristiche: JSON.stringify({
          ascensore: true,
          balcone: false,
          terrazzo: true,
          cantina: true,
          boxAuto: false,
          riscaldamentoAutonomo: true,
          climatizzatore: true,
          piano: 5,
          annoCostruzione: 1930,
          annoRistrutturazione: 2020,
        }),
        foto: JSON.stringify([
          'https://images.unsplash.com/photo-1600585154363-67eb9e2e2099?w=800',
          'https://images.unsplash.com/photo-1600566752355-35792bedcfea?w=800',
        ]),
        fonte: 'Agenzia',
        stato: 'disponibile',
      },
    }),

    prisma.immobile.create({
      data: {
        titolo: 'Appartamento signorile zona Magenta',
        tipologia: 'appartamento',
        prezzo: 580000,
        superficie: 110,
        locali: 4,
        bagni: 2,
        indirizzo: 'Corso Magenta 45',
        citta: 'Milano',
        cap: '20123',
        provincia: 'MI',
        zona: 'Magenta',
        latitudine: 45.4654,
        longitudine: 9.1712,
        descrizione: 'Appartamento signorile in palazzo d\'epoca, soffitti alti, affreschi, doppi servizi. Zona prestigiosa.',
        caratteristiche: JSON.stringify({
          ascensore: true,
          balcone: true,
          terrazzo: false,
          cantina: true,
          boxAuto: false,
          riscaldamentoAutonomo: false,
          climatizzatore: false,
          piano: 2,
          annoCostruzione: 1900,
        }),
        foto: JSON.stringify([
          'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?w=800',
        ]),
        fonte: 'Agenzia',
        stato: 'disponibile',
      },
    }),

    // Immobili fuori Milano
    prisma.immobile.create({
      data: {
        titolo: 'Villa con piscina - Monza',
        tipologia: 'villa',
        prezzo: 980000,
        superficie: 250,
        locali: 5,
        bagni: 3,
        indirizzo: 'Via Parco 12',
        citta: 'Monza',
        cap: '20900',
        provincia: 'MB',
        zona: 'Centro',
        latitudine: 45.5845,
        longitudine: 9.2744,
        descrizione: 'Villa di prestigio con piscina e giardino di 800mq. Finiture di lusso, domotica, impianto fotovoltaico.',
        caratteristiche: JSON.stringify({
          ascensore: false,
          balcone: true,
          terrazzo: true,
          cantina: true,
          boxAuto: true,
          riscaldamentoAutonomo: true,
          climatizzatore: true,
          piano: 0,
          annoCostruzione: 2015,
        }),
        foto: JSON.stringify([
          'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800',
          'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800',
        ]),
        fonte: 'Agenzia',
        stato: 'disponibile',
      },
    }),

    prisma.immobile.create({
      data: {
        titolo: 'Trilocale con giardino - Sesto San Giovanni',
        tipologia: 'appartamento',
        prezzo: 280000,
        superficie: 80,
        locali: 3,
        bagni: 1,
        indirizzo: 'Via Gramsci 89',
        citta: 'Sesto San Giovanni',
        cap: '20099',
        provincia: 'MI',
        zona: 'Centro',
        latitudine: 45.5387,
        longitudine: 9.2284,
        descrizione: 'Trilocale al piano terra con giardino privato di 50mq. Ideale per famiglie con bambini o animali.',
        caratteristiche: JSON.stringify({
          ascensore: false,
          balcone: false,
          terrazzo: false,
          cantina: true,
          boxAuto: true,
          riscaldamentoAutonomo: true,
          climatizzatore: false,
          piano: 0,
          annoCostruzione: 1980,
        }),
        foto: JSON.stringify([
          'https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=800',
        ]),
        fonte: 'Portale',
        urlOriginale: 'https://example.com/immobile-789',
        stato: 'disponibile',
      },
    }),

    // Immobili commerciali/uffici
    prisma.immobile.create({
      data: {
        titolo: 'Ufficio open space zona Bicocca',
        tipologia: 'ufficio',
        prezzo: 350000,
        superficie: 120,
        locali: 3,
        bagni: 2,
        indirizzo: 'Viale Sarca 336',
        citta: 'Milano',
        cap: '20126',
        provincia: 'MI',
        zona: 'Bicocca',
        latitudine: 45.5217,
        longitudine: 9.2112,
        descrizione: 'Ufficio open space in zona Bicocca, vicino università e metro. Ideale per startup o studi professionali.',
        caratteristiche: JSON.stringify({
          ascensore: true,
          balcone: false,
          terrazzo: false,
          cantina: false,
          boxAuto: true,
          riscaldamentoAutonomo: true,
          climatizzatore: true,
          piano: 3,
          annoCostruzione: 2010,
        }),
        foto: JSON.stringify([
          'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800',
        ]),
        fonte: 'Agenzia',
        stato: 'disponibile',
      },
    }),

    prisma.immobile.create({
      data: {
        titolo: 'Negozio con vetrina zona Duomo',
        tipologia: 'negozio',
        prezzo: 450000,
        superficie: 60,
        locali: 2,
        bagni: 1,
        indirizzo: 'Via Torino 28',
        citta: 'Milano',
        cap: '20123',
        provincia: 'MI',
        zona: 'Duomo',
        latitudine: 45.4612,
        longitudine: 9.1878,
        descrizione: 'Negozio con ampia vetrina in zona di grande passaggio. Ideale per attività commerciale o showroom.',
        caratteristiche: JSON.stringify({
          ascensore: false,
          balcone: false,
          terrazzo: false,
          cantina: true,
          boxAuto: false,
          riscaldamentoAutonomo: true,
          climatizzatore: true,
          piano: 0,
          annoCostruzione: 1950,
          annoRistrutturazione: 2021,
        }),
        foto: JSON.stringify([
          'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800',
        ]),
        fonte: 'Agenzia',
        stato: 'disponibile',
      },
    }),

    // Immobili economici
    prisma.immobile.create({
      data: {
        titolo: 'Monolocale zona Lambrate',
        tipologia: 'monolocale',
        prezzo: 145000,
        superficie: 35,
        locali: 1,
        bagni: 1,
        indirizzo: 'Via Conte Rosso 45',
        citta: 'Milano',
        cap: '20134',
        provincia: 'MI',
        zona: 'Lambrate',
        latitudine: 45.4897,
        longitudine: 9.2453,
        descrizione: 'Monolocale ideale per investimento o prima casa. Vicino metro, zona universitaria.',
        caratteristiche: JSON.stringify({
          ascensore: true,
          balcone: true,
          terrazzo: false,
          cantina: false,
          boxAuto: false,
          riscaldamentoAutonomo: false,
          climatizzatore: false,
          piano: 3,
          annoCostruzione: 1975,
        }),
        foto: JSON.stringify([
          'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800',
        ]),
        fonte: 'Portale',
        urlOriginale: 'https://example.com/immobile-101',
        stato: 'disponibile',
      },
    }),

    prisma.immobile.create({
      data: {
        titolo: 'Bilocale da ristrutturare zona Corvetto',
        tipologia: 'appartamento',
        prezzo: 180000,
        superficie: 55,
        locali: 2,
        bagni: 1,
        indirizzo: 'Viale Umbria 78',
        citta: 'Milano',
        cap: '20135',
        provincia: 'MI',
        zona: 'Corvetto',
        latitudine: 45.4456,
        longitudine: 9.2234,
        descrizione: 'Bilocale da ristrutturare, ottimo per investimento. Zona ben collegata con mezzi pubblici.',
        caratteristiche: JSON.stringify({
          ascensore: false,
          balcone: true,
          terrazzo: false,
          cantina: true,
          boxAuto: false,
          riscaldamentoAutonomo: false,
          climatizzatore: false,
          piano: 1,
          annoCostruzione: 1960,
        }),
        foto: JSON.stringify([
          'https://images.unsplash.com/photo-1600566752355-35792bedcfea?w=800',
        ]),
        fonte: 'Agenzia',
        stato: 'disponibile',
      },
    }),
  ]);

  console.log(`✅ Creati ${immobili.length} immobili`);

  // ============================================================================
  // CLIENTI
  // ============================================================================

  const clienti = await Promise.all([
    // Clienti alta priorità
    prisma.cliente.create({
      data: {
        nome: 'Laura',
        cognome: 'Bianchi',
        email: 'laura.bianchi@email.com',
        telefono: '+39 348 765 4321',
        tipologiaRichiesta: 'appartamento',
        budgetMin: 280000,
        budgetMax: 350000,
        superficieMin: 70,
        localiMin: 3,
        zoneInteresse: JSON.stringify(['Isola', 'Porta Venezia', 'Loreto']),
        priorita: 'alta',
        stato: 'attivo',
        note: 'Cliente molto motivata, cerca prima casa. Preferisce zone ben collegate con metro. Budget flessibile se trova immobile perfetto.',
      },
    }),

    prisma.cliente.create({
      data: {
        nome: 'Marco',
        cognome: 'Rossi',
        email: 'marco.rossi@email.com',
        telefono: '+39 345 123 4567',
        tipologiaRichiesta: 'villa',
        budgetMin: 900000,
        budgetMax: 1300000,
        superficieMin: 200,
        localiMin: 5,
        zoneInteresse: JSON.stringify(['San Siro', 'Monza', 'Brianza']),
        priorita: 'alta',
        stato: 'attivo',
        note: 'Famiglia con 3 figli, cerca villa con giardino. Necessario garage per 2 auto. Disponibile a valutare anche fuori Milano.',
      },
    }),

    prisma.cliente.create({
      data: {
        nome: 'Giuseppe',
        cognome: 'Verdi',
        email: 'giuseppe.verdi@email.com',
        telefono: '+39 340 987 6543',
        tipologiaRichiesta: 'attico',
        budgetMin: 700000,
        budgetMax: 950000,
        superficieMin: 120,
        localiMin: 4,
        zoneInteresse: JSON.stringify(['Brera', 'Porta Venezia', 'City Life']),
        priorita: 'alta',
        stato: 'in_trattativa',
        note: 'Professionista, cerca attico con terrazzo. Molto esigente sulle finiture. In trattativa per immobile in Porta Venezia.',
      },
    }),

    // Clienti media priorità
    prisma.cliente.create({
      data: {
        nome: 'Anna',
        cognome: 'Neri',
        email: 'anna.neri@email.com',
        telefono: '+39 333 456 7890',
        tipologiaRichiesta: 'appartamento',
        budgetMin: 200000,
        budgetMax: 280000,
        superficieMin: 50,
        localiMin: 2,
        zoneInteresse: JSON.stringify(['Lambrate', 'Corvetto', 'Porta Romana']),
        priorita: 'media',
        stato: 'attivo',
        note: 'Giovane coppia, cerca prima casa. Budget limitato, disponibili a valutare immobili da ristrutturare.',
      },
    }),

    prisma.cliente.create({
      data: {
        nome: 'Paolo',
        cognome: 'Gialli',
        email: 'paolo.gialli@email.com',
        telefono: '+39 347 234 5678',
        tipologiaRichiesta: 'loft',
        budgetMin: 500000,
        budgetMax: 700000,
        superficieMin: 100,
        localiMin: 2,
        zoneInteresse: JSON.stringify(['Navigli', 'Tortona', 'Isola']),
        priorita: 'media',
        stato: 'attivo',
        note: 'Architetto, cerca loft o spazi particolari. Interessato a immobili di design o da personalizzare.',
      },
    }),

    prisma.cliente.create({
      data: {
        nome: 'Francesca',
        cognome: 'Blu',
        email: 'francesca.blu@email.com',
        telefono: '+39 349 876 5432',
        tipologiaRichiesta: 'appartamento',
        budgetMin: 350000,
        budgetMax: 450000,
        superficieMin: 80,
        localiMin: 3,
        zoneInteresse: JSON.stringify(['Brera', 'Magenta', 'Sempione']),
        priorita: 'media',
        stato: 'attivo',
        note: 'Cerca trilocale in zona centrale. Preferisce palazzi d\'epoca con carattere.',
      },
    }),

    // Clienti bassa priorità / dormienti
    prisma.cliente.create({
      data: {
        nome: 'Roberto',
        cognome: 'Grigi',
        email: 'roberto.grigi@email.com',
        telefono: '+39 338 123 9876',
        tipologiaRichiesta: 'appartamento',
        budgetMin: 250000,
        budgetMax: 350000,
        superficieMin: 60,
        localiMin: 2,
        zoneInteresse: JSON.stringify(['Loreto', 'Città Studi', 'Lambrate']),
        priorita: 'bassa',
        stato: 'dormiente',
        note: 'Cliente poco reattivo, non risponde alle chiamate. Da ricontattare tra qualche mese.',
      },
    }),

    prisma.cliente.create({
      data: {
        nome: 'Silvia',
        cognome: 'Viola',
        email: 'silvia.viola@email.com',
        telefono: '+39 346 789 0123',
        tipologiaRichiesta: 'bilocale',
        budgetMin: 180000,
        budgetMax: 250000,
        superficieMin: 45,
        localiMin: 2,
        zoneInteresse: JSON.stringify(['Sesto San Giovanni', 'Cinisello', 'Monza']),
        priorita: 'bassa',
        stato: 'attivo',
        note: 'Cerca investimento per affitto. Non ha fretta, valuta solo occasioni.',
      },
    }),

    // Clienti per investimento
    prisma.cliente.create({
      data: {
        nome: 'Andrea',
        cognome: 'Marroni',
        email: 'andrea.marroni@email.com',
        telefono: '+39 335 567 8901',
        tipologiaRichiesta: 'monolocale',
        budgetMin: 100000,
        budgetMax: 180000,
        superficieMin: 30,
        localiMin: 1,
        zoneInteresse: JSON.stringify(['Lambrate', 'Città Studi', 'Bicocca']),
        priorita: 'media',
        stato: 'attivo',
        note: 'Investitore, cerca monolocali in zone universitarie per affitto a studenti. Interessato a più immobili.',
      },
    }),

    prisma.cliente.create({
      data: {
        nome: 'Elena',
        cognome: 'Arancioni',
        email: 'elena.arancioni@email.com',
        telefono: '+39 342 345 6789',
        tipologiaRichiesta: 'ufficio',
        budgetMin: 250000,
        budgetMax: 400000,
        superficieMin: 80,
        localiMin: 3,
        zoneInteresse: JSON.stringify(['Bicocca', 'Porta Nuova', 'City Life']),
        priorita: 'media',
        stato: 'attivo',
        note: 'Imprenditrice, cerca ufficio per la sua azienda. Preferisce zone moderne e ben collegate.',
      },
    }),

    // Clienti conclusi
    prisma.cliente.create({
      data: {
        nome: 'Luca',
        cognome: 'Verdi',
        email: 'luca.verdi@email.com',
        telefono: '+39 339 234 5678',
        tipologiaRichiesta: 'appartamento',
        budgetMin: 280000,
        budgetMax: 320000,
        superficieMin: 50,
        localiMin: 2,
        zoneInteresse: JSON.stringify(['Porta Romana', 'Corvetto']),
        priorita: 'bassa',
        stato: 'concluso',
        note: 'Cliente ha acquistato bilocale in Porta Romana. Trattativa conclusa con successo.',
      },
    }),

    // Altri clienti vari
    prisma.cliente.create({
      data: {
        nome: 'Martina',
        cognome: 'Rosa',
        email: 'martina.rosa@email.com',
        telefono: '+39 344 678 9012',
        tipologiaRichiesta: 'appartamento',
        budgetMin: 400000,
        budgetMax: 550000,
        superficieMin: 90,
        localiMin: 3,
        zoneInteresse: JSON.stringify(['City Life', 'Porta Nuova', 'Isola']),
        priorita: 'alta',
        stato: 'attivo',
        note: 'Manager, cerca trilocale moderno in zona nuova. Disponibilità immediata per visite.',
      },
    }),

    prisma.cliente.create({
      data: {
        nome: 'Davide',
        cognome: 'Celesti',
        email: 'davide.celesti@email.com',
        telefono: '+39 341 890 1234',
        tipologiaRichiesta: 'mansarda',
        budgetMin: 350000,
        budgetMax: 450000,
        superficieMin: 65,
        localiMin: 2,
        zoneInteresse: JSON.stringify(['Sempione', 'Brera', 'Porta Venezia']),
        priorita: 'media',
        stato: 'attivo',
        note: 'Cerca mansarda con terrazzo. Appassionato di design, valuta solo immobili particolari.',
      },
    }),

    prisma.cliente.create({
      data: {
        nome: 'Chiara',
        cognome: 'Turchesi',
        email: 'chiara.turchesi@email.com',
        telefono: '+39 337 123 4567',
        tipologiaRichiesta: 'villa',
        budgetMin: 800000,
        budgetMax: 1100000,
        superficieMin: 180,
        localiMin: 4,
        zoneInteresse: JSON.stringify(['Monza', 'Brianza', 'San Siro']),
        priorita: 'alta',
        stato: 'attivo',
        note: 'Famiglia numerosa, cerca villa con giardino grande. Necessario spazio per home office.',
      },
    }),

    prisma.cliente.create({
      data: {
        nome: 'Stefano',
        cognome: 'Perla',
        email: 'stefano.perla@email.com',
        telefono: '+39 336 987 6543',
        tipologiaRichiesta: 'negozio',
        budgetMin: 300000,
        budgetMax: 500000,
        superficieMin: 50,
        localiMin: 2,
        zoneInteresse: JSON.stringify(['Duomo', 'Brera', 'Corso Buenos Aires']),
        priorita: 'media',
        stato: 'attivo',
        note: 'Commerciante, cerca negozio in zona di passaggio per aprire attività. Valuta anche affitto.',
      },
    }),

    prisma.cliente.create({
      data: {
        nome: 'Valentina',
        cognome: 'Corallo',
        email: 'valentina.corallo@email.com',
        telefono: '+39 343 456 7890',
        tipologiaRichiesta: 'appartamento',
        budgetMin: 450000,
        budgetMax: 600000,
        superficieMin: 100,
        localiMin: 4,
        zoneInteresse: JSON.stringify(['Magenta', 'Brera', 'Porta Venezia']),
        priorita: 'media',
        stato: 'attivo',
        note: 'Cerca quadrilocale in palazzo d\'epoca. Preferisce immobili con caratteristiche storiche.',
      },
    }),

    prisma.cliente.create({
      data: {
        nome: 'Federico',
        cognome: 'Ambra',
        email: 'federico.ambra@email.com',
        telefono: '+39 348 234 5678',
        tipologiaRichiesta: 'bilocale',
        budgetMin: 250000,
        budgetMax: 350000,
        superficieMin: 55,
        localiMin: 2,
        zoneInteresse: JSON.stringify(['Isola', 'Porta Garibaldi', 'Porta Nuova']),
        priorita: 'alta',
        stato: 'attivo',
        note: 'Giovane professionista, cerca bilocale moderno vicino al lavoro. Disponibile per visite serali.',
      },
    }),

    prisma.cliente.create({
      data: {
        nome: 'Giulia',
        cognome: 'Smeraldo',
        email: 'giulia.smeraldo@email.com',
        telefono: '+39 345 678 9012',
        tipologiaRichiesta: 'appartamento',
        budgetMin: 320000,
        budgetMax: 420000,
        superficieMin: 75,
        localiMin: 3,
        zoneInteresse: JSON.stringify(['Navigli', 'Porta Romana', 'Ticinese']),
        priorita: 'media',
        stato: 'attivo',
        note: 'Coppia giovane, cerca trilocale in zona movida. Preferiscono zone vivaci con locali e ristoranti.',
      },
    }),

    prisma.cliente.create({
      data: {
        nome: 'Alessandro',
        cognome: 'Rubino',
        email: 'alessandro.rubino@email.com',
        telefono: '+39 340 890 1234',
        tipologiaRichiesta: 'loft',
        budgetMin: 550000,
        budgetMax: 750000,
        superficieMin: 110,
        localiMin: 2,
        zoneInteresse: JSON.stringify(['Navigli', 'Tortona', 'Porta Genova']),
        priorita: 'media',
        stato: 'attivo',
        note: 'Designer, cerca loft industriale da personalizzare. Budget flessibile per immobili unici.',
      },
    }),

    prisma.cliente.create({
      data: {
        nome: 'Beatrice',
        cognome: 'Zaffiro',
        email: 'beatrice.zaffiro@email.com',
        telefono: '+39 347 012 3456',
        tipologiaRichiesta: 'appartamento',
        budgetMin: 180000,
        budgetMax: 250000,
        superficieMin: 50,
        localiMin: 2,
        zoneInteresse: JSON.stringify(['Sesto San Giovanni', 'Lambrate', 'Città Studi']),
        priorita: 'bassa',
        stato: 'attivo',
        note: 'Studentessa lavoratrice, cerca bilocale economico. Valuta anche zone limitrofe a Milano.',
      },
    }),
  ]);

  console.log(`✅ Creati ${clienti.length} clienti`);

  // ============================================================================
  // AZIONI
  // ============================================================================

  const oggi = new Date();
  const domani = new Date(oggi);
  domani.setDate(domani.getDate() + 1);
  const dopodomani = new Date(oggi);
  dopodomani.setDate(dopodomani.getDate() + 2);
  const settimanaProxima = new Date(oggi);
  settimanaProxima.setDate(settimanaProxima.getDate() + 7);

  const azioni = await Promise.all([
    // Azioni urgenti oggi
    prisma.azione.create({
      data: {
        tipo: 'chiamata',
        descrizione: 'Chiamare Laura Bianchi per fissare visita trilocale Isola',
        clienteId: clienti[0].id, // Laura Bianchi
        immobileId: immobili[2].id, // Bilocale Isola
        priorita: 'alta',
        stato: 'da_fare',
        dataScadenza: oggi.toISOString(),
      },
    }),

    prisma.azione.create({
      data: {
        tipo: 'visita',
        descrizione: 'Visita villa San Siro con famiglia Rossi',
        clienteId: clienti[1].id, // Marco Rossi
        immobileId: immobili[3].id, // Villa San Siro
        priorita: 'alta',
        stato: 'da_fare',
        dataScadenza: oggi.toISOString(),
      },
    }),

    prisma.azione.create({
      data: {
        tipo: 'followup',
        descrizione: 'Follow-up post visita attico Porta Venezia con Giuseppe Verdi',
        clienteId: clienti[2].id, // Giuseppe Verdi
        immobileId: immobili[1].id, // Attico Porta Venezia
        priorita: 'alta',
        stato: 'da_fare',
        dataScadenza: oggi.toISOString(),
      },
    }),

    // Azioni domani
    prisma.azione.create({
      data: {
        tipo: 'email',
        descrizione: 'Inviare documentazione immobile a Anna Neri',
        clienteId: clienti[3].id, // Anna Neri
        priorita: 'media',
        stato: 'da_fare',
        dataScadenza: domani.toISOString(),
      },
    }),

    prisma.azione.create({
      data: {
        tipo: 'visita',
        descrizione: 'Mostrare loft Navigli a Paolo Gialli',
        clienteId: clienti[4].id, // Paolo Gialli
        immobileId: immobili[4].id, // Loft Navigli
        priorita: 'media',
        stato: 'da_fare',
        dataScadenza: domani.toISOString(),
      },
    }),

    prisma.azione.create({
      data: {
        tipo: 'chiamata',
        descrizione: 'Ricontattare Francesca Blu per feedback su immobili proposti',
        clienteId: clienti[5].id, // Francesca Blu
        priorita: 'media',
        stato: 'da_fare',
        dataScadenza: domani.toISOString(),
      },
    }),

    // Azioni settimana prossima
    prisma.azione.create({
      data: {
        tipo: 'chiamata',
        descrizione: 'Tentare ricontatto cliente dormiente Roberto Grigi',
        clienteId: clienti[6].id, // Roberto Grigi
        priorita: 'bassa',
        stato: 'da_fare',
        dataScadenza: settimanaProxima.toISOString(),
      },
    }),

    prisma.azione.create({
      data: {
        tipo: 'visita',
        descrizione: 'Visita monolocale Lambrate con Andrea Marroni',
        clienteId: clienti[8].id, // Andrea Marroni
        immobileId: immobili[14].id, // Monolocale Lambrate
        priorita: 'media',
        stato: 'da_fare',
        dataScadenza: settimanaProxima.toISOString(),
      },
    }),

    prisma.azione.create({
      data: {
        tipo: 'visita',
        descrizione: 'Mostrare ufficio Bicocca a Elena Arancioni',
        clienteId: clienti[9].id, // Elena Arancioni
        immobileId: immobili[12].id, // Ufficio Bicocca
        priorita: 'media',
        stato: 'da_fare',
        dataScadenza: settimanaProxima.toISOString(),
      },
    }),

    // Azioni completate
    prisma.azione.create({
      data: {
        tipo: 'visita',
        descrizione: 'Visita bilocale Porta Romana con Luca Verdi',
        clienteId: clienti[10].id, // Luca Verdi
        immobileId: immobili[7].id, // Bilocale Porta Romana
        priorita: 'alta',
        stato: 'completata',
        dataScadenza: new Date(oggi.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        completedAt: new Date(oggi.getTime() - 5 * 24 * 60 * 60 * 1000),
      },
    }),

    prisma.azione.create({
      data: {
        tipo: 'chiamata',
        descrizione: 'Chiamata conoscitiva Martina Rosa',
        clienteId: clienti[11].id, // Martina Rosa
        priorita: 'media',
        stato: 'completata',
        dataScadenza: new Date(oggi.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        completedAt: new Date(oggi.getTime() - 3 * 24 * 60 * 60 * 1000),
      },
    }),

    prisma.azione.create({
      data: {
        tipo: 'email',
        descrizione: 'Inviare brochure immobili zona City Life a Martina Rosa',
        clienteId: clienti[11].id, // Martina Rosa
        priorita: 'media',
        stato: 'completata',
        dataScadenza: new Date(oggi.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        completedAt: new Date(oggi.getTime() - 2 * 24 * 60 * 60 * 1000),
      },
    }),

    // Altre azioni varie
    prisma.azione.create({
      data: {
        tipo: 'whatsapp',
        descrizione: 'Inviare foto aggiuntive mansarda Sempione a Davide Celesti',
        clienteId: clienti[12].id, // Davide Celesti
        immobileId: immobili[8].id, // Mansarda Sempione
        priorita: 'media',
        stato: 'da_fare',
        dataScadenza: dopodomani.toISOString(),
      },
    }),

    prisma.azione.create({
      data: {
        tipo: 'visita',
        descrizione: 'Visita villa Monza con famiglia Turchesi',
        clienteId: clienti[13].id, // Chiara Turchesi
        immobileId: immobili[10].id, // Villa Monza
        priorita: 'alta',
        stato: 'da_fare',
        dataScadenza: dopodomani.toISOString(),
      },
    }),

    prisma.azione.create({
      data: {
        tipo: 'chiamata',
        descrizione: 'Chiamare Stefano Perla per discutere opzioni negozi',
        clienteId: clienti[14].id, // Stefano Perla
        priorita: 'media',
        stato: 'da_fare',
        dataScadenza: settimanaProxima.toISOString(),
      },
    }),

    prisma.azione.create({
      data: {
        tipo: 'visita',
        descrizione: 'Mostrare quadrilocale Magenta a Valentina Corallo',
        clienteId: clienti[15].id, // Valentina Corallo
        immobileId: immobili[9].id, // Appartamento Magenta
        priorita: 'media',
        stato: 'da_fare',
        dataScadenza: settimanaProxima.toISOString(),
      },
    }),

    prisma.azione.create({
      data: {
        tipo: 'email',
        descrizione: 'Inviare planimetrie bilocale Isola a Federico Ambra',
        clienteId: clienti[16].id, // Federico Ambra
        immobileId: immobili[2].id, // Bilocale Isola
        priorita: 'alta',
        stato: 'da_fare',
        dataScadenza: domani.toISOString(),
      },
    }),

    prisma.azione.create({
      data: {
        tipo: 'followup',
        descrizione: 'Follow-up visita trilocale Navigli con Giulia Smeraldo',
        clienteId: clienti[17].id, // Giulia Smeraldo
        priorita: 'media',
        stato: 'da_fare',
        dataScadenza: dopodomani.toISOString(),
      },
    }),

    prisma.azione.create({
      data: {
        tipo: 'visita',
        descrizione: 'Visita loft Tortona con Alessandro Rubino',
        clienteId: clienti[18].id, // Alessandro Rubino
        immobileId: immobili[4].id, // Loft Navigli
        priorita: 'media',
        stato: 'da_fare',
        dataScadenza: settimanaProxima.toISOString(),
      },
    }),

    prisma.azione.create({
      data: {
        tipo: 'altro',
        descrizione: 'Preparare documentazione per mutuo Beatrice Zaffiro',
        clienteId: clienti[19].id, // Beatrice Zaffiro
        priorita: 'bassa',
        stato: 'da_fare',
        dataScadenza: settimanaProxima.toISOString(),
      },
    }),
  ]);

  console.log(`✅ Creati ${azioni.length} azioni`);

  // ============================================================================
  // MATCHES
  // ============================================================================

  const matches = await Promise.all([
    // Match perfetti
    prisma.match.create({
      data: {
        immobileId: immobili[2].id, // Bilocale Isola
        clienteId: clienti[0].id, // Laura Bianchi
        score: 92,
        motivi: JSON.stringify([
          'Prezzo nel budget (320k vs 280-350k)',
          'Zona richiesta (Isola)',
          'Tipologia corretta (appartamento)',
          'Superficie adeguata (55mq vs min 70mq)',
          'Moderno e ristrutturato',
        ]),
        stato: 'proposto',
      },
    }),

    prisma.match.create({
      data: {
        immobileId: immobili[3].id, // Villa San Siro
        clienteId: clienti[1].id, // Marco Rossi
        score: 95,
        motivi: JSON.stringify([
          'Prezzo nel budget (1.25M vs 900k-1.3M)',
          'Zona richiesta (San Siro)',
          'Tipologia perfetta (villa)',
          'Superficie ideale (280mq vs min 200mq)',
          'Giardino 400mq',
          'Box triplo',
        ]),
        stato: 'visitato',
      },
    }),

    prisma.match.create({
      data: {
        immobileId: immobili[1].id, // Attico Porta Venezia
        clienteId: clienti[2].id, // Giuseppe Verdi
        score: 88,
        motivi: JSON.stringify([
          'Prezzo nel budget (890k vs 700-950k)',
          'Zona richiesta (Porta Venezia)',
          'Tipologia perfetta (attico)',
          'Terrazzo 60mq',
          'Finiture di lusso',
        ]),
        stato: 'interessato',
      },
    }),

    // Match buoni
    prisma.match.create({
      data: {
        immobileId: immobili[4].id, // Loft Navigli
        clienteId: clienti[4].id, // Paolo Gialli
        score: 91,
        motivi: JSON.stringify([
          'Prezzo nel budget (650k vs 500-700k)',
          'Zona richiesta (Navigli)',
          'Tipologia perfetta (loft)',
          'Design industriale',
          'Spazi unici',
        ]),
        stato: 'visto',
      },
    }),

    prisma.match.create({
      data: {
        immobileId: immobili[14].id, // Monolocale Lambrate
        clienteId: clienti[8].id, // Andrea Marroni (investitore)
        score: 85,
        motivi: JSON.stringify([
          'Prezzo ottimo (145k vs 100-180k)',
          'Zona universitaria (Lambrate)',
          'Ideale per affitto studenti',
          'Vicino metro',
        ]),
        stato: 'proposto',
      },
    }),

    prisma.match.create({
      data: {
        immobileId: immobili[12].id, // Ufficio Bicocca
        clienteId: clienti[9].id, // Elena Arancioni
        score: 87,
        motivi: JSON.stringify([
          'Prezzo nel budget (350k vs 250-400k)',
          'Zona richiesta (Bicocca)',
          'Tipologia corretta (ufficio)',
          'Open space moderno',
          'Box auto incluso',
        ]),
        stato: 'proposto',
      },
    }),

    // Match medi
    prisma.match.create({
      data: {
        immobileId: immobili[0].id, // Trilocale Brera
        clienteId: clienti[5].id, // Francesca Blu
        score: 82,
        motivi: JSON.stringify([
          'Prezzo leggermente alto (485k vs 350-450k)',
          'Zona perfetta (Brera)',
          'Palazzo d\'epoca',
          'Ristrutturato di recente',
        ]),
        stato: 'proposto',
      },
    }),

    prisma.match.create({
      data: {
        immobileId: immobili[8].id, // Mansarda Sempione
        clienteId: clienti[12].id, // Davide Celesti
        score: 86,
        motivi: JSON.stringify([
          'Prezzo nel budget (420k vs 350-450k)',
          'Zona richiesta (Sempione)',
          'Terrazzo 30mq',
          'Caratteristico con travi a vista',
        ]),
        stato: 'visto',
      },
    }),

    prisma.match.create({
      data: {
        immobileId: immobili[10].id, // Villa Monza
        clienteId: clienti[13].id, // Chiara Turchesi
        score: 89,
        motivi: JSON.stringify([
          'Prezzo nel budget (980k vs 800k-1.1M)',
          'Zona richiesta (Monza)',
          'Villa con piscina',
          'Giardino 800mq',
          'Spazio per home office',
        ]),
        stato: 'proposto',
      },
    }),

    prisma.match.create({
      data: {
        immobileId: immobili[5].id, // Quadrilocale City Life
        clienteId: clienti[11].id, // Martina Rosa
        score: 90,
        motivi: JSON.stringify([
          'Prezzo leggermente alto (720k vs 400-550k)',
          'Zona richiesta (City Life)',
          'Moderno e nuovo',
          'Vista parco',
          'Domotica',
        ]),
        stato: 'interessato',
      },
    }),

    // Match da scartare
    prisma.match.create({
      data: {
        immobileId: immobili[15].id, // Bilocale da ristrutturare Corvetto
        clienteId: clienti[3].id, // Anna Neri
        score: 75,
        motivi: JSON.stringify([
          'Prezzo ottimo (180k vs 200-280k)',
          'Da ristrutturare (cliente disponibile)',
          'Zona limitrofa a quelle richieste',
        ]),
        stato: 'scartato',
      },
    }),

    prisma.match.create({
      data: {
        immobileId: immobili[13].id, // Negozio Duomo
        clienteId: clienti[14].id, // Stefano Perla
        score: 84,
        motivi: JSON.stringify([
          'Prezzo nel budget (450k vs 300-500k)',
          'Zona perfetta (Duomo)',
          'Grande passaggio',
          'Vetrina ampia',
        ]),
        stato: 'proposto',
      },
    }),

    prisma.match.create({
      data: {
        immobileId: immobili[9].id, // Appartamento Magenta
        clienteId: clienti[15].id, // Valentina Corallo
        score: 88,
        motivi: JSON.stringify([
          'Prezzo nel budget (580k vs 450-600k)',
          'Zona richiesta (Magenta)',
          'Palazzo d\'epoca',
          'Soffitti alti e affreschi',
        ]),
        stato: 'proposto',
      },
    }),

    prisma.match.create({
      data: {
        immobileId: immobili[2].id, // Bilocale Isola
        clienteId: clienti[16].id, // Federico Ambra
        score: 93,
        motivi: JSON.stringify([
          'Prezzo nel budget (320k vs 250-350k)',
          'Zona perfetta (Isola)',
          'Moderno e nuovo',
          'Vicino al lavoro',
        ]),
        stato: 'interessato',
      },
    }),

    prisma.match.create({
      data: {
        immobileId: immobili[4].id, // Loft Navigli
        clienteId: clienti[18].id, // Alessandro Rubino
        score: 94,
        motivi: JSON.stringify([
          'Prezzo nel budget (650k vs 550-750k)',
          'Zona richiesta (Navigli)',
          'Loft industriale perfetto',
          'Spazi da personalizzare',
          'Design unico',
        ]),
        stato: 'proposto',
      },
    }),
  ]);

  console.log(`✅ Creati ${matches.length} matches`);

  // ============================================================================
  // RIEPILOGO
  // ============================================================================

  console.log('\n🎉 Seeding completato con successo!');
  console.log('=====================================');
  console.log(`📦 Immobili: ${immobili.length}`);
  console.log(`👥 Clienti: ${clienti.length}`);
  console.log(`⚡ Azioni: ${azioni.length}`);
  console.log(`🎯 Matches: ${matches.length}`);
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
