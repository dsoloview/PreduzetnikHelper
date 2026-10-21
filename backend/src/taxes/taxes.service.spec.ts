import { BadRequestException, ConflictException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { Prisma } from '../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { createPrismaMock } from '../prisma/prisma.service.mock';
import { TaxesService } from './taxes.service';

const obligation = (overrides: Record<string, unknown> = {}) => ({
  id: 'ob-1',
  userId: 'user-1',
  name: 'Porez',
  amount: new Prisma.Decimal(6500),
  recipientName: 'Poreska uprava',
  recipientAccount: '840-711122843-32',
  paymentCode: '253',
  model: '97',
  reference: '1234567890',
  purpose: null,
  startYear: 2026,
  startMonth: 3,
  endYear: null,
  endMonth: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

describe('TaxesService', () => {
  let service: TaxesService;
  let prisma: ReturnType<typeof createPrismaMock>;

  beforeEach(async () => {
    prisma = createPrismaMock();
    const module = await Test.createTestingModule({
      providers: [TaxesService, { provide: PrismaService, useValue: prisma }],
    }).compile();
    service = module.get(TaxesService);
    prisma.user.findUnique.mockResolvedValue({
      name: 'Marko',
      companyName: 'Marko PR',
      city: 'Novi Sad',
    } as any);
  });

  describe('getCalendar', () => {
    it('lists only months where an obligation applies, with due dates', async () => {
      prisma.taxObligation.findMany.mockResolvedValue([obligation()]);
      prisma.taxPayment.findMany.mockResolvedValue([]);

      const calendar = await service.getCalendar('user-1', 2026);

      expect(calendar.months.map((m) => m.month)).toEqual([
        3, 4, 5, 6, 7, 8, 9, 10, 11, 12,
      ]);
      expect(calendar.months[0].dueDate).toBe('2026-04-15');
    });

    it('builds an IPS QR with the period in the purpose and the payer from the profile', async () => {
      prisma.taxObligation.findMany.mockResolvedValue([obligation()]);
      prisma.taxPayment.findMany.mockResolvedValue([]);

      const calendar = await service.getCalendar('user-1', 2026);
      const september = calendar.months.find((m) => m.month === 9)!;

      expect(september.items[0].ipsQr).toBe(
        'K:PR|V:01|C:1|R:840000071112284332|N:Poreska uprava|I:RSD6500,00|' +
          'P:Marko PR, Novi Sad|SF:253|S:Porez 09/2026|RO:971234567890',
      );
    });

    it('shows the paid amount for paid months even after the obligation changed', async () => {
      prisma.taxObligation.findMany.mockResolvedValue([
        obligation({ amount: new Prisma.Decimal(7000) }),
      ]);
      prisma.taxPayment.findMany.mockResolvedValue([
        {
          id: 'pay-1',
          obligationId: 'ob-1',
          month: 3,
          amount: new Prisma.Decimal(6500),
          paidAt: new Date('2026-04-10'),
        },
      ] as any);

      const calendar = await service.getCalendar('user-1', 2026);

      expect(calendar.months[0].items[0]).toMatchObject({
        amount: 6500,
        payment: { id: 'pay-1' },
      });
      expect(calendar.months[1].items[0]).toMatchObject({
        amount: 7000,
        payment: null,
      });
    });

    it('leaves the QR empty when the account is invalid', async () => {
      prisma.taxObligation.findMany.mockResolvedValue([
        obligation({ recipientAccount: '840-711122843-33' }),
      ]);
      prisma.taxPayment.findMany.mockResolvedValue([]);

      const calendar = await service.getCalendar('user-1', 2026);

      expect(calendar.months[0].items[0].ipsQr).toBeNull();
    });
  });

  describe('createObligation', () => {
    const dto = {
      name: 'Porez',
      amount: 6500,
      recipientName: 'Poreska uprava',
      recipientAccount: '840-711122843-32',
      reference: '1234567890',
      startYear: 2026,
      startMonth: 1,
    };

    it('rejects an account with wrong check digits', async () => {
      await expect(
        service.createObligation('user-1', {
          ...dto,
          recipientAccount: '840-711122843-33',
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('rejects an end month before the start', async () => {
      await expect(
        service.createObligation('user-1', {
          ...dto,
          startMonth: 6,
          endYear: 2026,
          endMonth: 2,
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('removeObligation', () => {
    it('refuses to delete an obligation that has payments', async () => {
      prisma.taxObligation.findFirst.mockResolvedValue(obligation());
      prisma.taxPayment.count.mockResolvedValue(2);

      await expect(service.removeObligation('user-1', 'ob-1')).rejects.toThrow(
        ConflictException,
      );
      expect(prisma.taxObligation.delete).not.toHaveBeenCalled();
    });
  });

  describe('markPaid', () => {
    it('records the current amount and rejects months outside the obligation', async () => {
      prisma.taxObligation.findFirst.mockResolvedValue(obligation());

      await expect(
        service.markPaid('user-1', {
          obligationId: 'ob-1',
          year: 2026,
          month: 1,
          paidAt: '2026-02-10',
        }),
      ).rejects.toThrow(BadRequestException);

      prisma.taxPayment.upsert.mockResolvedValue({
        id: 'pay-1',
        obligationId: 'ob-1',
        year: 2026,
        month: 4,
        amount: new Prisma.Decimal(6500),
        paidAt: new Date('2026-05-10'),
      } as any);
      await service.markPaid('user-1', {
        obligationId: 'ob-1',
        year: 2026,
        month: 4,
        paidAt: '2026-05-10',
      });

      expect(prisma.taxPayment.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          create: expect.objectContaining({ amount: new Prisma.Decimal(6500) }),
          update: { paidAt: new Date('2026-05-10') },
        }),
      );
    });
  });
});
