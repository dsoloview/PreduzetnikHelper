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
          id: 'inv-1',
          invoiceNumber: 1,
          year,
          totalRsd: 100000,
          issueDate: new Date('2026-01-15'),
          paidAt: new Date('2026-01-20'),
          currency: Currency.RSD,
          client: { name: 'Client A' },
        },
        {
          id: 'inv-2',
          invoiceNumber: 2,
          year,
          totalRsd: 200000,
          issueDate: new Date('2026-02-10'),
          paidAt: new Date('2026-02-12'),
          currency: Currency.RSD,
          client: { name: 'Client <B>' },
        },
      ];
      prismaMock.invoice.findMany.mockResolvedValue(invoices as any);

      const result = await service.getKpoForYear(userId, year);

      expect(prismaMock.invoice.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            userId,
            status: InvoiceStatus.PAID,
            // Belgrade year boundaries: 2026-01-01 00:00 CET .. 2027-01-01 00:00 CET
            paidAt: {
              gte: new Date('2025-12-31T23:00:00Z'),
              lt: new Date('2026-12-31T23:00:00Z'),
            },
          },
        }),
      );

      expect(result.year).toEqual(year);
      expect(result.entries).toHaveLength(2);
      expect(result.entries[0].sequenceNumber).toEqual(1);
      expect(result.entries[1].sequenceNumber).toEqual(2);
      expect(result.entries[0].date).toEqual(
        new Date('2026-01-20').toISOString(),
      );
      expect(result.totalYearly).toEqual(300000);
    });

    it('should keep client name as plain text (escaping happens in templates)', async () => {
      const invoices = [
        {
          id: 'inv-1',
          invoiceNumber: 1,
          year,
          totalRsd: 50000,
          issueDate: new Date('2026-03-01'),
          paidAt: new Date('2026-03-05'),
          client: { name: '<Script> & "Evil"' },
        },
      ];
      prismaMock.invoice.findMany.mockResolvedValue(invoices as any);

      const result = await service.getKpoForYear(userId, year);

      expect(result.entries[0].description).toBe(
        'Faktura br. 1/2026 - <Script> & "Evil"',
      );
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
      prismaMock.user.findUnique.mockResolvedValue({
        id: userId,
        email: 'u@u.com',
        name: 'User',
      } as any);

      const result = await service.generateKpoPdf(userId, year);

      expect(pdfServiceMock.generateKpoPdf).toHaveBeenCalled();
      expect(result).toEqual(Buffer.from('kpo-pdf'));
    });

    it('should throw NotFoundException when user not found', async () => {
      prismaMock.invoice.findMany.mockResolvedValue([]);
      prismaMock.user.findUnique.mockResolvedValue(null);

      await expect(service.generateKpoPdf(userId, year)).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
