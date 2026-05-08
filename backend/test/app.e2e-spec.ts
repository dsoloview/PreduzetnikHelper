import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
const request = require('supertest');
import { AppModule } from './../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { PdfService } from '../src/pdf/pdf.service';
import { createPrismaMock } from '../src/prisma/prisma.service.mock';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { randomUUID } from 'crypto';

describe('AppController (e2e)', () => {
  let app: INestApplication;
  let prismaMock: ReturnType<typeof createPrismaMock>;
  let jwtToken: string;
  const mockUserId = randomUUID();
  const mockClientId = randomUUID();
  const mockBankAccountId = randomUUID();

  beforeAll(async () => {
    prismaMock = createPrismaMock();

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(PrismaService)
      .useValue(prismaMock)
      .overrideProvider(PdfService)
      .useValue({
        generateInvoicePdf: jest.fn().mockResolvedValue(Buffer.from('mock-pdf')),
        generateKpoPdf: jest.fn().mockResolvedValue(Buffer.from('mock-pdf')),
      })
      .compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
    await app.init();
    
    // Generate a valid token for authorized requests
    const jwtService = app.get<JwtService>(JwtService);
    jwtToken = jwtService.sign({ username: 'E2E User', sub: mockUserId });
  });

  afterAll(async () => {
    await app.close();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Auth Flow', () => {
    it('/auth/register (POST)', async () => {
      prismaMock.user.findUnique.mockResolvedValue(null);
      prismaMock.user.create.mockResolvedValue({ id: mockUserId, email: 'e2e@example.com' } as any);

      return request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'e2e@example.com',
          password: 'password123',
          companyName: 'E2E Test PR',
          name: 'E2E User',
          address: 'E2E St 1',
          city: 'Belgrade',
          pib: '123456789',
          mbr: '98765432',
          activityCode: '6201',
        })
        .expect(201)
        .expect((res) => {
          expect(res.body.accessToken).toBeDefined();
        });
    });
  });

  describe('Core Flow', () => {
    it('/clients (POST)', () => {
      prismaMock.client.create.mockResolvedValue({ id: mockClientId, name: 'E2E Client' } as any);

      return request(app.getHttpServer())
        .post('/clients')
        .set('Authorization', `Bearer ${jwtToken}`)
        .send({
          name: 'E2E Client',
          address: 'Client St 1',
          city: 'Novi Sad',
          country: 'Serbia',
          type: 'DOMESTIC',
          taxId: '111111111',
          registrationNumber: '22222222',
        })
        .expect(201)
        .expect((res) => {
          expect(res.body.id).toEqual(mockClientId);
        });
    });

    it('/invoices (POST)', () => {
      prismaMock.client.findUnique.mockResolvedValue({ id: mockClientId, type: 'DOMESTIC', userId: mockUserId } as any);
      prismaMock.bankAccount.findUnique.mockResolvedValue({ id: mockBankAccountId, userId: mockUserId } as any);
      prismaMock.invoice.findFirst.mockResolvedValue(null);
      
      const mockCreatedInvoice = {
        id: randomUUID(),
        invoiceNumber: 1,
        year: new Date().getFullYear(),
        status: 'DRAFT',
        clientId: mockClientId,
        issueDate: new Date(),
        dueDate: new Date(),
        totalAmount: 50000,
        totalRsd: 50000,
        client: { name: 'E2E Client' },
        items: []
      };
      
      prismaMock.invoice.create.mockResolvedValue(mockCreatedInvoice as any);

      return request(app.getHttpServer())
        .post('/invoices')
        .set('Authorization', `Bearer ${jwtToken}`)
        .send({
          clientId: mockClientId,
          bankAccountId: mockBankAccountId,
          issueDate: new Date().toISOString(),
          dueDate: new Date(Date.now() + 86400000 * 10).toISOString(),
          placeOfIssue: 'Belgrade',
          items: [
            { description: 'Consulting', quantity: 10, unitPrice: 5000 },
          ],
        })
        .expect(201)
        .expect((res) => {
          expect(res.body.id).toEqual(mockCreatedInvoice.id);
          expect(res.body.totalAmount).toEqual(50000);
        });
    });

    it('/limits (GET)', () => {
      // Mock for pausal limit (all invoices)
      prismaMock.invoice.findMany.mockResolvedValueOnce([{ totalRsd: 50000 }] as any);
      // Mock for vat limit (domestic only)
      prismaMock.invoice.findMany.mockResolvedValueOnce([{ totalRsd: 50000 }] as any);

      return request(app.getHttpServer())
        .get('/limits')
        .set('Authorization', `Bearer ${jwtToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.pausalLimit.current).toEqual(50000);
          expect(res.body.vatLimit.current).toEqual(50000);
        });
    });
  });
});
