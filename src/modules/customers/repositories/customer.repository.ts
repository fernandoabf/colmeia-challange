import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { BaseRepository } from '../../../common/repositories/base.repository';
import { ICustomerRepository } from './customer.repository.interface';
import { Customer } from '../entities/customer.entity';

@Injectable()
export class CustomerRepository extends BaseRepository<Customer> implements ICustomerRepository {
  protected modelName = 'customer';

  constructor(prisma: PrismaService) {
    super(prisma);
  }

  async findByEmail(email: string): Promise<Customer | null> {
    return this.prisma.customer.findUnique({
      where: { email },
    });
  }

  async findByDocument(document: string): Promise<Customer | null> {
    return this.prisma.customer.findUnique({
      where: { document },
    });
  }
}
