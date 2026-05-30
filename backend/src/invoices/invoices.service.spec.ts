import { Test, TestingModule } from '@nestjs/testing';
import { InvoicesService } from './invoices.service';
import { PrismaService } from '../prisma/prisma.service';
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
      
      prismaMock.invoice.create.mockResolvedValue(createdInvoice as any);

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
        currency: Currency.EUR as any,
        // exchangeRate is missing
      };

      await expect(service.create(userId, dtoWithForeignCurrency)).rejects.toThrow(BadRequestException);
    });
  });

  describe('update', () => {
    const userId = 'user-1';
    const invoiceId = 'inv-1';

    it('should throw BadRequestException if invoice is not DRAFT and trying to edit contents', async () => {
      const existingInvoice = { id: invoiceId, userId, status: InvoiceStatus.SENT, client: {}, items: [] };
      prismaMock.invoice.findUnique.mockResolvedValue(existingInvoice as any);

      const dto: UpdateInvoiceDto = { note: 'Trying to update' };

      await expect(service.update(invoiceId, userId, dto)).rejects.toThrow(BadRequestException);
    });

    it('should allow status-only update even if not DRAFT', async () => {
      const existingInvoice = { 
        id: invoiceId, userId, status: InvoiceStatus.SENT, totalAmount: 1000, totalRsd: 1000, exchangeRate: null, currency: Currency.RSD,
        issueDate: new Date(), dueDate: new Date(), createdAt: new Date(),
        client: { name: 'Client' }, items: [] 
      };
      prismaMock.invoice.findUnique.mockResolvedValue(existingInvoice as any);
      
      const updatedInvoice = { ...existingInvoice, status: InvoiceStatus.PAID };
      prismaMock.invoice.update.mockResolvedValue(updatedInvoice as any);

      const dto: UpdateInvoiceDto = { status: InvoiceStatus.PAID };

      const result = await service.update(invoiceId, userId, dto);
      expect(result.status).toEqual(InvoiceStatus.PAID);
    });
  });
});
