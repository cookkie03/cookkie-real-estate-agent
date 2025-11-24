/**
 * NestJS Application Bootstrap
 *
 * This is the entry point for the CRM Immobiliare backend API.
 * It initializes the NestJS application with all required configurations.
 */

import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from '@core/filters/http-exception.filter';
import { TransformInterceptor } from '@core/interceptors/transform.interceptor';
import { CorrelationIdMiddleware } from '@core/middleware/correlation-id.middleware';

async function bootstrap() {
  const logger = new Logger('Bootstrap');

  // Create NestJS application
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log', 'debug', 'verbose'],
  });

  // Get configuration service
  const configService = app.get(ConfigService);
  const port = configService.get('PORT', 3001);
  const apiPrefix = configService.get('API_PREFIX', 'api');
  const corsOrigin = configService.get('CORS_ORIGIN', 'http://localhost:3000');

  // Set global API prefix
  app.setGlobalPrefix(apiPrefix);

  // Enable CORS
  app.enableCors({
    origin: corsOrigin.split(','),
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Correlation-ID'],
  });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Strip properties that don't have decorators
      forbidNonWhitelisted: true, // Throw error if extra properties
      transform: true, // Transform payloads to DTO instances
      transformOptions: {
        enableImplicitConversion: true, // Convert types automatically
      },
    })
  );

  // Global exception filter
  app.useGlobalFilters(new HttpExceptionFilter());

  // Global transform interceptor (for consistent response format)
  app.useGlobalInterceptors(new TransformInterceptor());

  // Swagger/OpenAPI documentation
  const config = new DocumentBuilder()
    .setTitle('CRM Immobiliare API')
    .setDescription('Backend API for Real Estate CRM with AI capabilities')
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
      },
      'JWT-auth'
    )
    .addTag('auth', 'Authentication endpoints')
    .addTag('properties', 'Property management')
    .addTag('clients', 'Client & contact management')
    .addTag('matching', 'Property-client matching')
    .addTag('scraping', 'Web scraping management')
    .addTag('ai', 'AI assistant')
    .addTag('integrations', 'External integrations (Gmail, Calendar, WhatsApp)')
    .addTag('analytics', 'Analytics & reports')
    .addTag('tasks', 'Activities & tasks')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup(`${apiPrefix}/docs`, app, document);

  // Graceful shutdown
  app.enableShutdownHooks();

  // Start server
  await app.listen(port);

  logger.log(`🚀 Application is running on: http://localhost:${port}/${apiPrefix}`);
  logger.log(`📚 Swagger documentation: http://localhost:${port}/${apiPrefix}/docs`);
  logger.log(`🌍 CORS enabled for: ${corsOrigin}`);
  logger.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
}

bootstrap().catch((error) => {
  console.error('Failed to start application:', error);
  process.exit(1);
});
