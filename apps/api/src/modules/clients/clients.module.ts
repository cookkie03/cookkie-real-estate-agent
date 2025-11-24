/**
 * Clients Module
 *
 * Manages contacts, clients, and leads.
 */

import { Module } from '@nestjs/common';
import { ClientsController } from './presentation/controllers/clients.controller';
import { ClientsService } from './application/services/clients.service';
import { ClientRepository } from './infrastructure/repositories/client.repository';

@Module({
  controllers: [ClientsController],
  providers: [ClientsService, ClientRepository],
  exports: [ClientsService],
})
export class ClientsModule {}
