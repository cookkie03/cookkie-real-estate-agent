/**
 * Matches API - GET/POST /api/matches
 */

export const dynamic = 'force-dynamic';

import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { apiResponse, apiError, getPaginationParams } from '@/lib/utils';
import { createMatchSchema } from '@/lib/validation';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const { skip, take } = getPaginationParams(searchParams);

    const where: any = {};
    if (searchParams.get('status')) where.status = searchParams.get('status');
    if (searchParams.get('requestId')) where.requestId = searchParams.get('requestId');
    if (searchParams.get('propertyId')) where.propertyId = searchParams.get('propertyId');
    const minScore = searchParams.get('minScore');
    if (minScore) where.scoreTotal = { gte: parseInt(minScore, 10) };

    const [matches, total] = await Promise.all([
      prisma.match.findMany({
        where,
        skip,
        take,
        include: {
          request: { include: { contact: { select: { id: true, code: true, fullName: true } } } },
          property: { select: { id: true, code: true, title: true, city: true, priceSale: true, priceRentMonthly: true } },
        },
        orderBy: { scoreTotal: 'desc' },
      }),
      prisma.match.count({ where }),
    ]);

    return apiResponse({ matches, pagination: { total, page: Math.floor(skip / take) + 1, limit: take, pages: Math.ceil(total / take) } });
  } catch (error) {
    return apiError(error as Error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = createMatchSchema.parse(body);

    // Get contactId from request
    const req = await prisma.request.findUnique({ where: { id: data.requestId }, select: { contactId: true } });
    if (!req) return apiError('Request not found', 404);

    const match = await prisma.match.create({
      data: {
        ...data,
        contactId: req.contactId,
      },
      include: { request: true, property: true },
    });

    return apiResponse(match, 201);
  } catch (error) {
    return apiError(error as Error, 400);
  }
}
