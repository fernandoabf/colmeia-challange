import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { CustomersService } from './customers.service';
import { ICustomerRepository } from './repositories/customer.repository.interface';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';

describe('CustomersService', () => {
  let service: CustomersService;
  let repository: jest.Mocked<ICustomerRepository>;

  const mockCustomer = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    name: 'João Silva',
    email: 'joao@email.com',
    document: '12345678901',
    phone: '+5511999999999',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const mockRepository: Partial<ICustomerRepository> = {
      create: jest.fn(),
      findById: jest.fn(),
      findByEmail: jest.fn(),
      findByDocument: jest.fn(),
      findAll: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CustomersService,
        {
          provide: 'ICustomerRepository',
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<CustomersService>(CustomersService);
    repository = module.get('ICustomerRepository');
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const dto: CreateCustomerDto = {
      name: 'João Silva',
      email: 'joao@email.com',
      document: '12345678901',
      phone: '+5511999999999',
    };

    it('should create a customer successfully', async () => {
      repository.findByEmail.mockResolvedValue(null);
      repository.findByDocument.mockResolvedValue(null);
      repository.create.mockResolvedValue(mockCustomer);

      const result = await service.create(dto);

      expect(result).toEqual(mockCustomer);
      expect(repository.findByEmail).toHaveBeenCalledWith(dto.email);
      expect(repository.findByDocument).toHaveBeenCalledWith(dto.document);
      expect(repository.create).toHaveBeenCalledWith(dto);
    });

    it('should throw ConflictException when email already exists', async () => {
      repository.findByEmail.mockResolvedValue(mockCustomer);

      await expect(service.create(dto)).rejects.toThrow(ConflictException);
      await expect(service.create(dto)).rejects.toThrow('Customer with this email already exists');
      expect(repository.create).not.toHaveBeenCalled();
    });

    it('should throw ConflictException when document already exists', async () => {
      repository.findByEmail.mockResolvedValue(null);
      repository.findByDocument.mockResolvedValue(mockCustomer);

      await expect(service.create(dto)).rejects.toThrow(ConflictException);
      await expect(service.create(dto)).rejects.toThrow(
        'Customer with this document already exists',
      );
      expect(repository.create).not.toHaveBeenCalled();
    });
  });

  describe('findById', () => {
    it('should return a customer when found', async () => {
      repository.findById.mockResolvedValue(mockCustomer);

      const result = await service.findById(mockCustomer.id);

      expect(result).toEqual(mockCustomer);
      expect(repository.findById).toHaveBeenCalledWith(mockCustomer.id);
    });

    it('should throw NotFoundException when customer not found', async () => {
      repository.findById.mockResolvedValue(null);

      await expect(service.findById('non-existent-id')).rejects.toThrow(NotFoundException);
      await expect(service.findById('non-existent-id')).rejects.toThrow('Customer not found');
    });
  });

  describe('findAll', () => {
    it('should return a paginated list of customers', async () => {
      const paginatedResult = {
        data: [mockCustomer],
        total: 1,
        page: 1,
        limit: 10,
        totalPages: 1,
      };
      repository.findAll.mockResolvedValue(paginatedResult);

      const result = await service.findAll();

      expect(result).toEqual(paginatedResult);
      expect(repository.findAll).toHaveBeenCalled();
    });

    it('should return an empty paginated result when no customers exist', async () => {
      const emptyResult = {
        data: [],
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0,
      };
      repository.findAll.mockResolvedValue(emptyResult);

      const result = await service.findAll();

      expect(result).toEqual(emptyResult);
      expect(repository.findAll).toHaveBeenCalled();
    });
  });

  describe('update', () => {
    const updateDto: UpdateCustomerDto = {
      name: 'João Silva Updated',
      phone: '+5511988888888',
    };

    it('should update a customer successfully', async () => {
      const updatedCustomer = { ...mockCustomer, ...updateDto };
      repository.findById.mockResolvedValue(mockCustomer);
      repository.update.mockResolvedValue(updatedCustomer);

      const result = await service.update(mockCustomer.id, updateDto);

      expect(result).toEqual(updatedCustomer);
      expect(repository.findById).toHaveBeenCalledWith(mockCustomer.id);
      expect(repository.update).toHaveBeenCalledWith(mockCustomer.id, updateDto);
    });

    it('should throw NotFoundException when customer not found', async () => {
      repository.findById.mockResolvedValue(null);

      await expect(service.update('non-existent-id', updateDto)).rejects.toThrow(NotFoundException);
    });

    it('should throw ConflictException when email is already in use by another customer', async () => {
      const anotherCustomer = { ...mockCustomer, id: 'another-id' };
      repository.findById.mockResolvedValue(mockCustomer);
      repository.findByEmail.mockResolvedValue(anotherCustomer);

      await expect(service.update(mockCustomer.id, { email: 'another@email.com' })).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('delete', () => {
    it('should delete a customer successfully', async () => {
      repository.findById.mockResolvedValue(mockCustomer);
      repository.delete.mockResolvedValue(mockCustomer);

      await service.delete(mockCustomer.id);

      expect(repository.findById).toHaveBeenCalledWith(mockCustomer.id);
      expect(repository.delete).toHaveBeenCalledWith(mockCustomer.id);
    });

    it('should throw NotFoundException when customer not found', async () => {
      repository.findById.mockResolvedValue(null);

      await expect(service.delete('non-existent-id')).rejects.toThrow(NotFoundException);
      expect(repository.delete).not.toHaveBeenCalled();
    });
  });
});
