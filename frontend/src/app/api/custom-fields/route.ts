/**
 * CRM IMMOBILIARE - Custom Field Definitions API
 *
 * Manages user-defined custom fields for entities
 * GET /api/custom-fields?entityType=Property
 * POST /api/custom-fields
 *
 * @module api/custom-fields
 * @since v3.1.1
 */

export const dynamic = 'force-dynamic';

import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { apiResponse, apiError } from '@/lib/utils';
import { z } from 'zod';

// Validation schema for custom field definition
const customFieldSchema = z.object({
  name: z.string().min(1).max(100).regex(/^[a-zA-Z0-9_]+$/, 'Nome deve contenere solo lettere, numeri e underscore'),
  label: z.string().min(1).max(200),
  entityType: z.enum(['Contact', 'Property', 'Building', 'Request', 'Activity']),
  fieldType: z.enum(['text', 'number', 'date', 'boolean', 'select', 'multiselect']).default('text'),
  required: z.boolean().default(false),
  validationRules: z.record(z.any()).optional(),
  options: z.array(z.string()).optional(),
  section: z.string().optional(),
  displayOrder: z.number().int().default(0),
  isActive: z.boolean().default(true),
});

/**
 * GET /api/custom-fields
 * Lista custom field definitions, opzionalmente filtrate per entityType
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const entityType = searchParams.get('entityType');
    const isActive = searchParams.get('isActive');

    const where: any = {};

    if (entityType) {
      where.entityType = entityType;
    }

    if (isActive !== null && isActive !== undefined) {
      where.isActive = isActive === 'true';
    }

    const customFields = await prisma.customFieldDefinition.findMany({
      where,
      orderBy: [
        { entityType: 'asc' },
        { displayOrder: 'asc' },
        { createdAt: 'asc' },
      ],
      include: {
        _count: {
          select: { values: true }
        }
      }
    });

    return apiResponse({ customFields });
  } catch (error) {
    return apiError(error as Error);
  }
}

/**
 * POST /api/custom-fields
 * Crea una nuova custom field definition
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate input
    const validatedData = customFieldSchema.parse(body);

    // Check for duplicate name within same entityType
    const existing = await prisma.customFieldDefinition.findFirst({
      where: {
        entityType: validatedData.entityType,
        name: validatedData.name,
      }
    });

    if (existing) {
      return apiError(
        new Error(`Campo con nome "${validatedData.name}" già esistente per ${validatedData.entityType}`),
        409
      );
    }

    // Validate options for select/multiselect
    if (['select', 'multiselect'].includes(validatedData.fieldType)) {
      if (!validatedData.options || validatedData.options.length === 0) {
        return apiError(
          new Error('I campi select/multiselect richiedono almeno un\'opzione'),
          400
        );
      }
    }

    const customField = await prisma.customFieldDefinition.create({
      data: {
        name: validatedData.name,
        label: validatedData.label,
        entityType: validatedData.entityType,
        fieldType: validatedData.fieldType,
        required: validatedData.required,
        validationRules: validatedData.validationRules || {},
        options: validatedData.options || [],
        section: validatedData.section,
        displayOrder: validatedData.displayOrder,
        isActive: validatedData.isActive,
      },
    });

    return apiResponse(customField, 201);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return apiError(new Error(error.errors[0].message), 400);
    }
    return apiError(error as Error, 400);
  }
}
