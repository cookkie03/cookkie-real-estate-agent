/**
 * CRM IMMOBILIARE - Custom Fields Utilities
 *
 * Utility functions for dynamic custom fields system
 * - Zod schema generation
 * - Value formatting
 * - Type conversion
 *
 * @module lib/custom-fields
 * @since v3.1.1
 */

import { z } from 'zod';

export type EntityType = 'Contact' | 'Property' | 'Building' | 'Request' | 'Activity';
export type FieldType = 'text' | 'number' | 'date' | 'boolean' | 'select' | 'multiselect';

export interface CustomFieldDefinition {
  id: string;
  name: string;
  label: string;
  entityType: EntityType;
  fieldType: FieldType;
  required: boolean;
  validationRules?: Record<string, any>;
  options?: string[];
  section?: string;
  displayOrder: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CustomFieldValue {
  id: string;
  fieldId: string;
  entityType: EntityType;
  entityId: string;
  valueText?: string | null;
  valueNumber?: number | null;
  valueBoolean?: boolean | null;
  valueDate?: Date | null;
  valueJson?: any;
  createdAt: Date;
  updatedAt: Date;
}

export interface CustomFieldWithValue {
  field: CustomFieldDefinition;
  value: any;
  valueId?: string;
}

/**
 * Builds a Zod schema from a CustomFieldDefinition
 * Used for runtime validation on the client and server
 */
export function buildCustomFieldSchema(field: CustomFieldDefinition): z.ZodTypeAny {
  let schema: z.ZodTypeAny;

  switch (field.fieldType) {
    case 'text':
      schema = z.string();

      // Apply validation rules
      if (field.validationRules) {
        const rules = field.validationRules;

        if (rules.minLength) {
          schema = (schema as z.ZodString).min(rules.minLength, `Minimo ${rules.minLength} caratteri`);
        }
        if (rules.maxLength) {
          schema = (schema as z.ZodString).max(rules.maxLength, `Massimo ${rules.maxLength} caratteri`);
        }
        if (rules.pattern) {
          schema = (schema as z.ZodString).regex(
            new RegExp(rules.pattern),
            rules.patternMessage || 'Formato non valido'
          );
        }
      }
      break;

    case 'number':
      schema = z.number({
        invalid_type_error: 'Deve essere un numero',
      });

      // Apply validation rules
      if (field.validationRules) {
        const rules = field.validationRules;

        if (rules.min !== undefined) {
          schema = (schema as z.ZodNumber).min(rules.min, `Minimo ${rules.min}`);
        }
        if (rules.max !== undefined) {
          schema = (schema as z.ZodNumber).max(rules.max, `Massimo ${rules.max}`);
        }
        if (rules.int) {
          schema = (schema as z.ZodNumber).int('Deve essere un numero intero');
        }
        if (rules.positive) {
          schema = (schema as z.ZodNumber).positive('Deve essere positivo');
        }
      }
      break;

    case 'boolean':
      schema = z.boolean();
      break;

    case 'date':
      schema = z.coerce.date({
        invalid_type_error: 'Deve essere una data valida',
      });

      // Apply validation rules
      if (field.validationRules) {
        const rules = field.validationRules;

        if (rules.minDate) {
          const minDate = new Date(rules.minDate);
          schema = (schema as z.ZodDate).min(minDate, `Data minima: ${minDate.toLocaleDateString('it-IT')}`);
        }
        if (rules.maxDate) {
          const maxDate = new Date(rules.maxDate);
          schema = (schema as z.ZodDate).max(maxDate, `Data massima: ${maxDate.toLocaleDateString('it-IT')}`);
        }
      }
      break;

    case 'select':
      if (!field.options || field.options.length === 0) {
        throw new Error(`Campo select "${field.name}" richiede opzioni`);
      }
      schema = z.enum(field.options as [string, ...string[]], {
        errorMap: () => ({ message: 'Seleziona un\'opzione valida' }),
      });
      break;

    case 'multiselect':
      if (!field.options || field.options.length === 0) {
        throw new Error(`Campo multiselect "${field.name}" richiede opzioni`);
      }
      schema = z.array(
        z.enum(field.options as [string, ...string[]])
      ).min(1, 'Seleziona almeno un\'opzione');
      break;

    default:
      schema = z.any();
  }

  // Make optional if not required
  if (!field.required) {
    schema = schema.optional();
  }

  return schema;
}

/**
 * Builds a complete Zod schema for all custom fields of an entity type
 */
export function buildCustomFieldsSchema(fields: CustomFieldDefinition[]): z.ZodObject<any> {
  const shape: Record<string, z.ZodTypeAny> = {};

  for (const field of fields) {
    if (!field.isActive) continue;
    shape[field.name] = buildCustomFieldSchema(field);
  }

  return z.object(shape);
}

/**
 * Extracts the value from a CustomFieldValue based on field type
 */
export function extractValue(
  fieldValue: CustomFieldValue | null | undefined,
  fieldType: FieldType
): any {
  if (!fieldValue) return null;

  switch (fieldType) {
    case 'text':
      return fieldValue.valueText;
    case 'number':
      return fieldValue.valueNumber;
    case 'boolean':
      return fieldValue.valueBoolean;
    case 'date':
      return fieldValue.valueDate;
    case 'select':
    case 'multiselect':
      try {
        return fieldValue.valueJson ? JSON.parse(fieldValue.valueJson as any) : null;
      } catch {
        return null;
      }
    default:
      return null;
  }
}

/**
 * Formats a custom field value for display
 */
export function formatCustomFieldValue(value: any, fieldType: FieldType, options?: string[]): string {
  if (value === null || value === undefined) return '-';

  switch (fieldType) {
    case 'text':
      return String(value);

    case 'number':
      return new Intl.NumberFormat('it-IT').format(value);

    case 'boolean':
      return value ? 'Sì' : 'No';

    case 'date':
      const date = typeof value === 'string' ? new Date(value) : value;
      return date.toLocaleDateString('it-IT');

    case 'select':
      return String(value);

    case 'multiselect':
      return Array.isArray(value) ? value.join(', ') : String(value);

    default:
      return String(value);
  }
}

/**
 * Groups custom fields by section
 */
export function groupFieldsBySection(
  fields: CustomFieldDefinition[]
): Map<string, CustomFieldDefinition[]> {
  const groups = new Map<string, CustomFieldDefinition[]>();

  for (const field of fields) {
    const section = field.section || 'Altri Campi';
    if (!groups.has(section)) {
      groups.set(section, []);
    }
    groups.get(section)!.push(field);
  }

  return groups;
}

/**
 * Validates custom field value against its definition
 */
export function validateCustomFieldValue(
  value: any,
  field: CustomFieldDefinition
): { valid: boolean; error?: string } {
  try {
    const schema = buildCustomFieldSchema(field);
    schema.parse(value);
    return { valid: true };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { valid: false, error: error.errors[0].message };
    }
    return { valid: false, error: 'Valore non valido' };
  }
}

/**
 * Converts form values to API format for saving
 */
export function prepareValuesForSave(
  formValues: Record<string, any>,
  fields: CustomFieldDefinition[]
): Array<{ fieldId: string; value: any }> {
  return fields
    .filter(field => field.isActive)
    .map(field => ({
      fieldId: field.id,
      value: formValues[field.name],
    }))
    .filter(item => item.value !== undefined && item.value !== null && item.value !== '');
}
