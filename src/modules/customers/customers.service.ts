import { ConflictException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { ICustomerRepository } from './repositories/customer.repository.interface';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { Customer } from './entities/customer.entity';

@Injectable()
export class CustomersService {
  constructor(
    @Inject('ICustomerRepository')
    private readonly repository: ICustomerRepository,
  ) {}

  async create(createCustomerDto: CreateCustomerDto): Promise<Customer> {
    // Verificar se email já existe
    const existingEmail = await this.repository.findByEmail(createCustomerDto.email);
    if (existingEmail) {
      throw new ConflictException('Customer with this email already exists');
    }

    // Verificar se documento já existe
    const existingDocument = await this.repository.findByDocument(createCustomerDto.document);
    if (existingDocument) {
      throw new ConflictException('Customer with this document already exists');
    }

    return this.repository.create(createCustomerDto as unknown as Record<string, unknown>);
  }

  async findAll() {
    return this.repository.findAll();
  }

  async findById(id: string): Promise<Customer> {
    const customer = await this.repository.findById(id);

    if (!customer) {
      throw new NotFoundException('Customer not found');
    }

    return customer;
  }

  async update(id: string, updateCustomerDto: UpdateCustomerDto): Promise<Customer> {
    // Verificar se cliente existe
    await this.findById(id);

    // Se está atualizando o email, verificar se não está em uso
    if (updateCustomerDto.email) {
      const existingEmail = await this.repository.findByEmail(updateCustomerDto.email);
      if (existingEmail && existingEmail.id !== id) {
        throw new ConflictException('Email is already in use');
      }
    }

    // Se está atualizando o documento, verificar se não está em uso
    if (updateCustomerDto.document) {
      const existingDocument = await this.repository.findByDocument(updateCustomerDto.document);
      if (existingDocument && existingDocument.id !== id) {
        throw new ConflictException('Document is already in use');
      }
    }

    return this.repository.update(id, updateCustomerDto as unknown as Record<string, unknown>);
  }

  async delete(id: string): Promise<void> {
    // Verificar se cliente existe
    await this.findById(id);

    await this.repository.delete(id);
  }
}
