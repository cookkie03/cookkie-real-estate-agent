/**
 * Database Module
 *
 * Provides Prisma client as a global service.
 * Handles connection lifecycle and graceful shutdown.
 */

import { Module, Global } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class DatabaseModule {}
