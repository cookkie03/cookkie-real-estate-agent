/**
 * Single Property API Endpoint
 * GET /api/properties/[id] - Get property by ID
 * PUT /api/properties/[id] - Update property
 * DELETE /api/properties/[id] - Delete property
 */

export const dynamic = 'force-dynamic';

import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { apiResponse, apiError } from '@/lib/utils';
import { updatePropertySchema } from '@/lib/validation';

type RouteContext = {
  params: { id: string };
};

/**
 * GET /api/properties/[id]
 * Get single property by ID
 */
export async function GET(request: NextRequest, { params }: RouteContext) {
  try {
    const { id } = params;

    const property = await prisma.property.findUnique({
      where: { id },
      include: {
        owner: true,
        building: true,
        matches: {
          include: {
            request: {
              include: {
                contact: {
                  select: {
                    id: true,
                    code: true,
                    fullName: true,
                    primaryPhone: true,
                    primaryEmail: true,
                  },
                },
              },
            },
          },
          take: 10,
          orderBy: { scoreTotal: 'desc' },
        },
        activities: {
          take: 10,
          orderBy: { createdAt: 'desc' },
        },
        tags: {
          include: {
            tag: true,
          },
        },
      },
    });

    if (!property) {
      return apiError('Property not found', 404);
    }

    return apiResponse(property);
  } catch (error) {
    return apiError(error as Error);
  }
}

/**
 * PUT /api/properties/[id]
 * Update property
 */
export async function PUT(request: NextRequest, { params }: RouteContext) {
  try {
    const { id } = params;
    const body = await request.json();

    // Validate input
    const data = updatePropertySchema.parse(body);

    // Check if property exists
    const existing = await prisma.property.findUnique({ where: { id } });
    if (!existing) {
      return apiError('Property not found', 404);
    }

    // Update property
    const property = await prisma.property.update({
      where: { id },
      data: data as any,
      include: {
        owner: true,
        building: true,
      },
    });

    return apiResponse(property);
  } catch (error) {
    return apiError(error as Error, 400);
  }
}

/**
 * DELETE /api/properties/[id]
 * Delete property (soft delete - set status to archived)
 */
export async function DELETE(request: NextRequest, { params }: RouteContext) {
  try {
    const { id } = params;

    // Check if property exists
    const existing = await prisma.property.findUnique({ where: { id } });
    if (!existing) {
      return apiError('Property not found', 404);
    }

    // Soft delete - set status to archived
    const property = await prisma.property.update({
      where: { id },
      data: {
        status: 'archived',
        archivedAt: new Date(),
      },
    });

    return apiResponse({ deleted: true, property });
  } catch (error) {
    return apiError(error as Error);
  }
}
