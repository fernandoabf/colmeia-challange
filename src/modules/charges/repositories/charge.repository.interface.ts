import { Charge } from '../entities/charge.entity';
import { ChargeStatus } from '../enums/charge-status.enum';
import { Prisma } from '@prisma/client';

export interface CreateChargeData {
  customerId: string;
  amount: number;
  currency: string;
  paymentMethod: string;
  status: ChargeStatus;
  idempotencyKey?: string;
  metadata?: Prisma.JsonValue;
}

export interface IChargeRepository {
  create(data: Record<string, unknown>): Promise<Charge>;
  findById(id: string): Promise<Charge | null>;
  findByCustomerId(customerId: string): Promise<Charge[]>;
  findByIdempotencyKey(idempotencyKey: string): Promise<Charge | null>;
  updateStatus(id: string, status: ChargeStatus): Promise<Charge>;
}
