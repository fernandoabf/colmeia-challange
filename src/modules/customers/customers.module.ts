import { Module } from '@nestjs/common';
import { CustomersService } from './customers.service';
import { CustomersController } from './customers.controller';
import { CustomerRepository } from './repositories/customer.repository';

@Module({
  controllers: [CustomersController],
  providers: [
    CustomersService,
    {
      provide: 'ICustomerRepository',
      useClass: CustomerRepository,
    },
  ],
  exports: [CustomersService, 'ICustomerRepository'],
})
export class CustomersModule {}
