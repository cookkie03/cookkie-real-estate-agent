/**
 * Storage Module
 *
 * Provides MinIO (S3-compatible) object storage.
 * Used for property photos, documents, etc.
 */

import { Module, Global } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { StorageService } from './storage.service';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [StorageService],
  exports: [StorageService],
})
export class StorageModule {}
