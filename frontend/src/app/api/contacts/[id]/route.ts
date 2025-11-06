/**
 * Single Contact API
 * GET/PUT/DELETE /api/contacts/[id]
 */

export const dynamic = 'force-dynamic';

import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { apiResponse, apiError } from '@/lib/utils';
import { updateContactSchema } from '@/lib/validation';

type RouteContext = { params: { id: string } };

export async function GET(request: NextRequest, { params }: RouteContext) {
  try {
    const contact = await prisma.contact.findUnique({
      where: { id: params.id },
      include: {
        ownedProperties: { take: 10, orderBy: { createdAt: 'desc' } },
        requests: { take: 10, orderBy: { createdAt: 'desc' } },
        activities: { take: 10, orderBy: { createdAt: 'desc' } },
        matches: { take: 10, orderBy: { scoreTotal: 'desc' } },
      },
    });

    if (!contact) return apiError('Contact not found', 404);
    return apiResponse(contact);
  } catch (error) {
    return apiError(error as Error);
  }
}

export async function PUT(request: NextRequest, { params }: RouteContext) {
  try {
    const body = await request.json();
    const data = updateContactSchema.parse(body);

    const contact = await prisma.contact.update({
      where: { id: params.id },
      data: data as any,
    });

    return apiResponse(contact);
  } catch (error) {
    return apiError(error as Error, 400);
  }
}

export async function DELETE(request: NextRequest, { params }: RouteContext) {
  try {
    const contact = await prisma.contact.update({
      where: { id: params.id },
      data: { status: 'archived' },
    });

    return apiResponse({ deleted: true, contact });
  } catch (error) {
    return apiError(error as Error);
  }
}
