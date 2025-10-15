import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Seed Clienti
  const cliente1 = await prisma.cliente.create({
    data: {
      nome: 'Mario',
      cognome: 'Rossi',
      email: 'mario.rossi@example.com',
      telefono: '+39 345 123 4567',
      tipologiaRichiesta: 'appartamento',
      budgetMin: 350000,
      budgetMax: 450000,
      superficieMin: 80,
      localiMin: 3,
      zoneInteresse: JSON.stringify(['Brera', 'Isola', 'Navigli']),
      priorita: 'alta',
      stato: 'attivo',
      note: 'Cliente molto motivato, cerca casa per famiglia',
    },
  })

  const cliente2 = await prisma.cliente.create({
    data: {
      nome: 'Laura',
      cognome: 'Bianchi',
      email: 'laura.bianchi@example.com',
      telefono: '+39 348 765 4321',
      tipologiaRichiesta: 'appartamento',
      budgetMin: 200000,
      budgetMax: 300000,
      superficieMin: 60,
      localiMin: 2,
      zoneInteresse: JSON.stringify(['Corso Buenos Aires', 'Città Studi']),
      priorita: 'media',
      stato: 'attivo',
    },
  })

  // Seed Immobili
  const immobile1 = await prisma.immobile.create({
    data: {
      titolo: 'Trilocale con terrazzo zona Brera',
      tipologia: 'appartamento',
      prezzo: 485000,
      superficie: 95,
      locali: 3,
      bagni: 2,
      indirizzo: 'Via Brera 12',
      citta: 'Milano',
      cap: '20121',
      provincia: 'MI',
      zona: 'Brera',
      latitudine: 45.4719,
      longitudine: 9.1885,
      descrizione: 'Splendido trilocale completamente ristrutturato con terrazzo panoramico. Finiture di pregio, climatizzazione, cucina abitabile. Zona molto ricercata nel cuore di Milano.',
      caratteristiche: JSON.stringify({
        ascensore: true,
        balcone: true,
        terrazzo: true,
        cantina: false,
        boxAuto: false,
        riscaldamentoAutonomo: true,
        climatizzatore: true,
        piano: 3,
        annoCostruzione: 1920,
        annoRistrutturazione: 2020,
      }),
      foto: JSON.stringify([
        '/images/immobili/1-1.jpg',
        '/images/immobili/1-2.jpg',
        '/images/immobili/1-3.jpg',
      ]),
      fonte: 'Agenzia',
      stato: 'disponibile',
    },
  })

  const immobile2 = await prisma.immobile.create({
    data: {
      titolo: 'Bilocale ristrutturato zona Isola',
      tipologia: 'appartamento',
      prezzo: 320000,
      superficie: 65,
      locali: 2,
      bagni: 1,
      indirizzo: 'Corso Garibaldi 45',
      citta: 'Milano',
      cap: '20121',
      provincia: 'MI',
      zona: 'Isola',
      latitudine: 45.4860,
      longitudine: 9.1885,
      descrizione: 'Grazioso bilocale recentemente ristrutturato in zona Isola, a due passi da Corso Como. Luminoso, silenzioso, ideale per single o coppia.',
      caratteristiche: JSON.stringify({
        ascensore: true,
        balcone: true,
        terrazzo: false,
        cantina: true,
        boxAuto: false,
        riscaldamentoAutonomo: false,
        climatizzatore: true,
        piano: 2,
        annoCostruzione: 1960,
        annoRistrutturazione: 2019,
      }),
      foto: JSON.stringify([
        '/images/immobili/2-1.jpg',
        '/images/immobili/2-2.jpg',
      ]),
      fonte: 'Portale',
      urlOriginale: 'https://www.immobiliare.it/example',
      stato: 'disponibile',
    },
  })

  // Seed Matches
  const match1 = await prisma.match.create({
    data: {
      immobileId: immobile1.id,
      clienteId: cliente1.id,
      score: 93,
      motivi: JSON.stringify([
        'Prezzo perfettamente nel budget',
        'Zona di interesse (Brera)',
        'Numero locali corrispondente',
        'Superficie adeguata',
      ]),
      stato: 'proposto',
    },
  })

  const match2 = await prisma.match.create({
    data: {
      immobileId: immobile2.id,
      clienteId: cliente2.id,
      score: 87,
      motivi: JSON.stringify([
        'Prezzo nel budget',
        'Zona vicina a preferenze',
        'Bilocale come richiesto',
      ]),
      stato: 'visto',
    },
  })

  // Seed Azioni
  const azione1 = await prisma.azione.create({
    data: {
      tipo: 'visita',
      descrizione: 'Visita trilocale Via Brera',
      clienteId: cliente1.id,
      priorita: 'alta',
      stato: 'da_fare',
      dataScadenza: new Date('2025-10-20T10:00:00'),
    },
  })

  const azione2 = await prisma.azione.create({
    data: {
      tipo: 'chiamata',
      descrizione: 'Follow-up post visita',
      clienteId: cliente2.id,
      priorita: 'media',
      stato: 'da_fare',
      dataScadenza: new Date('2025-10-18T14:30:00'),
    },
  })

  console.log('✅ Database seeded successfully!')
  console.log({
    clienti: [cliente1, cliente2],
    immobili: [immobile1, immobile2],
    matches: [match1, match2],
    azioni: [azione1, azione2],
  })
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error('❌ Seeding error:', e)
    await prisma.$disconnect()
    process.exit(1)
  })
