import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../modules/database/prisma.service';
import { PrismaErrorHandler } from '../errors/prisma-error.handler';

export interface BaseEntity {
  id: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface PaginationOptions {
  page?: number;
  limit?: number;
}

export interface PaginationResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

type PrismaModel = {
  create: (args: { data: Record<string, unknown> }) => Promise<unknown>;
  findUnique: (args: {
    where: Record<string, unknown>;
    include?: Record<string, unknown>;
  }) => Promise<unknown>;
  findMany: (args?: Record<string, unknown>) => Promise<unknown[]>;
  findFirst: (args: { where: Record<string, unknown> }) => Promise<unknown>;
  update: (args: {
    where: Record<string, unknown>;
    data: Record<string, unknown>;
  }) => Promise<unknown>;
  updateMany: (args: {
    where: Record<string, unknown>;
    data: Record<string, unknown>;
  }) => Promise<{ count: number }>;
  delete: (args: { where: Record<string, unknown> }) => Promise<unknown>;
  deleteMany: (args: { where: Record<string, unknown> }) => Promise<{ count: number }>;
  count: (args?: { where?: Record<string, unknown> }) => Promise<number>;
  upsert: (args: {
    where: Record<string, unknown>;
    create: Record<string, unknown>;
    update: Record<string, unknown>;
  }) => Promise<unknown>;
};

@Injectable()
export abstract class BaseRepository<T extends BaseEntity> {
  protected abstract modelName: string;

  constructor(protected readonly prisma: PrismaService) {}

  protected get model(): PrismaModel {
    return (this.prisma as unknown as Record<string, PrismaModel>)[this.modelName];
  }

  async create(data: Record<string, unknown>): Promise<T> {
    try {
      return (await this.model.create({ data })) as T;
    } catch (error) {
      PrismaErrorHandler.handle(error, 'Erro ao criar registro');
    }
  }

  async findById(id: string): Promise<T | null> {
    try {
      return (await this.model.findUnique({ where: { id } })) as T | null;
    } catch (error) {
      PrismaErrorHandler.handle(error, 'Erro ao buscar registro por ID');
    }
  }

  async findAll(options?: PaginationOptions): Promise<PaginationResult<T>> {
    try {
      const page = options?.page || 1;
      const limit = options?.limit || 10;
      const skip = (page - 1) * limit;

      const [data, total] = await Promise.all([
        this.model.findMany({
          skip,
          take: limit,
          orderBy: { createdAt: 'desc' },
        }),
        this.model.count(),
      ]);

      return {
        data: data as T[],
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      };
    } catch (error) {
      PrismaErrorHandler.handle(error, 'Erro ao buscar registros');
    }
  }

  async findMany(
    where?: Record<string, unknown>,
    options?: PaginationOptions,
  ): Promise<PaginationResult<T>> {
    try {
      const page = options?.page || 1;
      const limit = options?.limit || 10;
      const skip = (page - 1) * limit;

      const [data, total] = await Promise.all([
        this.model.findMany({
          where,
          skip,
          take: limit,
          orderBy: { createdAt: 'desc' },
        }),
        this.model.count({ where }),
      ]);

      return {
        data: data as T[],
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      };
    } catch (error) {
      PrismaErrorHandler.handle(error, 'Erro ao buscar registros filtrados');
    }
  }

  async findFirst(where: Record<string, unknown>): Promise<T | null> {
    try {
      return (await this.model.findFirst({ where })) as T | null;
    } catch (error) {
      PrismaErrorHandler.handle(error, 'Erro ao buscar o primeiro registro');
    }
  }

  async update(id: string, data: Record<string, unknown>): Promise<T> {
    try {
      return (await this.model.update({
        where: { id },
        data,
      })) as T;
    } catch (error) {
      PrismaErrorHandler.handle(error, 'Erro ao atualizar registro');
    }
  }

  async delete(id: string): Promise<T> {
    try {
      return (await this.model.delete({ where: { id } })) as T;
    } catch (error) {
      PrismaErrorHandler.handle(error, 'Erro ao deletar registro');
    }
  }

  async deleteMany(where: Record<string, unknown>): Promise<{ count: number }> {
    try {
      return await this.model.deleteMany({ where });
    } catch (error) {
      PrismaErrorHandler.handle(error, 'Erro ao deletar registros');
    }
  }

  async upsert(
    where: Record<string, unknown>,
    create: Record<string, unknown>,
    update: Record<string, unknown>,
  ): Promise<T> {
    try {
      return (await this.model.upsert({
        where,
        create,
        update,
      })) as T;
    } catch (error) {
      PrismaErrorHandler.handle(error, 'Erro ao criar ou atualizar registro');
    }
  }

  async exists(where: Record<string, unknown>): Promise<boolean> {
    try {
      const count = await this.model.count({ where });
      return count > 0;
    } catch (error) {
      PrismaErrorHandler.handle(error, 'Erro ao verificar existência do registro');
    }
  }

  async count(where?: Record<string, unknown>): Promise<number> {
    try {
      return await this.model.count({ where });
    } catch (error) {
      PrismaErrorHandler.handle(error, 'Erro ao contar registros');
    }
  }
}
