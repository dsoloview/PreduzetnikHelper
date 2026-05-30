import { Test, TestingModule } from '@nestjs/testing';
import { InvoicesService } from './invoices.service';
import { PrismaService } from '../prisma/prisma.service';
import type { Invoice, Client } from '../generated/prisma/client';
import { ClientsService } from '../clients/clients.service';
import { BankAccountsService } from '../bank-accounts/bank-accounts.service';
import { PdfService } from '../pdf/pdf.service';
import { createPrismaMock } from '../prisma/prisma.service.mock';
import { BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { UpdateInvoiceDto } from './dto/update-invoice.dto';
import { InvoiceStatus, Currency, ClientType } from '../generated/prisma/enums';

describe('InvoicesService', () => {
  let service: InvoicesService;
  let prismaMock: ReturnType<typeof createPrismaMock>;
  let clientsServiceMock: Partial<ClientsService>;
  let bankAccountsServiceMock: Partial<BankAccountsService>;
  let pdfServiceMock: Partial<PdfService>;

  beforeEach(async () => {
    prismaMock = createPrismaMock();
    clientsServiceMock = {
      findOne: jest.fn(),
    };
    bankAccountsServiceMock = {
      findOne: jest.fn(),
    };
    pdfServiceMock = {
      generateInvoicePdf: jest.fn().mockResolvedValue(Buffer.from('pdf')),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InvoicesService,
        { provide: PrismaService, useValue: prismaMock },
        { provide: ClientsService, useValue: clientsServiceMock },
        { provide: BankAccountsService, useValue: bankAccountsServiceMock },
        { provide: PdfService, useValue: pdfServiceMock },
      ],
    }).compile();

    service = module.get<InvoicesService>(InvoicesService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    const userId = 'user-1';
    const mockDto: CreateInvoiceDto = {
      clientId: 'client-1',
      bankAccountId: 'bank-1',
      issueDate: '2026-05-01T00:00:00Z',
      dueDate: '2026-05-15T00:00:00Z',
      placeOfIssue: 'Belgrade',
      items: [
        { description: 'Service 1', quantity: 1, unitPrice: 10000 },
        { description: 'Service 2', quantity: 2, unitPrice: 5000 },
      ],
    };

    it('should calculate totalAmount and totalRsd properly and auto-increment invoiceNumber', async () => {
      // Mock validations
      (clientsServiceMock.findOne as jest.Mock).mockResolvedValue({ id: 'client-1', type: ClientType.DOMESTIC });
      (bankAccountsServiceMock.findOne as jest.Mock).mockResolvedValue({ id: 'bank-1' });

      // The service wraps creation in `prisma.$transaction(async tx => ...)`.
      // The deep mock does not auto-invoke the callback, so we make it execute
      // the callback with the mocked prisma client as the transaction client.
      (prismaMock.$transaction as jest.Mock).mockImplementation(async (cb) => cb(prismaMock));

      // Mock finding the last invoice to be invoiceNumber 5
      prismaMock.invoice.findFirst.mockResolvedValue({ invoiceNumber: 5 } as any);

      // Mock creation return value
      const createdInvoice = {
        id: 'inv-1',
        invoiceNumber: 6,
        year: 2026,
        status: InvoiceStatus.DRAFT,
        clientId: 'client-1',
        issueDate: new Date('2026-05-01T00:00:00Z'),
        dueDate: new Date('2026-05-15T00:00:00Z'),
        placeOfIssue: 'Belgrade',
        domesticSupply: true,
        currency: Currency.RSD,
        exchangeRate: null,
        totalAmount: 20000,
        totalRsd: 20000,
        bankAccountId: 'bank-1',
        createdAt: new Date(),
        client: { name: 'Test Client' },
        items: [
          { id: 'item-1', description: 'Service 1', quantity: 1, unitPrice: 10000, total: 10000 },
          { id: 'item-2', description: 'Service 2', quantity: 2, unitPrice: 5000, total: 10000 },
        ],
      };
      
      prismaMock.invoice.create.mockResolvedValue(createdInvoice as unknown as Invoice);

      const result = await service.create(userId, mockDto);

      expect(clientsServiceMock.findOne).toHaveBeenCalledWith('client-1', userId);
      expect(bankAccountsServiceMock.findOne).toHaveBeenCalledWith('bank-1', userId);
      expect(prismaMock.invoice.findFirst).toHaveBeenCalledWith({
        where: { userId, year: 2026 },
        orderBy: { invoiceNumber: 'desc' },
      });
      
      expect(prismaMock.invoice.create).toHaveBeenCalledWith(expect.objectContaining({
        data: expect.objectContaining({
          invoiceNumber: 6,
          totalAmount: 20000,
          totalRsd: 20000,
          domesticSupply: true,
        })
      }));

      expect(result.displayNumber).toEqual('6/2026');
      expect(result.totalAmount).toEqual(20000);
    });

    it('should throw BadRequest if foreign currency is provided without exchangeRate', async () => {
      (clientsServiceMock.findOne as jest.Mock).mockResolvedValue({ id: 'client-1', type: ClientType.INTERNATIONAL });
      (bankAccountsServiceMock.findOne as jest.Mock).mockResolvedValue({ id: 'bank-1' });

      const dtoWithForeignCurrency = {
        ...mockDto,
        currency: Currency.EUR,
        // exchangeRate is missing
      };

      await expect(service.create(userId, dtoWithForeignCurrency)).rejects.toThrow(BadRequestException);
    });
  });

  describe('findAll', () => {
    const userId = 'user-1';

    it('should return mapped invoices list', async () => {
      const invoice = {
        id: 'inv-1', invoiceNumber: 1, year: 2026, status: InvoiceStatus.DRAFT,
        clientId: 'client-1', issueDate: new Date('2026-05-01'), dueDate: new Date('2026-05-15'),
        placeOfIssue: 'Belgrade', domesticSupply: true, currency: Currency.RSD, exchangeRate: null,
        totalAmount: 5000, totalRsd: 5000, note: null, bankAccountId: 'bank-1', createdAt: new Date(),
        client: { name: 'Test Client' }, items: [],
      };
      prismaMock.invoice.findMany.mockResolvedValue([invoice] as any);

      const result = await service.findAll(userId, {});

      expect(prismaMock.invoice.findMany).toHaveBeenCalledWith(expect.objectContaining({
        where: expect.objectContaining({ userId }),
      }));
      expect(result).toHaveLength(1);
      expect(result[0].displayNumber).toEqual('1/2026');
    });

    it('should apply year/status/clientId filters', async () => {
      prismaMock.invoice.findMany.mockResolvedValue([]);

      await service.findAll(userId, { year: 2026, status: 'PAID', clientId: 'c-1' });

      expect(prismaMock.invoice.findMany).toHaveBeenCalledWith(expect.objectContaining({
        where: expect.objectContaining({ userId, year: 2026, status: 'PAID', clientId: 'c-1' }),
      }));
    });
  });

  describe('findOne', () => {
    const userId = 'user-1';
    const invoiceId = 'inv-1';

    it('should return invoice when found and owned by user', async () => {
      const invoice = {
        id: invoiceId, userId, invoiceNumber: 1, year: 2026, status: InvoiceStatus.DRAFT,
        clientId: 'client-1', issueDate: new Date(), dueDate: new Date(), placeOfIssue: 'Belgrade',
        domesticSupply: true, currency: Currency.RSD, exchangeRate: null, totalAmount: 1000,
        totalRsd: 1000, note: null, bankAccountId: 'bank-1', createdAt: new Date(),
        client: { name: 'Client' }, items: [],
      };
      prismaMock.invoice.findUnique.mockResolvedValue(invoice as any);

      const result = await service.findOne(invoiceId, userId);
      expect(result.id).toEqual(invoiceId);
    });

    it('should throw NotFoundException when invoice does not exist', async () => {
      prismaMock.invoice.findUnique.mockResolvedValue(null);

      await expect(service.findOne(invoiceId, userId)).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException when invoice belongs to another user', async () => {
      prismaMock.invoice.findUnique.mockResolvedValue({ id: invoiceId, userId: 'other-user' } as any);

      await expect(service.findOne(invoiceId, userId)).rejects.toThrow(ForbiddenException);
    });
  });

  describe('remove', () => {
    const userId = 'user-1';
    const invoiceId = 'inv-1';

    it('should delete DRAFT invoice and return mapped dto', async () => {
      const existing = {
        id: invoiceId, userId, status: InvoiceStatus.DRAFT, invoiceNumber: 1, year: 2026,
        clientId: 'c-1', issueDate: new Date(), dueDate: new Date(), placeOfIssue: 'Belgrade',
        domesticSupply: true, currency: Currency.RSD, exchangeRate: null, totalAmount: 1000,
        totalRsd: 1000, note: null, bankAccountId: 'bank-1', createdAt: new Date(),
        client: { name: 'Client' }, items: [],
      };
      prismaMock.invoice.findUnique.mockResolvedValue(existing as any);
      prismaMock.invoice.delete.mockResolvedValue(existing as any);

      const result = await service.remove(invoiceId, userId);
      expect(prismaMock.invoice.delete).toHaveBeenCalledWith(expect.objectContaining({ where: { id: invoiceId } }));
      expect(result.id).toEqual(invoiceId);
    });

    it('should throw NotFoundException when invoice not found', async () => {
      prismaMock.invoice.findUnique.mockResolvedValue(null);
      await expect(service.remove(invoiceId, userId)).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException when invoice belongs to another user', async () => {
      prismaMock.invoice.findUnique.mockResolvedValue({ id: invoiceId, userId: 'other' } as any);
      await expect(service.remove(invoiceId, userId)).rejects.toThrow(ForbiddenException);
    });

    it('should throw BadRequestException when invoice is not DRAFT', async () => {
      prismaMock.invoice.findUnique.mockResolvedValue({ id: invoiceId, userId, status: InvoiceStatus.SENT } as any);
      await expect(service.remove(invoiceId, userId)).rejects.toThrow(BadRequestException);
    });
  });

  describe('generatePdf', () => {
    const userId = 'user-1';
    const invoiceId = 'inv-1';

    const baseInvoice = {
      id: invoiceId, userId, invoiceNumber: 1, year: 2026, status: InvoiceStatus.DRAFT,
      clientId: 'c-1', issueDate: new Date(), dueDate: new Date(), placeOfIssue: 'Belgrade',
      domesticSupply: true, currency: Currency.RSD, exchangeRate: null, totalAmount: 1000,
      totalRsd: 1000, note: null, bankAccountId: 'bank-1', createdAt: new Date(),
      client: { name: 'Client' }, items: [],
      user: { id: userId, email: 'u@u.com', name: 'User' },
      bankAccount: { id: 'bank-1' },
    };

    it('should generate and return pdf buffer', async () => {
      prismaMock.invoice.findUnique.mockResolvedValue(baseInvoice as any);

      const result = await service.generatePdf(invoiceId, userId);

      expect(pdfServiceMock.generateInvoicePdf).toHaveBeenCalled();
      expect(result).toEqual(Buffer.from('pdf'));
    });

    it('should throw NotFoundException when invoice not found', async () => {
      prismaMock.invoice.findUnique.mockResolvedValue(null);
      await expect(service.generatePdf(invoiceId, userId)).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException when invoice belongs to another user', async () => {
      prismaMock.invoice.findUnique.mockResolvedValue({ ...baseInvoice, userId: 'other' } as any);
      await expect(service.generatePdf(invoiceId, userId)).rejects.toThrow(ForbiddenException);
    });
  });

  describe('update', () => {
    const userId = 'user-1';
    const invoiceId = 'inv-1';

    it('should throw BadRequestException if invoice is not DRAFT and trying to edit contents', async () => {
      const existingInvoice = { id: invoiceId, userId, status: InvoiceStatus.SENT, client: {}, items: [] };
      prismaMock.invoice.findUnique.mockResolvedValue(existingInvoice as unknown as Invoice);

      const dto: UpdateInvoiceDto = { note: 'Trying to update' };

      await expect(service.update(invoiceId, userId, dto)).rejects.toThrow(BadRequestException);
    });

    it('should allow status-only update even if not DRAFT', async () => {
      const existingInvoice = { 
        id: invoiceId, userId, status: InvoiceStatus.SENT, totalAmount: 1000, totalRsd: 1000, exchangeRate: null, currency: Currency.RSD,
        issueDate: new Date(), dueDate: new Date(), createdAt: new Date(),
        client: { name: 'Client' }, items: [] 
      };
      prismaMock.invoice.findUnique.mockResolvedValue(existingInvoice as unknown as Invoice);
      
      const updatedInvoice = { ...existingInvoice, status: InvoiceStatus.PAID };
      prismaMock.invoice.update.mockResolvedValue(updatedInvoice as unknown as Invoice);

      const dto: UpdateInvoiceDto = { status: InvoiceStatus.PAID };

      const result = await service.update(invoiceId, userId, dto);
      expect(result.status).toEqual(InvoiceStatus.PAID);
    });

    it('should throw NotFoundException when invoice not found', async () => {
      prismaMock.invoice.findUnique.mockResolvedValue(null);

      await expect(service.update(invoiceId, userId, { note: 'x' })).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException when invoice belongs to another user', async () => {
      prismaMock.invoice.findUnique.mockResolvedValue({ id: invoiceId, userId: 'other' } as any);

      await expect(service.update(invoiceId, userId, { note: 'x' })).rejects.toThrow(ForbiddenException);
    });

    it('should validate clientId ownership when provided', async () => {
      const existing = {
        id: invoiceId, userId, status: InvoiceStatus.DRAFT, totalAmount: 1000, totalRsd: 1000,
        exchangeRate: null, currency: Currency.RSD, issueDate: new Date(), dueDate: new Date(),
        createdAt: new Date(), client: { name: 'Client' }, items: [],
      };
      prismaMock.invoice.findUnique.mockResolvedValue(existing as any);
      (clientsServiceMock.findOne as jest.Mock).mockResolvedValue({ id: 'client-2' });
      prismaMock.invoice.update.mockResolvedValue({ ...existing, clientId: 'client-2' } as any);

      await service.update(invoiceId, userId, { clientId: 'client-2' });

      expect(clientsServiceMock.findOne).toHaveBeenCalledWith('client-2', userId);
    });

    it('should validate bankAccountId ownership when provided', async () => {
      const existing = {
        id: invoiceId, userId, status: InvoiceStatus.DRAFT, totalAmount: 1000, totalRsd: 1000,
        exchangeRate: null, currency: Currency.RSD, issueDate: new Date(), dueDate: new Date(),
        createdAt: new Date(), client: { name: 'Client' }, items: [],
      };
      prismaMock.invoice.findUnique.mockResolvedValue(existing as any);
      (bankAccountsServiceMock.findOne as jest.Mock).mockResolvedValue({ id: 'bank-2' });
      prismaMock.invoice.update.mockResolvedValue({ ...existing, bankAccountId: 'bank-2' } as any);

      await service.update(invoiceId, userId, { bankAccountId: 'bank-2' });

      expect(bankAccountsServiceMock.findOne).toHaveBeenCalledWith('bank-2', userId);
    });

    it('should recalculate totals when dto.items provided', async () => {
      const existing = {
        id: invoiceId, userId, status: InvoiceStatus.DRAFT, totalAmount: 1000, totalRsd: 1000,
        exchangeRate: null, currency: Currency.RSD, issueDate: new Date(), dueDate: new Date(),
        createdAt: new Date(), client: { name: 'Client' }, items: [],
      };
      prismaMock.invoice.findUnique.mockResolvedValue(existing as any);
      const updatedInvoice = { ...existing, totalAmount: 5000, totalRsd: 5000, items: [
        { id: 'i-1', description: 'New item', quantity: 1, unitPrice: 5000, total: 5000 },
      ]};
      prismaMock.invoice.update.mockResolvedValue(updatedInvoice as any);

      const result = await service.update(invoiceId, userId, {
        items: [{ description: 'New item', quantity: 1, unitPrice: 5000 }],
      });

      expect(prismaMock.invoice.update).toHaveBeenCalledWith(expect.objectContaining({
        data: expect.objectContaining({ totalAmount: 5000, totalRsd: 5000 }),
      }));
      expect(result.totalAmount).toEqual(5000);
    });

    it('should recalculate totalRsd when only currency/exchangeRate changes', async () => {
      const existing = {
        id: invoiceId, userId, status: InvoiceStatus.DRAFT, totalAmount: 1000, totalRsd: 1000,
        exchangeRate: null, currency: Currency.RSD, issueDate: new Date(), dueDate: new Date(),
        createdAt: new Date(), client: { name: 'Client' }, items: [],
      };
      prismaMock.invoice.findUnique.mockResolvedValue(existing as any);
      const updatedInvoice = { ...existing, currency: Currency.EUR, exchangeRate: 117, totalRsd: 117000 };
      prismaMock.invoice.update.mockResolvedValue(updatedInvoice as any);

      await service.update(invoiceId, userId, { currency: Currency.EUR, exchangeRate: 117 });

      expect(prismaMock.invoice.update).toHaveBeenCalledWith(expect.objectContaining({
        data: expect.objectContaining({ totalRsd: 117000 }),
      }));
    });
  });
});
