/**
 * Database helpers for SQLite JSON serialization
 *
 * SQLite stores JSON as strings, so we need helpers to:
 * - Serialize arrays and objects before saving
 * - Deserialize strings back to arrays/objects when reading
 */

/**
 * Parses a JSON string safely, returns the parsed value or a default
 */
export function parseJSON<T>(value: string | null | undefined, defaultValue: T): T {
  if (!value) return defaultValue;

  try {
    return JSON.parse(value) as T;
  } catch (error) {
    console.error('Failed to parse JSON:', error);
    return defaultValue;
  }
}

/**
 * Stringifies a value to JSON, handling null/undefined
 */
export function stringifyJSON(value: unknown): string {
  if (value === null || value === undefined) return '[]';
  return JSON.stringify(value);
}

/**
 * Parses an array field from database (stored as JSON string)
 */
export function parseArray<T = string>(value: string | null | undefined): T[] {
  return parseJSON<T[]>(value, []);
}

/**
 * Parses an object field from database (stored as JSON string)
 */
export function parseObject<T = Record<string, unknown>>(
  value: string | null | undefined,
  defaultValue: T = {} as T
): T {
  return parseJSON<T>(value, defaultValue);
}

/**
 * Prepares an Immobile record from database for API response
 * Deserializes JSON fields (caratteristiche, foto)
 */
export function serializeImmobileFromDB(immobile: any) {
  return {
    ...immobile,
    caratteristiche: parseObject(immobile.caratteristiche),
    foto: parseArray(immobile.foto),
  };
}

/**
 * Prepares an Immobile record for database insert/update
 * Serializes JSON fields (caratteristiche, foto)
 */
export function serializeImmobileForDB(immobile: any) {
  return {
    ...immobile,
    caratteristiche: stringifyJSON(immobile.caratteristiche),
    foto: stringifyJSON(immobile.foto),
  };
}

/**
 * Prepares a Cliente record from database for API response
 * Deserializes JSON fields (zoneInteresse)
 */
export function serializeClienteFromDB(cliente: any) {
  return {
    ...cliente,
    zoneInteresse: parseArray(cliente.zoneInteresse),
  };
}

/**
 * Prepares a Cliente record for database insert/update
 * Serializes JSON fields (zoneInteresse)
 */
export function serializeClienteForDB(cliente: any) {
  return {
    ...cliente,
    zoneInteresse: stringifyJSON(cliente.zoneInteresse),
  };
}

/**
 * Prepares a Match record from database for API response
 * Deserializes JSON fields (motivi)
 */
export function serializeMatchFromDB(match: any) {
  return {
    ...match,
    motivi: parseArray(match.motivi),
  };
}

/**
 * Prepares a Match record for database insert/update
 * Serializes JSON fields (motivi)
 */
export function serializeMatchForDB(match: any) {
  return {
    ...match,
    motivi: stringifyJSON(match.motivi),
  };
}
