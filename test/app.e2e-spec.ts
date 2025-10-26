import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/modules/database/prisma.service';

describe('Payment System E2E Tests', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let customerId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();

    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );

    app.setGlobalPrefix('api/v1');

    await app.init();

    prisma = app.get<PrismaService>(PrismaService);
  });

  afterAll(async () => {
    // Limpar banco de dados
    await prisma.pixPayment.deleteMany();
    await prisma.creditCardPayment.deleteMany();
    await prisma.boletoPayment.deleteMany();
    await prisma.charge.deleteMany();
    await prisma.customer.deleteMany();

    await app.close();
  });

  describe('Customers', () => {
    describe('POST /api/v1/customers', () => {
      it('should create a customer successfully', async () => {
        const response = await request(app.getHttpServer())
          .post('/api/v1/customers')
          .send({
            name: 'João Silva',
            email: 'joao@email.com',
            document: '12345678901',
            phone: '+5511999999999',
          })
          .expect(201);

        expect(response.body).toHaveProperty('id');
        expect(response.body.email).toBe('joao@email.com');
        expect(response.body.name).toBe('João Silva');

        customerId = response.body.id;
      });

      it('should return 400 for invalid email', async () => {
        await request(app.getHttpServer())
          .post('/api/v1/customers')
          .send({
            name: 'João Silva',
            email: 'invalid-email',
            document: '12345678901',
            phone: '+5511999999999',
          })
          .expect(400);
      });

      it('should return 409 for duplicate email', async () => {
        await request(app.getHttpServer())
          .post('/api/v1/customers')
          .send({
            name: 'Another Customer',
            email: 'joao@email.com',
            document: '98765432100',
            phone: '+5511988888888',
          })
          .expect(409);
      });
    });

    describe('GET /api/v1/customers/:id', () => {
      it('should return a customer by id', async () => {
        const response = await request(app.getHttpServer())
          .get(`/api/v1/customers/${customerId}`)
          .expect(200);

        expect(response.body.id).toBe(customerId);
        expect(response.body.email).toBe('joao@email.com');
      });

      it('should return 404 for non-existent customer', async () => {
        await request(app.getHttpServer())
          .get('/api/v1/customers/123e4567-e89b-12d3-a456-426614174999')
          .expect(404);
      });
    });
  });

  describe('Charges', () => {
    describe('POST /api/v1/charges - PIX', () => {
      it('should create a PIX charge successfully', async () => {
        const response = await request(app.getHttpServer())
          .post('/api/v1/charges')
          .send({
            customerId,
            amount: 150.5,
            paymentMethod: 'PIX',
            pixData: {
              expiresInMinutes: 30,
            },
          })
          .expect(201);

        expect(response.body).toHaveProperty('id');
        expect(response.body.paymentMethod).toBe('PIX');
        expect(response.body.amount).toBe('150.5');
        expect(response.body.pixPayment).toBeDefined();
        expect(response.body.pixPayment.qrCode).toBeDefined();
        expect(response.body.pixPayment.expiresAt).toBeDefined();
      });
    });

    describe('POST /api/v1/charges - Credit Card', () => {
      it('should create a credit card charge successfully', async () => {
        const response = await request(app.getHttpServer())
          .post('/api/v1/charges')
          .send({
            customerId,
            amount: 500.0,
            paymentMethod: 'CREDIT_CARD',
            creditCardData: {
              cardNumber: '4111111111111111',
              cardHolderName: 'JOAO SILVA',
              expiryMonth: '12',
              expiryYear: '26',
              cvv: '123',
              installments: 3,
            },
          })
          .expect(201);

        expect(response.body).toHaveProperty('id');
        expect(response.body.paymentMethod).toBe('CREDIT_CARD');
        expect(response.body.creditCardPayment).toBeDefined();
        expect(response.body.creditCardPayment.cardLast4).toBe('1111');
        expect(response.body.creditCardPayment.installments).toBe(3);
      });
    });

    describe('POST /api/v1/charges - Boleto', () => {
      it('should create a boleto charge successfully', async () => {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const dueDate = tomorrow.toISOString().split('T')[0];

        const response = await request(app.getHttpServer())
          .post('/api/v1/charges')
          .send({
            customerId,
            amount: 250.0,
            paymentMethod: 'BOLETO',
            boletoData: {
              dueDate,
            },
          })
          .expect(201);

        expect(response.body).toHaveProperty('id');
        expect(response.body.paymentMethod).toBe('BOLETO');
        expect(response.body.boletoPayment).toBeDefined();
        expect(response.body.boletoPayment.barcodeNumber).toBeDefined();
        expect(response.body.boletoPayment.documentUrl).toBeDefined();
      });
    });

    describe('Idempotency', () => {
      it('should return existing charge for duplicate idempotency key', async () => {
        const idempotencyKey = '550e8400-e29b-41d4-a716-446655440000';

        const first = await request(app.getHttpServer())
          .post('/api/v1/charges')
          .set('Idempotency-Key', idempotencyKey)
          .send({
            customerId,
            amount: 100.0,
            paymentMethod: 'PIX',
            pixData: {
              expiresInMinutes: 30,
            },
          })
          .expect(201);

        const second = await request(app.getHttpServer())
          .post('/api/v1/charges')
          .set('Idempotency-Key', idempotencyKey)
          .send({
            customerId,
            amount: 200.0, // Different amount, but same idempotency key
            paymentMethod: 'PIX',
            pixData: {
              expiresInMinutes: 30,
            },
          })
          .expect(201);

        expect(first.body.id).toBe(second.body.id);
        expect(first.body.amount).toBe(second.body.amount);
      });
    });

    describe('GET /api/v1/charges/customer/:customerId', () => {
      it('should return all charges for a customer', async () => {
        const response = await request(app.getHttpServer())
          .get(`/api/v1/charges/customer/${customerId}`)
          .expect(200);

        expect(Array.isArray(response.body)).toBe(true);
        expect(response.body.length).toBeGreaterThan(0);
      });
    });
  });
});
