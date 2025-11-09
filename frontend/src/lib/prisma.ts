/**
 * CRM IMMOBILIARE - Prisma Client Singleton
 *
 * Global singleton instance of Prisma Client to prevent
 * multiple instances in development (hot reload)
 *
 * @module lib/prisma
 * @since v3.2.0
 */

import { PrismaClient } from "@prisma/client";

// Prevent multiple instances of Prisma Client in development
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
