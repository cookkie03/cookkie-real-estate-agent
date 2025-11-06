/**
 * Activities API - GET/POST /api/activities
 */

import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { apiResponse, apiError, getPaginationParams } from '@/lib/utils';
import { createActivitySchema } from '@/lib/validation';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const { skip, take } = getPaginationParams(searchParams);

    const where: any = {};
    if (searchParams.get('status')) where.status = searchParams.get('status');
    if (searchParams.get('activityType')) where.activityType = searchParams.get('activityType');
    if (searchParams.get('priority')) where.priority = searchParams.get('priority');
    if (searchParams.get('contactId')) where.contactId = searchParams.get('contactId');
    if (searchParams.get('propertyId')) where.propertyId = searchParams.get('propertyId');

    const [activities, total] = await Promise.all([
      prisma.activity.findMany({
        where,
        skip,
        take,
        include: {
          contact: { select: { id: true, code: true, fullName: true } },
          property: { select: { id: true, code: true, title: true, city: true } },
        },
        orderBy: { scheduledAt: 'desc' },
      }),
      prisma.activity.count({ where }),
    ]);

    return apiResponse({ activities, pagination: { total, page: Math.floor(skip / take) + 1, limit: take, pages: Math.ceil(total / take) } });
  } catch (error) {
    return apiError(error as Error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = createActivitySchema.parse(body);

    const activity = await prisma.activity.create({
      data: {
        ...data,
        scheduledAt: data.scheduledAt ? new Date(data.scheduledAt) : undefined,
        dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
      } as any,
      include: { contact: true, property: true },
    });

    return apiResponse(activity, 201);
  } catch (error) {
    return apiError(error as Error, 400);
  }
}
