/**
 * CRM IMMOBILIARE - Dashboard Stats API
 *
 * Returns real-time statistics for dashboard display
 *
 * @module api/dashboard/stats
 * @since v3.2.0
 */

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    // Fetch all stats in parallel for better performance
    const [
      propertiesTotal,
      propertiesAvailable,
      propertiesSold,
      propertiesRented,
      contactsTotal,
      contactsActive,
      contactsLeads,
      requestsTotal,
      requestsActive,
      matchesTotal,
      matchesPending,
    ] = await Promise.all([
      prisma.property.count(),
      prisma.property.count({ where: { status: "available" } }),
      prisma.property.count({ where: { status: "sold" } }),
      prisma.property.count({ where: { status: "rented" } }),
      prisma.contact.count(),
      prisma.contact.count({ where: { status: "active" } }),
      prisma.contact.count({ where: { importance: "high" } }), // Using "high" as proxy for leads
      prisma.request.count(),
      prisma.request.count({ where: { status: "active" } }),
      prisma.match.count(),
      prisma.match.count({ where: { status: "suggested" } }),
    ]);

    return NextResponse.json({
      properties: {
        total: propertiesTotal,
        available: propertiesAvailable,
        sold: propertiesSold,
        rented: propertiesRented,
      },
      contacts: {
        total: contactsTotal,
        active: contactsActive,
        leads: contactsLeads,
      },
      requests: {
        total: requestsTotal,
        active: requestsActive,
      },
      matches: {
        total: matchesTotal,
        pending: matchesPending,
        contacted: matchesTotal - matchesPending, // Approximation
      },
      activities: {
        thisWeek: 0, // TODO: Implement when activities have timestamps
        thisMonth: 0,
      },
    });
  } catch (error) {
    console.error("[Dashboard Stats API] Error:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch dashboard stats",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
