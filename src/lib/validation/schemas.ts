/**
 * Zod validation schemas for API endpoints
 *
 * - Create schemas: Used for POST (creating new records)
 * - Update schemas: Used for PUT (updating existing records)
 * - Conditional validation: Email/phone optional but validated if present
 */

import { z } from 'zod';

// ============================================================================
// IMMOBILE SCHEMAS
// ============================================================================

const caratteristicheSchema = z.object({
  ascensore: z.boolean().optional(),
  balcone: z.boolean().optional(),
  terrazzo: z.boolean().optional(),
  cantina: z.boolean().optional(),
  boxAuto: z.boolean().optional(),
  riscaldamentoAutonomo: z.boolean().optional(),
  climatizzatore: z.boolean().optional(),
  piano: z.number().optional(),
  annoCostruzione: z.number().optional(),
  annoRistrutturazione: z.number().optional(),
});

export const immobileCreateSchema = z.object({
  titolo: z.string().min(1, 'Il titolo è obbligatorio'),
  tipologia: z.string().min(1, 'La tipologia è obbligatoria'),
  prezzo: z.number().positive('Il prezzo deve essere positivo'),
  superficie: z.number().positive('La superficie deve essere positiva'),
  locali: z.number().int().positive('Il numero di locali deve essere positivo'),
  bagni: z.number().int().positive('Il numero di bagni deve essere positivo'),

  // Location
  indirizzo: z.string().min(1, "L'indirizzo è obbligatorio"),
  citta: z.string().min(1, 'La città è obbligatoria'),
  cap: z.string().min(5, 'Il CAP deve essere valido'),
  provincia: z.string().length(2, 'La provincia deve essere di 2 caratteri'),
  latitudine: z.number().optional().nullable(),
  longitudine: z.number().optional().nullable(),
  zona: z.string().optional().nullable(),

  // Details
  descrizione: z.string().min(1, 'La descrizione è obbligatoria'),
  caratteristiche: caratteristicheSchema.optional().default({}),
  foto: z.array(z.string().url('URL foto non valido')).optional().default([]),

  // Metadata
  fonte: z.string().optional().nullable(),
  urlOriginale: z.string().url('URL non valido').optional().nullable(),
  stato: z.enum(['disponibile', 'venduto', 'ritirato', 'in_trattativa']).default('disponibile'),
});

export const immobileUpdateSchema = immobileCreateSchema.partial();

export type ImmobileCreateInput = z.infer<typeof immobileCreateSchema>;
export type ImmobileUpdateInput = z.infer<typeof immobileUpdateSchema>;

// ============================================================================
// CLIENTE SCHEMAS
// ============================================================================

export const clienteCreateSchema = z.object({
  nome: z.string().min(1, 'Il nome è obbligatorio'),
  cognome: z.string().min(1, 'Il cognome è obbligatorio'),

  // Conditional validation: email and phone are optional, but if present, must be valid
  email: z
    .string()
    .email('Email non valida')
    .optional()
    .nullable()
    .or(z.literal('')),
  telefono: z
    .string()
    .min(10, 'Il telefono deve contenere almeno 10 caratteri')
    .optional()
    .nullable()
    .or(z.literal('')),

  // Search preferences
  tipologiaRichiesta: z.string().optional().nullable(),
  budgetMin: z.number().positive().optional().nullable(),
  budgetMax: z.number().positive().optional().nullable(),
  superficieMin: z.number().positive().optional().nullable(),
  localiMin: z.number().int().positive().optional().nullable(),
  zoneInteresse: z.array(z.string()).optional().default([]),

  // Status
  priorita: z.enum(['alta', 'media', 'bassa']).default('media'),
  stato: z.enum(['attivo', 'in_trattativa', 'concluso', 'dormiente']).default('attivo'),
  note: z.string().optional().nullable(),
});

export const clienteUpdateSchema = clienteCreateSchema.partial();

export type ClienteCreateInput = z.infer<typeof clienteCreateSchema>;
export type ClienteUpdateInput = z.infer<typeof clienteUpdateSchema>;

// ============================================================================
// MATCH SCHEMAS
// ============================================================================

export const matchCreateSchema = z.object({
  immobileId: z.string().cuid('ID immobile non valido'),
  clienteId: z.string().cuid('ID cliente non valido'),
  score: z.number().min(0).max(100, 'Lo score deve essere tra 0 e 100'),
  motivi: z.array(z.string()).optional().default([]),
  stato: z.enum(['proposto', 'visto', 'interessato', 'visitato', 'scartato']).default('proposto'),
});

export const matchUpdateSchema = matchCreateSchema.partial().omit({ immobileId: true, clienteId: true });

export type MatchCreateInput = z.infer<typeof matchCreateSchema>;
export type MatchUpdateInput = z.infer<typeof matchUpdateSchema>;

// ============================================================================
// AZIONE SCHEMAS
// ============================================================================

export const azioneCreateSchema = z.object({
  tipo: z.enum(['chiamata', 'visita', 'email', 'whatsapp', 'followup', 'altro']),
  descrizione: z.string().min(1, 'La descrizione è obbligatoria'),
  clienteId: z.string().cuid('ID cliente non valido').optional().nullable(),
  immobileId: z.string().cuid('ID immobile non valido').optional().nullable(),

  priorita: z.enum(['alta', 'media', 'bassa']).default('media'),
  stato: z.enum(['da_fare', 'in_corso', 'completata', 'cancellata']).default('da_fare'),
  dataScadenza: z.string().datetime().optional().nullable(),
});

export const azioneUpdateSchema = azioneCreateSchema.partial();

export type AzioneCreateInput = z.infer<typeof azioneCreateSchema>;
export type AzioneUpdateInput = z.infer<typeof azioneUpdateSchema>;

// ============================================================================
// PAGINATION & QUERY PARAMS
// ============================================================================

export const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
});

export type PaginationParams = z.infer<typeof paginationSchema>;

// ============================================================================
// FILTER SCHEMAS
// ============================================================================

export const immobiliFiltriSchema = paginationSchema.extend({
  tipologia: z.string().optional(),
  prezzoMin: z.coerce.number().optional(),
  prezzoMax: z.coerce.number().optional(),
  zona: z.string().optional(),
  stato: z.string().optional(),
  search: z.string().optional(),
});

export const clientiFiltriSchema = paginationSchema.extend({
  priorita: z.string().optional(),
  stato: z.string().optional(),
  search: z.string().optional(),
});

export const azioniFiltriSchema = paginationSchema.extend({
  tipo: z.string().optional(),
  stato: z.string().optional(),
  priorita: z.string().optional(),
  clienteId: z.string().optional(),
  dataInizio: z.string().optional(),
  dataFine: z.string().optional(),
});

export type ImmobiliFiltri = z.infer<typeof immobiliFiltriSchema>;
export type ClientiFiltri = z.infer<typeof clientiFiltriSchema>;
export type AzioniFiltri = z.infer<typeof azioniFiltriSchema>;
