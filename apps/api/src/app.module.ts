/**
 * Root Application Module
 *
 * This module orchestrates all feature modules and shared infrastructure.
 * It follows the modular architecture pattern of NestJS.
 */

import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';

// Core
import { LoggerMiddleware } from '@core/middleware/logger.middleware';
import { CorrelationIdMiddleware } from '@core/middleware/correlation-id.middleware';
import { envValidationSchema } from '@core/config/env.validation';

// Shared infrastructure
import { DatabaseModule } from '@shared/database/database.module';
import { CacheModule } from '@shared/cache/cache.module';
import { QueueModule } from '@shared/queue/queue.module';
import { StorageModule } from '@shared/storage/storage.module';
import { WebSocketModule } from '@shared/websocket/websocket.module';

// Feature modules
import { AuthModule } from '@modules/auth/auth.module';
import { PropertiesModule } from '@modules/properties/properties.module';
import { ClientsModule } from '@modules/clients/clients.module';
import { MatchingModule } from '@modules/matching/matching.module';
import { ScrapingModule } from '@modules/scraping/scraping.module';
import { AiAssistantModule } from '@modules/ai-assistant/ai-assistant.module';
import { IntegrationsModule } from '@modules/integrations/integrations.module';
import { AnalyticsModule } from '@modules/analytics/analytics.module';
import { TasksModule } from '@modules/tasks/tasks.module';

// Guards
import { ThrottlerGuard } from '@nestjs/throttler';

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
      validationSchema: envValidationSchema,
    }),

    // Rate limiting (global)
    ThrottlerModule.forRoot([
      {
        ttl: 60000, // Time window in milliseconds (1 minute)
        limit: 100, // Max requests per window
      },
    ]),

    // Shared infrastructure modules
    DatabaseModule,
    CacheModule,
    QueueModule,
    StorageModule,
    WebSocketModule,

    // Feature modules (Domain-Driven Design)
    AuthModule,
    PropertiesModule,
    ClientsModule,
    MatchingModule,
    ScrapingModule,
    AiAssistantModule,
    IntegrationsModule,
    AnalyticsModule,
    TasksModule,
  ],
  providers: [
    // Global rate limiting guard
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    // Apply global middleware
    consumer.apply(CorrelationIdMiddleware, LoggerMiddleware).forRoutes('*');
  }
}
