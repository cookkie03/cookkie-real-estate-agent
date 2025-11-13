/**
 * Prisma Client Singleton
 *
 * This module exports a singleton instance of PrismaClient
 * to ensure only one connection pool is created across the application.
 *
 * @packageDocumentation
 */

import { PrismaClient } from '@prisma/client';

/**
 * Global type augmentation for PrismaClient singleton
 */
declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

/**
 * Singleton PrismaClient instance
 *
 * In development, we store the client in a global variable
 * to prevent multiple instances during hot reload.
 */
export const prisma =
  global.prisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma;
}

/**
 * Graceful shutdown
 *
 * Disconnect the Prisma client on process termination
 */
process.on('beforeExit', async () => {
  await prisma.$disconnect();
});

export default prisma;
