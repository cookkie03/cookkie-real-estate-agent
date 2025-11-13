/**
 * Matching Module
 *
 * Handles property-client matching using 7-component scoring algorithm.
 *
 * Clean Architecture Layers:
 * - Domain: Entities, algorithms (7 scorers)
 * - Application: Services, use cases
 * - Infrastructure: Repositories (uses Prisma)
 * - Presentation: Controllers, DTOs
 *
 * ✅ IMPLEMENTED (Phase 2):
 * - domain/entities/match-result.entity.ts
 * - domain/algorithms/matching.algorithm.ts (main orchestrator)
 * - domain/algorithms/zone-scorer.ts (25% weight)
 * - domain/algorithms/budget-scorer.ts (20% weight)
 * - domain/algorithms/type-scorer.ts (15% weight)
 * - domain/algorithms/surface-scorer.ts (15% weight)
 * - domain/algorithms/availability-scorer.ts (10% weight)
 * - domain/algorithms/priority-scorer.ts (10% weight)
 * - domain/algorithms/affinity-scorer.ts (5% weight)
 * - application/services/matching.service.ts
 * - presentation/controllers/matching.controller.ts
 * - presentation/dto/matching.dto.ts
 */

import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../shared/database/database.module';
import { MatchingController } from './presentation/controllers/matching.controller';
import { MatchingService } from './application/services/matching.service';

@Module({
  imports: [DatabaseModule],
  controllers: [MatchingController],
  providers: [MatchingService],
  exports: [MatchingService],
})
export class MatchingModule {}
