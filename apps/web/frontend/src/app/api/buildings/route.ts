/**
 * Buildings API - GET/POST /api/buildings
 */

export const dynamic = 'force-dynamic';

import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { apiResponse, apiError, getPaginationParams, generateCode } from '@/lib/utils';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const { skip, take } = getPaginationParams(searchParams);

    const where: any = {};
    if (searchParams.get('city')) where.city = { contains: searchParams.get('city'), mode: 'insensitive' };

    const [buildings, total] = await Promise.all([
      prisma.building.findMany({
        where,
        skip,
        take,
        include: { _count: { select: { properties: true } } },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.building.count({ where }),
    ]);

    return apiResponse({ buildings, pagination: { total, page: Math.floor(skip / take) + 1, limit: take, pages: Math.ceil(total / take) } });
  } catch (error) {
    return apiError(error as Error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const count = await prisma.building.count();
    const code = generateCode('BLD', count);

    const building = await prisma.building.create({ data: { ...body, code } });
    return apiResponse(building, 201);
  } catch (error) {
    return apiError(error as Error, 400);
  }
}
