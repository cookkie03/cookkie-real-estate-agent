/**
 * Application constants
 * Routes, status options, and other fixed values
 */

// API Base URL
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

// Application Routes
export const ROUTES = {
  HOME: "/",
  PROPERTIES: "/immobili",
  PROPERTY_DETAIL: (id: string) => `/immobili/${id}`,
  CLIENTS: "/clienti",
  CLIENT_DETAIL: (id: string) => `/clienti/${id}`,
  REQUESTS: "/richieste",
  MATCHING: "/matching",
  ACTIVITIES: "/attivita",
  SETTINGS: "/settings",
  MAP: "/mappa",
  BUILDINGS: "/edifici",
  SCRAPING: "/scraping",
  CALENDAR: "/agenda",
  ACTIONS: "/actions",
  TOOL: "/tool",
} as const;

// Navigation Menu Items - 7 voci essenziali consolidate
export const NAV_ITEMS = [
  {
    label: "Dashboard",
    href: ROUTES.HOME,
    icon: "LayoutDashboard",
    description: "Panoramica e statistiche",
  },
  {
    label: "Immobili",
    href: ROUTES.PROPERTIES,
    icon: "Building2",
    description: "Gestione proprietà in portafoglio",
  },
  {
    label: "Clienti",
    href: ROUTES.CLIENTS,
    icon: "Users",
    description: "Contatti e richieste clienti",
  },
  {
    label: "Scraping",
    href: ROUTES.SCRAPING,
    icon: "Globe",
    description: "Acquisizione automatica da web",
  },
  {
    label: "Mappa",
    href: ROUTES.MAP,
    icon: "Map",
    description: "Visualizzazione geografica immobili",
  },
  {
    label: "Richieste & Matching",
    href: ROUTES.MATCHING,
    icon: "Target",
    description: "Richieste clienti e abbinamenti AI",
  },
  {
    label: "Agenda",
    href: ROUTES.CALENDAR,
    icon: "Calendar",
    description: "Appuntamenti e attività",
  },
  {
    label: "Impostazioni",
    href: ROUTES.SETTINGS,
    icon: "Settings",
    description: "Configurazione sistema",
  },
] as const;

// Property Status Options
export const PROPERTY_STATUS = {
  AVAILABLE: "available",
  SOLD: "sold",
  RENTED: "rented",
  RESERVED: "reserved",
  ARCHIVED: "archived",
} as const;

export const PROPERTY_STATUS_LABELS = {
  [PROPERTY_STATUS.AVAILABLE]: "Disponibile",
  [PROPERTY_STATUS.SOLD]: "Venduto",
  [PROPERTY_STATUS.RENTED]: "Affittato",
  [PROPERTY_STATUS.RESERVED]: "Riservato",
  [PROPERTY_STATUS.ARCHIVED]: "Archiviato",
} as const;

export const PROPERTY_STATUS_COLORS = {
  [PROPERTY_STATUS.AVAILABLE]: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100",
  [PROPERTY_STATUS.SOLD]: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100",
  [PROPERTY_STATUS.RENTED]: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-100",
  [PROPERTY_STATUS.RESERVED]: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100",
  [PROPERTY_STATUS.ARCHIVED]: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-100",
} as const;

// Contract Type Options
export const CONTRACT_TYPE = {
  SALE: "sale",
  RENT: "rent",
} as const;

export const CONTRACT_TYPE_LABELS = {
  [CONTRACT_TYPE.SALE]: "Vendita",
  [CONTRACT_TYPE.RENT]: "Affitto",
} as const;

// Property Type Options
export const PROPERTY_TYPE = {
  APARTMENT: "apartment",
  HOUSE: "house",
  VILLA: "villa",
  OFFICE: "office",
  COMMERCIAL: "commercial",
  LAND: "land",
  GARAGE: "garage",
  OTHER: "other",
} as const;

export const PROPERTY_TYPE_LABELS = {
  [PROPERTY_TYPE.APARTMENT]: "Appartamento",
  [PROPERTY_TYPE.HOUSE]: "Casa",
  [PROPERTY_TYPE.VILLA]: "Villa",
  [PROPERTY_TYPE.OFFICE]: "Ufficio",
  [PROPERTY_TYPE.COMMERCIAL]: "Commerciale",
  [PROPERTY_TYPE.LAND]: "Terreno",
  [PROPERTY_TYPE.GARAGE]: "Box/Garage",
  [PROPERTY_TYPE.OTHER]: "Altro",
} as const;

// Contact Type Options
export const CONTACT_TYPE = {
  BUYER: "buyer",
  SELLER: "seller",
  RENTER: "renter",
  OWNER: "owner",
  LEAD: "lead",
  OTHER: "other",
} as const;

export const CONTACT_TYPE_LABELS = {
  [CONTACT_TYPE.BUYER]: "Acquirente",
  [CONTACT_TYPE.SELLER]: "Venditore",
  [CONTACT_TYPE.RENTER]: "Inquilino",
  [CONTACT_TYPE.OWNER]: "Proprietario",
  [CONTACT_TYPE.LEAD]: "Lead",
  [CONTACT_TYPE.OTHER]: "Altro",
} as const;

// Contact Status Options
export const CONTACT_STATUS = {
  ACTIVE: "active",
  INACTIVE: "inactive",
  CONVERTED: "converted",
  ARCHIVED: "archived",
} as const;

export const CONTACT_STATUS_LABELS = {
  [CONTACT_STATUS.ACTIVE]: "Attivo",
  [CONTACT_STATUS.INACTIVE]: "Inattivo",
  [CONTACT_STATUS.CONVERTED]: "Convertito",
  [CONTACT_STATUS.ARCHIVED]: "Archiviato",
} as const;

// Importance Levels
export const IMPORTANCE = {
  LOW: "low",
  MEDIUM: "medium",
  HIGH: "high",
} as const;

export const IMPORTANCE_LABELS = {
  [IMPORTANCE.LOW]: "Bassa",
  [IMPORTANCE.MEDIUM]: "Media",
  [IMPORTANCE.HIGH]: "Alta",
} as const;

export const IMPORTANCE_COLORS = {
  [IMPORTANCE.LOW]: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-100",
  [IMPORTANCE.MEDIUM]: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100",
  [IMPORTANCE.HIGH]: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100",
} as const;

// Activity Type Options
export const ACTIVITY_TYPE = {
  CALL: "call",
  EMAIL: "email",
  MEETING: "meeting",
  NOTE: "note",
  TASK: "task",
  VIEWING: "viewing",
  OTHER: "other",
} as const;

export const ACTIVITY_TYPE_LABELS = {
  [ACTIVITY_TYPE.CALL]: "Chiamata",
  [ACTIVITY_TYPE.EMAIL]: "Email",
  [ACTIVITY_TYPE.MEETING]: "Incontro",
  [ACTIVITY_TYPE.NOTE]: "Nota",
  [ACTIVITY_TYPE.TASK]: "Attività",
  [ACTIVITY_TYPE.VIEWING]: "Visita",
  [ACTIVITY_TYPE.OTHER]: "Altro",
} as const;

// Match Status Options
export const MATCH_STATUS = {
  PENDING: "pending",
  CONTACTED: "contacted",
  VIEWING_SCHEDULED: "viewing_scheduled",
  REJECTED: "rejected",
  CONVERTED: "converted",
} as const;

export const MATCH_STATUS_LABELS = {
  [MATCH_STATUS.PENDING]: "In attesa",
  [MATCH_STATUS.CONTACTED]: "Contattato",
  [MATCH_STATUS.VIEWING_SCHEDULED]: "Visita programmata",
  [MATCH_STATUS.REJECTED]: "Rifiutato",
  [MATCH_STATUS.CONVERTED]: "Convertito",
} as const;

// Pagination
export const DEFAULT_PAGE_SIZE = 20;
export const PAGE_SIZE_OPTIONS = [10, 20, 50, 100];

// Date Formats
export const DATE_FORMAT = "dd/MM/yyyy";
export const DATETIME_FORMAT = "dd/MM/yyyy HH:mm";
export const TIME_FORMAT = "HH:mm";
