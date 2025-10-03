// Mock data for MVP demonstration

export const mockAgendaItems = [
  {
    id: "1",
    time: "10:00",
    title: "Visita trilocale",
    client: "Mario Rossi",
    address: "Via Torino 42, Milano",
  },
  {
    id: "2",
    time: "14:30",
    title: "Follow-up post visita",
    client: "Laura Bianchi",
    address: "Corso Buenos Aires 15",
  },
  {
    id: "3",
    time: "16:00",
    title: "Presentazione nuova proprietà",
    client: "Giuseppe Verdi",
  },
];

export const mockContacts = [
  {
    id: "1",
    name: "Mario Rossi",
    role: "buyer" as const,
    phone: "+39 345 123 4567",
    budget: "350-450k",
    lastTouchDays: 12,
  },
  {
    id: "2",
    name: "Laura Bianchi",
    role: "buyer" as const,
    phone: "+39 348 765 4321",
    budget: "200-300k",
    lastTouchDays: 3,
  },
  {
    id: "3",
    name: "Giuseppe Verdi",
    role: "seller" as const,
    phone: "+39 340 987 6543",
    lastTouchDays: 25,
  },
  {
    id: "4",
    name: "Anna Neri",
    role: "owner" as const,
    phone: "+39 333 456 7890",
    lastTouchDays: 45,
  },
  {
    id: "5",
    name: "Paolo Gialli",
    role: "buyer" as const,
    phone: "+39 347 234 5678",
    budget: "500-600k",
    lastTouchDays: 8,
  },
];

export const mockAreaStats = {
  medianPrice: 5200,
  timeToSell: 41,
  trend: "up" as const,
};

export const mockBuildingInfo = {
  status: "Buono stato",
  notes: "Ristrutturazione facciate 2020, condominio ben gestito",
};

export const mockSimilars = [
  { id: "1", title: "Trilocale Via Brera 12", score: 0.93 },
  { id: "2", title: "Bilocale Corso Garibaldi 45", score: 0.87 },
  { id: "3", title: "Trilocale Via Mercanti 8", score: 0.83 },
];

export const mockSuggestedActions = [
  {
    title: "Nuovi da proporre",
    icon: "TrendingUp",
    variant: "success" as const,
    items: [
      {
        id: "1",
        label: "Laura Bianchi",
        reason: "Nuovo trilocale matching perfetto zona Isola",
        score: 0.91,
      },
      {
        id: "2",
        label: "Paolo Gialli",
        reason: "Villa con giardino zona City Life",
        score: 0.85,
      },
    ],
  },
  {
    title: "Rientrare su",
    icon: "TrendingUp",
    variant: "warning" as const,
    items: [
      {
        id: "3",
        label: "Giuseppe Verdi",
        reason: "Proprietà simile disponibile con sconto 8%",
        score: 0.78,
      },
    ],
  },
  {
    title: "Dormienti",
    icon: "Clock",
    variant: "default" as const,
    items: [
      {
        id: "4",
        label: "Anna Neri",
        reason: "Nessun contatto da 45 giorni",
      },
      {
        id: "5",
        label: "Marco Blu",
        reason: "Nessun contatto da 38 giorni",
      },
    ],
  },
];

export const mockMapZones = [
  { name: "Brera", dormant: 12, inSale: 8, owned: 3 },
  { name: "Isola", dormant: 8, inSale: 15, owned: 5 },
  { name: "Navigli", dormant: 15, inSale: 12, owned: 2 },
  { name: "City Life", dormant: 6, inSale: 9, owned: 4 },
];

export const mockConnectors = [
  { name: "PortaleX", status: "ok" as const, lastSync: "12:30" },
  { name: "Rubrica Google", status: "ok" as const, lastSync: "11:15" },
  { name: "CRM CSV Import", status: "error" as const },
  { name: "Idealista Scraper", status: "idle" as const },
];

export const mockFeedEvents = [
  {
    id: "1",
    type: "new" as const,
    title: "Nuovo trilocale con terrazzo",
    time: "2 ore fa",
    zone: "Brera",
    price: "485.000 €",
  },
  {
    id: "2",
    type: "discount" as const,
    title: "Bilocale ristrutturato",
    time: "5 ore fa",
    zone: "Isola",
    price: "320.000 € (-8%)",
  },
  {
    id: "3",
    type: "sold" as const,
    title: "Attico panoramico",
    time: "1 giorno fa",
    zone: "City Life",
    price: "890.000 €",
  },
  {
    id: "4",
    type: "new" as const,
    title: "Villa indipendente",
    time: "1 giorno fa",
    zone: "San Siro",
    price: "1.250.000 €",
  },
];
