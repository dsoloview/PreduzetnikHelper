import { Test, TestingModule } from '@nestjs/testing';
import { LimitsService } from './limits.service';
import { PrismaService } from '../prisma/prisma.service';
import { createPrismaMock } from '../prisma/prisma.service.mock';
import { InvoiceStatus } from '../generated/prisma/enums';
import type { Invoice } from '../generated/prisma/client';

describe('LimitsService', () => {
  let service: LimitsService;
  let prismaMock: ReturnType<typeof createPrismaMock>;

  beforeEach(async () => {
    prismaMock = createPrismaMock();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LimitsService,
        { provide: PrismaService, useValue: prismaMock },
      ],
    }).compile();

    service = module.get<LimitsService>(LimitsService);

    jest.useFakeTimers().setSystemTime(new Date('2026-05-08T12:00:00Z'));
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.useRealTimers();
  });

  it('should calculate limits correctly when well below thresholds', async () => {
    prismaMock.invoice.findMany.mockResolvedValueOnce([
      { totalRsd: 1000000 },
      { totalRsd: 500000 },
    ] as unknown as Invoice[]);

    prismaMock.invoice.findMany.mockResolvedValueOnce([
      { totalRsd: 1000000 }, // Assuming the 500k one was foreign and filtered out by Prisma where clause
    ] as unknown as Invoice[]);

    const result = await service.getLimits('user-1');

    expect(prismaMock.invoice.findMany).toHaveBeenCalledTimes(2);

    expect(prismaMock.invoice.findMany).toHaveBeenNthCalledWith(1, expect.objectContaining({
      where: expect.objectContaining({
        userId: 'user-1',
        year: 2026,
        status: { not: InvoiceStatus.CANCELLED }
      })
    }));

    const expectedDate = new Date('2025-05-08T12:00:00.000Z');
    expect(prismaMock.invoice.findMany).toHaveBeenNthCalledWith(2, expect.objectContaining({
      where: expect.objectContaining({
        userId: 'user-1',
        issueDate: { gte: expectedDate },
        domesticSupply: true,
        status: { not: InvoiceStatus.CANCELLED }
      })
    }));

    expect(result.pausalLimit.current).toEqual(1500000);
    expect(result.pausalLimit.remaining).toEqual(4500000);
    expect(result.pausalLimit.percentage).toEqual(25.00);
    expect(result.pausalLimit.isExceeded).toBe(false);

    expect(result.vatLimit.current).toEqual(1000000);
    expect(result.vatLimit.remaining).toEqual(7000000);
    expect(result.vatLimit.percentage).toEqual(12.50);
    expect(result.vatLimit.isExceeded).toBe(false);
  });

  it('should indicate exceeded status when thresholds are crossed', async () => {
    prismaMock.invoice.findMany.mockResolvedValueOnce([
      { totalRsd: 6500000 },
    ] as unknown as Invoice[]);

    prismaMock.invoice.findMany.mockResolvedValueOnce([
      { totalRsd: 8100000 },
    ] as unknown as Invoice[]);

    const result = await service.getLimits('user-1');

    expect(result.pausalLimit.current).toEqual(6500000);
    expect(result.pausalLimit.remaining).toEqual(0);
    expect(result.pausalLimit.percentage).toEqual(108.33);
    expect(result.pausalLimit.isExceeded).toBe(true);

    expect(result.vatLimit.current).toEqual(8100000);
    expect(result.vatLimit.remaining).toEqual(0);
    expect(result.vatLimit.percentage).toEqual(101.25);
    expect(result.vatLimit.isExceeded).toBe(true);
  });
});
