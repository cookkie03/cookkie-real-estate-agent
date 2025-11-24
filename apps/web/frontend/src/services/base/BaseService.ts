/**
 * BASE SERVICE
 * Abstract class per tutti i services del CRM
 */
import { PrismaClient } from '@prisma/client';
import { NotFoundError, ValidationError } from './ServiceError';

export interface Pagination {
  skip?: number;
  take?: number;
  orderBy?: any;
}

export abstract class BaseService<T, CreateDTO = any, UpdateDTO = any> {
  constructor(protected prisma: PrismaClient) {}

  abstract getModelName(): string;

  protected getModel(): any {
    return (this.prisma as any)[this.getModelName()];
  }

  async findById(id: string, include?: any): Promise<T | null> {
    return this.getModel().findUnique({
      where: { id },
      include,
    });
  }

  async findMany(filters?: any, pagination?: Pagination): Promise<T[]> {
    return this.getModel().findMany({
      where: filters,
      skip: pagination?.skip,
      take: pagination?.take,
      orderBy: pagination?.orderBy,
    });
  }

  async count(filters?: any): Promise<number> {
    return this.getModel().count({ where: filters });
  }

  async create(data: CreateDTO): Promise<T> {
    await this.validate(data);
    return this.getModel().create({ data });
  }

  async update(id: string, data: UpdateDTO): Promise<T> {
    await this.validate(data);

    const exists = await this.findById(id);
    if (!exists) {
      throw new NotFoundError(this.getModelName(), id);
    }

    return this.getModel().update({
      where: { id },
      data,
    });
  }

  async delete(id: string): Promise<T> {
    const exists = await this.findById(id);
    if (!exists) {
      throw new NotFoundError(this.getModelName(), id);
    }

    if (this.supportsSoftDelete()) {
      return this.softDelete(id);
    }

    return this.getModel().delete({ where: { id } });
  }

  protected async softDelete(id: string): Promise<T> {
    return this.getModel().update({
      where: { id },
      data: {
        archivedAt: new Date(),
      },
    });
  }

  protected abstract validate(data: any): Promise<void>;
  protected abstract supportsSoftDelete(): boolean;

  protected async executeInTransaction<R>(
    operation: (tx: PrismaClient) => Promise<R>
  ): Promise<R> {
    return this.prisma.$transaction(operation);
  }
}
