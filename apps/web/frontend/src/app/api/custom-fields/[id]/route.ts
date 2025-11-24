/**
 * CRM IMMOBILIARE - Custom Field Definition API (Single)
 *
 * Manages individual custom field definitions
 * GET /api/custom-fields/:id
 * PUT /api/custom-fields/:id
 * DELETE /api/custom-fields/:id
 *
 * @module api/custom-fields/[id]
 * @since v3.1.1
 */

export const dynamic = 'force-dynamic';

import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { apiResponse, apiError } from '@/lib/utils';
import { z } from 'zod';

const updateFieldSchema = z.object({
  label: z.string().min(1).max(200).optional(),
  fieldType: z.enum(['text', 'number', 'date', 'boolean', 'select', 'multiselect']).optional(),
  required: z.boolean().optional(),
  validationRules: z.record(z.any()).optional(),
  options: z.array(z.string()).optional(),
  section: z.string().optional(),
  displayOrder: z.number().int().optional(),
  isActive: z.boolean().optional(),
});

interface RouteParams {
  params: {
    id: string;
  };
}

/**
 * GET /api/custom-fields/:id
 * Recupera una singola custom field definition
 */
export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const customField = await prisma.customFieldDefinition.findUnique({
      where: { id: params.id },
      include: {
        _count: {
          select: { values: true }
        }
      }
    });

    if (!customField) {
      return apiError(new Error('Campo personalizzato non trovato'), 404);
    }

    return apiResponse(customField);
  } catch (error) {
    return apiError(error as Error);
  }
}

/**
 * PUT /api/custom-fields/:id
 * Aggiorna una custom field definition
 */
export async function PUT(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const body = await request.json();

    // Validate input
    const validatedData = updateFieldSchema.parse(body);

    // Check if field exists
    const existing = await prisma.customFieldDefinition.findUnique({
      where: { id: params.id }
    });

    if (!existing) {
      return apiError(new Error('Campo personalizzato non trovato'), 404);
    }

    // Validate options for select/multiselect if fieldType is changing
    const newFieldType = validatedData.fieldType || existing.fieldType;
    if (['select', 'multiselect'].includes(newFieldType)) {
      const newOptions = validatedData.options || (existing.options as string[]);
      if (!newOptions || newOptions.length === 0) {
        return apiError(
          new Error('I campi select/multiselect richiedono almeno un\'opzione'),
          400
        );
      }
    }

    const customField = await prisma.customFieldDefinition.update({
      where: { id: params.id },
      data: {
        ...(validatedData.label && { label: validatedData.label }),
        ...(validatedData.fieldType && { fieldType: validatedData.fieldType }),
        ...(validatedData.required !== undefined && { required: validatedData.required }),
        ...(validatedData.validationRules !== undefined && { validationRules: validatedData.validationRules }),
        ...(validatedData.options !== undefined && { options: validatedData.options }),
        ...(validatedData.section !== undefined && { section: validatedData.section }),
        ...(validatedData.displayOrder !== undefined && { displayOrder: validatedData.displayOrder }),
        ...(validatedData.isActive !== undefined && { isActive: validatedData.isActive }),
      },
    });

    return apiResponse(customField);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return apiError(new Error(error.errors[0].message), 400);
    }
    return apiError(error as Error, 400);
  }
}

/**
 * DELETE /api/custom-fields/:id
 * Elimina una custom field definition
 * Cascade delete: elimina anche tutti i valori associati
 */
export async function DELETE(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    // Check if field exists
    const existing = await prisma.customFieldDefinition.findUnique({
      where: { id: params.id },
      include: {
        _count: {
          select: { values: true }
        }
      }
    });

    if (!existing) {
      return apiError(new Error('Campo personalizzato non trovato'), 404);
    }

    // Delete field (cascade deletes values automatically)
    await prisma.customFieldDefinition.delete({
      where: { id: params.id }
    });

    return apiResponse({
      message: 'Campo personalizzato eliminato con successo',
      deletedValuesCount: existing._count.values
    });
  } catch (error) {
    return apiError(error as Error);
  }
}
