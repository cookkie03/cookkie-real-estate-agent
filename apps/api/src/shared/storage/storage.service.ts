/**
 * Storage Service
 *
 * Manages file uploads/downloads using MinIO (S3-compatible).
 */

import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as Minio from 'minio';
import { randomUUID } from 'crypto';

@Injectable()
export class StorageService implements OnModuleInit {
  private readonly logger = new Logger(StorageService.name);
  private client: Minio.Client;
  private bucketName: string;

  constructor(private configService: ConfigService) {}

  async onModuleInit() {
    const endpoint = this.configService.get('MINIO_ENDPOINT', 'localhost');
    const port = this.configService.get('MINIO_PORT', 9000);
    const useSSL = this.configService.get('MINIO_USE_SSL', false);
    const accessKey = this.configService.get('MINIO_ACCESS_KEY', 'minioadmin');
    const secretKey = this.configService.get('MINIO_SECRET_KEY', 'minioadmin');
    this.bucketName = this.configService.get('MINIO_BUCKET', 'crm-uploads');

    this.client = new Minio.Client({
      endPoint: endpoint,
      port,
      useSSL,
      accessKey,
      secretKey,
    });

    // Ensure bucket exists
    const exists = await this.client.bucketExists(this.bucketName);
    if (!exists) {
      await this.client.makeBucket(this.bucketName, 'eu-west-1');
      this.logger.log(`Bucket "${this.bucketName}" created`);
    }

    this.logger.log('✅ Storage service initialized');
  }

  /**
   * Upload file
   */
  async uploadFile(
    file: Buffer,
    filename: string,
    contentType: string,
    folder = ''
  ): Promise<string> {
    const objectName = folder
      ? `${folder}/${randomUUID()}-${filename}`
      : `${randomUUID()}-${filename}`;

    await this.client.putObject(this.bucketName, objectName, file, {
      'Content-Type': contentType,
    });

    this.logger.debug(`File uploaded: ${objectName}`);
    return objectName;
  }

  /**
   * Get file URL (pre-signed)
   */
  async getFileUrl(objectName: string, expirySeconds = 3600): Promise<string> {
    return await this.client.presignedGetObject(
      this.bucketName,
      objectName,
      expirySeconds
    );
  }

  /**
   * Delete file
   */
  async deleteFile(objectName: string): Promise<void> {
    await this.client.removeObject(this.bucketName, objectName);
    this.logger.debug(`File deleted: ${objectName}`);
  }

  /**
   * List files in folder
   */
  async listFiles(prefix: string): Promise<string[]> {
    const stream = this.client.listObjects(this.bucketName, prefix, true);
    const files: string[] = [];

    return new Promise((resolve, reject) => {
      stream.on('data', (obj) => files.push(obj.name));
      stream.on('end', () => resolve(files));
      stream.on('error', reject);
    });
  }
}
