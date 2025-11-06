/**
 * Requests API - GET/POST /api/requests
 */

export const dynamic = 'force-dynamic';

import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { apiResponse, apiError, getPaginationParams, generateCode } from '@/lib/utils';
import { createRequestSchema } from '@/lib/validation';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const { skip, take } = getPaginationParams(searchParams);

    const where: any = {};
    if (searchParams.get('status')) where.status = searchParams.get('status');
    if (searchParams.get('urgency')) where.urgency = searchParams.get('urgency');
    if (searchParams.get('contactId')) where.contactId = searchParams.get('contactId');

    const [requests, total] = await Promise.all([
      prisma.request.findMany({
        where,
        skip,
        take,
        include: {
          contact: { select: { id: true, code: true, fullName: true, primaryPhone: true } },
          _count: { select: { matches: true, activities: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.request.count({ where }),
    ]);

    return apiResponse({ requests, pagination: { total, page: Math.floor(skip / take) + 1, limit: take, pages: Math.ceil(total / take) } });
  } catch (error) {
    return apiError(error as Error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = createRequestSchema.parse(body);

    const count = await prisma.request.count();
    const code = generateCode('REQ', count);

    const req = await prisma.request.create({
      data: {
        ...data,
        code,
        searchCities: data.searchCities ? JSON.stringify(data.searchCities) : undefined,
        searchZones: data.searchZones ? JSON.stringify(data.searchZones) : undefined,
        propertyTypes: data.propertyTypes ? JSON.stringify(data.propertyTypes) : undefined,
      } as any,
      include: { contact: true },
    });

    return apiResponse(req, 201);
  } catch (error) {
    return apiError(error as Error, 400);
  }
}
