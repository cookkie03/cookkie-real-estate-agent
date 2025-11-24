/**
 * Properties Module
 *
 * Manages real estate property listings.
 * Implements Clean Architecture with DDD.
 */

import { Module } from '@nestjs/common';
import { PropertiesController } from './presentation/controllers/properties.controller';
import { PropertiesService } from './application/services/properties.service';
import { PropertyRepository } from './infrastructure/repositories/property.repository';

@Module({
  controllers: [PropertiesController],
  providers: [PropertiesService, PropertyRepository],
  exports: [PropertiesService],
})
export class PropertiesModule {}
