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

// ============================================================================
// USER PROFILE SERIALIZERS
// ============================================================================

export interface UserSettings {
  commissionPercent: number;
  workHours: {
    start: string;
    end: string;
  };
  autoMatchEnabled: boolean;
  notificationEmail: boolean;
}

export function serializeUserProfileFromDB(profile: any) {
  return {
    ...profile,
    settings: parseObject<UserSettings>(profile.settings, {
      commissionPercent: 3.0,
      workHours: { start: '09:00', end: '19:00' },
      autoMatchEnabled: false,
      notificationEmail: true,
    }),
  };
}

export function serializeUserProfileForDB(profile: any) {
  return {
    ...profile,
    settings: stringifyJSON(profile.settings),
  };
}

// ============================================================================
// CONTACT SERIALIZERS
// ============================================================================

export function serializeContactFromDB(contact: any) {
  return {
    ...contact,
    // Contacts have no JSON fields in current schema
  };
}

export function serializeContactForDB(contact: any) {
  return {
    ...contact,
  };
}

// ============================================================================
// PROPERTY SERIALIZERS
// ============================================================================

export function serializePropertyFromDB(property: any) {
  return {
    ...property,
    urbanConstraints: parseArray<string>(property.urbanConstraints),
    highlights: parseArray<string>(property.highlights),
  };
}

export function serializePropertyForDB(property: any) {
  return {
    ...property,
    urbanConstraints: property.urbanConstraints ? stringifyJSON(property.urbanConstraints) : null,
    highlights: property.highlights ? stringifyJSON(property.highlights) : null,
  };
}

// ============================================================================
// REQUEST SERIALIZERS
// ============================================================================

export function serializeRequestFromDB(request: any) {
  return {
    ...request,
    searchCities: parseArray<string>(request.searchCities),
    searchZones: parseArray<string>(request.searchZones),
    propertyTypes: parseArray<string>(request.propertyTypes),
    preferredOrientation: parseArray<string>(request.preferredOrientation),
  };
}

export function serializeRequestForDB(request: any) {
  return {
    ...request,
    searchCities: request.searchCities ? stringifyJSON(request.searchCities) : null,
    searchZones: request.searchZones ? stringifyJSON(request.searchZones) : null,
    propertyTypes: request.propertyTypes ? stringifyJSON(request.propertyTypes) : null,
    preferredOrientation: request.preferredOrientation ? stringifyJSON(request.preferredOrientation) : null,
  };
}

// ============================================================================
// MATCH SERIALIZERS
// ============================================================================

export function serializeMatchFromDB(match: any) {
  return {
    ...match,
    // Matches have no JSON fields in new schema (scores are separate columns)
  };
}

export function serializeMatchForDB(match: any) {
  return {
    ...match,
  };
}

// ============================================================================
// ACTIVITY SERIALIZERS
// ============================================================================

export interface ActivityDetails {
  // For viewing
  clientFeedback?: 'positive' | 'negative' | 'neutral';
  liked?: string[];
  disliked?: string[];
  willMakeOffer?: boolean;

  // For call
  durationSeconds?: number;
  answered?: boolean;
  callOutcome?: string;

  // For task
  autoGenerated?: boolean;
  generationRule?: string;
  checklist?: Array<{ item: string; done: boolean }>;

  // For offer
  offerAmount?: number;
  conditions?: string;
  validityDays?: number;

  // Generic
  [key: string]: unknown;
}

export function serializeActivityFromDB(activity: any) {
  return {
    ...activity,
    details: parseObject<ActivityDetails>(activity.details, {}),
  };
}

export function serializeActivityForDB(activity: any) {
  return {
    ...activity,
    details: activity.details ? stringifyJSON(activity.details) : '{}',
  };
}

// ============================================================================
// AUDIT LOG SERIALIZERS
// ============================================================================

export function serializeAuditLogFromDB(auditLog: any) {
  return {
    ...auditLog,
    changedFields: parseArray<string>(auditLog.changedFields),
    oldValues: parseObject(auditLog.oldValues, {}),
    newValues: parseObject(auditLog.newValues, {}),
  };
}

export function serializeAuditLogForDB(auditLog: any) {
  return {
    ...auditLog,
    changedFields: auditLog.changedFields ? stringifyJSON(auditLog.changedFields) : null,
    oldValues: auditLog.oldValues ? stringifyJSON(auditLog.oldValues) : null,
    newValues: auditLog.newValues ? stringifyJSON(auditLog.newValues) : null,
  };
}

// ============================================================================
// BATCH SERIALIZERS
// ============================================================================

/**
 * Serializes an array of records from database
 */
export function serializeManyFromDB<T>(
  records: any[],
  serializerFn: (record: any) => T
): T[] {
  return records.map(serializerFn);
}

/**
 * Serializes an array of records for database
 */
export function serializeManyForDB<T>(
  records: any[],
  serializerFn: (record: any) => T
): T[] {
  return records.map(serializerFn);
}

// ============================================================================
// LEGACY COMPATIBILITY (for old schema migration)
// ============================================================================

/**
 * @deprecated Use serializePropertyFromDB instead
 * Prepares an Immobile record from database for API response
 */
export function serializeImmobileFromDB(immobile: any) {
  return {
    ...immobile,
    caratteristiche: parseObject(immobile.caratteristiche),
    foto: parseArray(immobile.foto),
  };
}

/**
 * @deprecated Use serializePropertyForDB instead
 * Prepares an Immobile record for database insert/update
 */
export function serializeImmobileForDB(immobile: any) {
  return {
    ...immobile,
    caratteristiche: stringifyJSON(immobile.caratteristiche),
    foto: stringifyJSON(immobile.foto),
  };
}

/**
 * @deprecated Use serializeContactFromDB instead
 * Prepares a Cliente record from database for API response
 */
export function serializeClienteFromDB(cliente: any) {
  return {
    ...cliente,
    zoneInteresse: parseArray(cliente.zoneInteresse),
  };
}

/**
 * @deprecated Use serializeContactForDB instead
 * Prepares a Cliente record for database insert/update
 */
export function serializeClienteForDB(cliente: any) {
  return {
    ...cliente,
    zoneInteresse: stringifyJSON(cliente.zoneInteresse),
  };
}
