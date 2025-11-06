/**
 * Contacts API Endpoint
 * GET /api/contacts - List contacts
 * POST /api/contacts - Create contact
 */

export const dynamic = 'force-dynamic';

import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { apiResponse, apiError, getPaginationParams, generateCode } from '@/lib/utils';
import { createContactSchema, contactFiltersSchema } from '@/lib/validation';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const { skip, take } = getPaginationParams(searchParams);

    const filters = contactFiltersSchema.parse({
      status: searchParams.get('status') || undefined,
      importance: searchParams.get('importance') || undefined,
      city: searchParams.get('city') || undefined,
      source: searchParams.get('source') || undefined,
      entityType: searchParams.get('entityType') || undefined,
    });

    const where: any = {};
    if (filters.status) where.status = filters.status;
    if (filters.importance) where.importance = filters.importance;
    if (filters.city) where.city = { contains: filters.city, mode: 'insensitive' };
    if (filters.source) where.source = filters.source;
    if (filters.entityType) where.entityType = filters.entityType;

    const [contacts, total] = await Promise.all([
      prisma.contact.findMany({
        where,
        skip,
        take,
        include: {
          _count: {
            select: {
              ownedProperties: true,
              requests: true,
              matches: true,
              activities: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.contact.count({ where }),
    ]);

    return apiResponse({
      contacts,
      pagination: {
        total,
        page: Math.floor(skip / take) + 1,
        limit: take,
        pages: Math.ceil(total / take),
      },
    });
  } catch (error) {
    return apiError(error as Error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = createContactSchema.parse(body);

    const count = await prisma.contact.count();
    const code = generateCode('CNT', count);

    const contact = await prisma.contact.create({
      data: {
        ...data,
        code,
        birthDate: data.birthDate ? new Date(data.birthDate) : undefined,
      } as any,
    });

    return apiResponse(contact, 201);
  } catch (error) {
    return apiError(error as Error, 400);
  }
}
