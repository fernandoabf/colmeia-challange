import { Customer } from '../entities/customer.entity';
import { PaginationOptions, PaginationResult } from '../../../common/repositories/base.repository';

export interface ICustomerRepository {
  create(data: Record<string, unknown>): Promise<Customer>;
  findById(id: string): Promise<Customer | null>;
  findByEmail(email: string): Promise<Customer | null>;
  findByDocument(document: string): Promise<Customer | null>;
  findAll(options?: PaginationOptions): Promise<PaginationResult<Customer>>;
  update(id: string, data: Record<string, unknown>): Promise<Customer>;
  delete(id: string): Promise<Customer>;
}
