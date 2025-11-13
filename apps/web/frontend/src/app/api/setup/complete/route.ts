/**
 * API Route: Complete Setup
 * POST /api/setup/complete
 *
 * Completa il setup iniziale creando il UserProfile con tutti i dati.
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      fullName,
      email,
      phone,
      agencyName,
      agencyVat,
      agencyAddress,
      googleApiKey,
      commissionPercent,
    } = body;

    // Validation
    if (!fullName || !email) {
      return NextResponse.json(
        { error: 'Nome ed email sono obbligatori' },
        { status: 400 }
      );
    }

    // Check if setup already completed
    const existingProfile = await prisma.userProfile.findFirst();
    if (existingProfile) {
      return NextResponse.json(
        { error: 'Setup già completato' },
        { status: 400 }
      );
    }

    // Create settings object
    const settings = {
      commissionPercent: commissionPercent || 3.0,
      ...(googleApiKey && { googleApiKey }),
    };

    // Create UserProfile
    const userProfile = await prisma.userProfile.create({
      data: {
        fullName,
        email,
        phone: phone || null,
        agencyName: agencyName || null,
        agencyVat: agencyVat || null,
        agencyAddress: agencyAddress || null,
        settings,
      },
    });

    return NextResponse.json({
      success: true,
      profile: {
        id: userProfile.id,
        fullName: userProfile.fullName,
        email: userProfile.email,
      },
    });
  } catch (error: any) {
    console.error('[API Setup Complete] Error:', error);
    return NextResponse.json(
      { error: error.message || 'Errore durante il setup' },
      { status: 500 }
    );
  }
}
