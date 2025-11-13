/**
 * CRM IMMOBILIARE - Custom Field Values API
 *
 * Manages values for user-defined custom fields
 * GET /api/custom-fields/values?entityType=Property&entityId=xxx
 * PUT /api/custom-fields/values (batch save)
 *
 * @module api/custom-fields/values
 * @since v3.1.1
 */

export const dynamic = 'force-dynamic';

import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { apiResponse, apiError } from '@/lib/utils';
import { z } from 'zod';

const valuesBatchSchema = z.object({
  entityType: z.enum(['Contact', 'Property', 'Building', 'Request', 'Activity']),
  entityId: z.string(),
  values: z.array(z.object({
    fieldId: z.string(),
    value: z.any(), // Can be string, number, boolean, date, or array
  })),
});

/**
 * GET /api/custom-fields/values
 * Recupera tutti i custom field values per una specifica entità
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const entityType = searchParams.get('entityType');
    const entityId = searchParams.get('entityId');

    if (!entityType || !entityId) {
      return apiError(new Error('entityType e entityId sono richiesti'), 400);
    }

    // Fetch field definitions
    const fieldDefinitions = await prisma.customFieldDefinition.findMany({
      where: {
        entityType,
        isActive: true,
      },
      orderBy: [
        { displayOrder: 'asc' },
        { createdAt: 'asc' },
      ],
    });

    // Fetch values
    const values = await prisma.customFieldValue.findMany({
      where: {
        entityType,
        entityId,
      },
      include: {
        field: true,
      }
    });

    // Transform to a more usable format
    const fieldsWithValues = fieldDefinitions.map((field) => {
      const value = values.find((v) => v.fieldId === field.id);

      let parsedValue = null;
      if (value) {
        // Extract value based on field type
        switch (field.fieldType) {
          case 'text':
            parsedValue = value.valueText;
            break;
          case 'number':
            parsedValue = value.valueNumber;
            break;
          case 'boolean':
            parsedValue = value.valueBoolean;
            break;
          case 'date':
            parsedValue = value.valueDate;
            break;
          case 'select':
          case 'multiselect':
            parsedValue = value.valueJson ? JSON.parse(value.valueJson as string) : null;
            break;
        }
      }

      return {
        field,
        value: parsedValue,
        valueId: value?.id,
      };
    });

    return apiResponse({ fields: fieldsWithValues });
  } catch (error) {
    return apiError(error as Error);
  }
}

/**
 * PUT /api/custom-fields/values
 * Salva batch di custom field values per un'entità
 */
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate input
    const validatedData = valuesBatchSchema.parse(body);

    // Fetch field definitions for validation
    const fieldIds = validatedData.values.map((v) => v.fieldId);
    const fields = await prisma.customFieldDefinition.findMany({
      where: {
        id: { in: fieldIds },
        entityType: validatedData.entityType,
      }
    });

    if (fields.length !== fieldIds.length) {
      return apiError(new Error('Uno o più campi non sono validi'), 400);
    }

    // Validate and prepare values
    const updates: any[] = [];

    for (const valueData of validatedData.values) {
      const field = fields.find((f) => f.id === valueData.fieldId);
      if (!field) continue;

      // Validate required fields
      if (field.required && (valueData.value === null || valueData.value === undefined || valueData.value === '')) {
        return apiError(new Error(`Il campo "${field.label}" è obbligatorio`), 400);
      }

      // Skip null/undefined values for non-required fields
      if (valueData.value === null || valueData.value === undefined) {
        continue;
      }

      // Prepare value storage based on field type
      const valueStorage: any = {
        valueText: null,
        valueNumber: null,
        valueBoolean: null,
        valueDate: null,
        valueJson: null,
      };

      switch (field.fieldType) {
        case 'text':
          valueStorage.valueText = String(valueData.value);
          // Validate max length if specified
          if (field.validationRules && typeof field.validationRules === 'object') {
            const rules = field.validationRules as any;
            if (rules.maxLength && valueStorage.valueText.length > rules.maxLength) {
              return apiError(new Error(`"${field.label}" supera la lunghezza massima di ${rules.maxLength} caratteri`), 400);
            }
            if (rules.pattern) {
              const regex = new RegExp(rules.pattern);
              if (!regex.test(valueStorage.valueText)) {
                return apiError(new Error(`"${field.label}" non rispetta il formato richiesto`), 400);
              }
            }
          }
          break;

        case 'number':
          valueStorage.valueNumber = Number(valueData.value);
          if (isNaN(valueStorage.valueNumber)) {
            return apiError(new Error(`"${field.label}" deve essere un numero valido`), 400);
          }
          // Validate min/max if specified
          if (field.validationRules && typeof field.validationRules === 'object') {
            const rules = field.validationRules as any;
            if (rules.min !== undefined && valueStorage.valueNumber < rules.min) {
              return apiError(new Error(`"${field.label}" deve essere almeno ${rules.min}`), 400);
            }
            if (rules.max !== undefined && valueStorage.valueNumber > rules.max) {
              return apiError(new Error(`"${field.label}" non può superare ${rules.max}`), 400);
            }
          }
          break;

        case 'boolean':
          valueStorage.valueBoolean = Boolean(valueData.value);
          break;

        case 'date':
          valueStorage.valueDate = new Date(valueData.value);
          if (isNaN(valueStorage.valueDate.getTime())) {
            return apiError(new Error(`"${field.label}" deve essere una data valida`), 400);
          }
          break;

        case 'select':
          // Validate option exists
          const options = field.options as string[];
          if (!options.includes(valueData.value)) {
            return apiError(new Error(`"${valueData.value}" non è un'opzione valida per "${field.label}"`), 400);
          }
          valueStorage.valueJson = JSON.stringify(valueData.value);
          break;

        case 'multiselect':
          // Validate all options exist
          const multioptions = field.options as string[];
          const selectedValues = Array.isArray(valueData.value) ? valueData.value : [valueData.value];
          const invalidOptions = selectedValues.filter((v: string) => !multioptions.includes(v));
          if (invalidOptions.length > 0) {
            return apiError(new Error(`Opzioni non valide per "${field.label}": ${invalidOptions.join(', ')}`), 400);
          }
          valueStorage.valueJson = JSON.stringify(selectedValues);
          break;
      }

      updates.push({
        fieldId: field.id,
        ...valueStorage,
      });
    }

    // Batch upsert values
    const results = await Promise.all(
      updates.map((update) =>
        prisma.customFieldValue.upsert({
          where: {
            fieldId_entityType_entityId: {
              fieldId: update.fieldId,
              entityType: validatedData.entityType,
              entityId: validatedData.entityId,
            }
          },
          update: {
            valueText: update.valueText,
            valueNumber: update.valueNumber,
            valueBoolean: update.valueBoolean,
            valueDate: update.valueDate,
            valueJson: update.valueJson,
          },
          create: {
            fieldId: update.fieldId,
            entityType: validatedData.entityType,
            entityId: validatedData.entityId,
            valueText: update.valueText,
            valueNumber: update.valueNumber,
            valueBoolean: update.valueBoolean,
            valueDate: update.valueDate,
            valueJson: update.valueJson,
          },
        })
      )
    );

    return apiResponse({
      message: 'Valori salvati con successo',
      savedCount: results.length,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return apiError(new Error(error.errors[0].message), 400);
    }
    return apiError(error as Error, 400);
  }
}
