/**
 * Tags API - GET/POST /api/tags
 */

export const dynamic = 'force-dynamic';

import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { apiResponse, apiError } from '@/lib/utils';

export async function GET() {
  try {
    const tags = await prisma.tag.findMany({
      orderBy: { usageCount: 'desc' },
      take: 100,
    });

    return apiResponse({ tags });
  } catch (error) {
    return apiError(error as Error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const tag = await prisma.tag.create({
      data: {
        name: body.name,
        category: body.category,
        color: body.color,
      },
    });

    return apiResponse(tag, 201);
  } catch (error) {
    return apiError(error as Error, 400);
  }
}
