import { Test, TestingModule } from '@nestjs/testing';
import { KpoService } from './kpo.service';
import { PrismaService } from '../prisma/prisma.service';
import { PdfService } from '../pdf/pdf.service';
import { createPrismaMock } from '../prisma/prisma.service.mock';
import { NotFoundException } from '@nestjs/common';
import { InvoiceStatus, Currency } from '../generated/prisma/enums';

describe('KpoService', () => {
  let service: KpoService;
  let prismaMock: ReturnType<typeof createPrismaMock>;
  let pdfServiceMock: Partial<PdfService>;

  const userId = 'user-1';
  const year = 2026;

  beforeEach(async () => {
    prismaMock = createPrismaMock();
    pdfServiceMock = {
      generateKpoPdf: jest.fn().mockResolvedValue(Buffer.from('kpo-pdf')),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        KpoService,
        { provide: PrismaService, useValue: prismaMock },
        { provide: PdfService, useValue: pdfServiceMock },
      ],
    }).compile();

    service = module.get<KpoService>(KpoService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getKpoForYear', () => {
    it('should return KPO entries with sequential numbers and running total', async () => {
      const invoices = [
        {
          id: 'inv-1', invoiceNumber: 1, year, totalRsd: 100000,
          issueDate: new Date('2026-01-15'), currency: Currency.RSD,
          client: { name: 'Client A' },
        },
        {
          id: 'inv-2', invoiceNumber: 2, year, totalRsd: 200000,
          issueDate: new Date('2026-02-10'), currency: Currency.RSD,
          client: { name: 'Client <B>' },
        },
      ];
      prismaMock.invoice.findMany.mockResolvedValue(invoices as any);

      const result = await service.getKpoForYear(userId, year);

      expect(prismaMock.invoice.findMany).toHaveBeenCalledWith(expect.objectContaining({
        where: expect.objectContaining({
          userId,
          year,
          status: { not: InvoiceStatus.CANCELLED },
        }),
      }));

      expect(result.year).toEqual(year);
      expect(result.entries).toHaveLength(2);
      expect(result.entries[0].sequenceNumber).toEqual(1);
      expect(result.entries[1].sequenceNumber).toEqual(2);
      expect(result.totalYearly).toEqual(300000);
    });

    it('should escape HTML in client names', async () => {
      const invoices = [
        {
          id: 'inv-1', invoiceNumber: 1, year, totalRsd: 50000,
          issueDate: new Date('2026-03-01'),
          client: { name: '<Script> & "Evil"' },
        },
      ];
      prismaMock.invoice.findMany.mockResolvedValue(invoices as any);

      const result = await service.getKpoForYear(userId, year);

      expect(result.entries[0].description).not.toContain('<Script>');
      expect(result.entries[0].description).toContain('&lt;Script&gt;');
    });

    it('should return empty entries when no invoices', async () => {
      prismaMock.invoice.findMany.mockResolvedValue([]);

      const result = await service.getKpoForYear(userId, year);

      expect(result.entries).toHaveLength(0);
      expect(result.totalYearly).toEqual(0);
    });
  });

  describe('generateKpoPdf', () => {
    it('should generate and return pdf buffer', async () => {
      prismaMock.invoice.findMany.mockResolvedValue([]);
      prismaMock.user.findUnique.mockResolvedValue({ id: userId, email: 'u@u.com', name: 'User' } as any);

      const result = await service.generateKpoPdf(userId, year);

      expect(pdfServiceMock.generateKpoPdf).toHaveBeenCalled();
      expect(result).toEqual(Buffer.from('kpo-pdf'));
    });

    it('should throw NotFoundException when user not found', async () => {
      prismaMock.invoice.findMany.mockResolvedValue([]);
      prismaMock.user.findUnique.mockResolvedValue(null);

      await expect(service.generateKpoPdf(userId, year)).rejects.toThrow(NotFoundException);
    });
  });
});
