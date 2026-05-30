import { Test, TestingModule } from '@nestjs/testing';
import { BankAccountsService } from './bank-accounts.service';
import { PrismaService } from '../prisma/prisma.service';
import { createPrismaMock } from '../prisma/prisma.service.mock';
import { BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { Currency } from '../generated/prisma/enums';

describe('BankAccountsService', () => {
  let service: BankAccountsService;
  let prismaMock: ReturnType<typeof createPrismaMock>;

  const userId = 'user-1';
  const accountId = 'acc-1';

  const mockAccount = {
    id: accountId,
    userId,
    bankName: 'UniCredit',
    accountNumber: '160-123456-12',
    currency: Currency.RSD,
    isDefault: false,
    createdAt: new Date(),
  };

  beforeEach(async () => {
    prismaMock = createPrismaMock();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BankAccountsService,
        { provide: PrismaService, useValue: prismaMock },
      ],
    }).compile();

    service = module.get<BankAccountsService>(BankAccountsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create account without clearing defaults when isDefault is false', async () => {
      (prismaMock.$transaction as jest.Mock).mockImplementation(async (cb) => cb(prismaMock));
      prismaMock.bankAccount.create.mockResolvedValue(mockAccount as any);

      const dto = { bankName: 'UniCredit', accountNumber: '160-123456-12', currency: Currency.RSD, isDefault: false };
      const result = await service.create(userId, dto);

      expect(prismaMock.bankAccount.updateMany).not.toHaveBeenCalled();
      expect(prismaMock.bankAccount.create).toHaveBeenCalledWith(expect.objectContaining({
        data: expect.objectContaining({ userId, isDefault: false }),
      }));
      expect(result.id).toEqual(accountId);
    });

    it('should clear other defaults when isDefault is true', async () => {
      (prismaMock.$transaction as jest.Mock).mockImplementation(async (cb) => cb(prismaMock));
      prismaMock.bankAccount.updateMany.mockResolvedValue({ count: 1 } as any);
      const defaultAccount = { ...mockAccount, isDefault: true };
      prismaMock.bankAccount.create.mockResolvedValue(defaultAccount as any);

      await service.create(userId, { bankName: 'UniCredit', accountNumber: '160-123456-12', currency: Currency.RSD, isDefault: true });

      expect(prismaMock.bankAccount.updateMany).toHaveBeenCalledWith(expect.objectContaining({
        where: { userId },
        data: { isDefault: false },
      }));
    });
  });

  describe('findAll', () => {
    it('should return accounts ordered by isDefault desc', async () => {
      prismaMock.bankAccount.findMany.mockResolvedValue([mockAccount] as any);

      const result = await service.findAll(userId);

      expect(prismaMock.bankAccount.findMany).toHaveBeenCalledWith(expect.objectContaining({
        where: { userId },
      }));
      expect(result).toHaveLength(1);
    });
  });

  describe('findOne', () => {
    it('should return account when found and owned', async () => {
      prismaMock.bankAccount.findUnique.mockResolvedValue(mockAccount as any);

      const result = await service.findOne(accountId, userId);
      expect(result.id).toEqual(accountId);
    });

    it('should throw NotFoundException when account not found', async () => {
      prismaMock.bankAccount.findUnique.mockResolvedValue(null);

      await expect(service.findOne(accountId, userId)).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException when account belongs to another user', async () => {
      prismaMock.bankAccount.findUnique.mockResolvedValue({ ...mockAccount, userId: 'other' } as any);

      await expect(service.findOne(accountId, userId)).rejects.toThrow(ForbiddenException);
    });
  });

  describe('update', () => {
    it('should update account without clearing defaults when isDefault is false', async () => {
      prismaMock.bankAccount.findUnique.mockResolvedValue(mockAccount as any);
      (prismaMock.$transaction as jest.Mock).mockImplementation(async (cb) => cb(prismaMock));
      const updated = { ...mockAccount, bankName: 'Raiffeisen' };
      prismaMock.bankAccount.update.mockResolvedValue(updated as any);

      const result = await service.update(accountId, userId, { bankName: 'Raiffeisen', isDefault: false });

      expect(prismaMock.bankAccount.updateMany).not.toHaveBeenCalled();
      expect(result.bankName).toEqual('Raiffeisen');
    });

    it('should clear other defaults when updating with isDefault true', async () => {
      prismaMock.bankAccount.findUnique.mockResolvedValue(mockAccount as any);
      (prismaMock.$transaction as jest.Mock).mockImplementation(async (cb) => cb(prismaMock));
      prismaMock.bankAccount.updateMany.mockResolvedValue({ count: 1 } as any);
      prismaMock.bankAccount.update.mockResolvedValue({ ...mockAccount, isDefault: true } as any);

      await service.update(accountId, userId, { isDefault: true });

      expect(prismaMock.bankAccount.updateMany).toHaveBeenCalledWith(expect.objectContaining({
        where: expect.objectContaining({ userId, NOT: { id: accountId } }),
        data: { isDefault: false },
      }));
    });
  });

  describe('remove', () => {
    it('should delete non-default account', async () => {
      prismaMock.bankAccount.findUnique.mockResolvedValue(mockAccount as any);
      prismaMock.bankAccount.delete.mockResolvedValue(mockAccount as any);

      const result = await service.remove(accountId, userId);

      expect(prismaMock.bankAccount.delete).toHaveBeenCalledWith({ where: { id: accountId } });
      expect(result.id).toEqual(accountId);
    });

    it('should throw BadRequestException when deleting default account if others exist', async () => {
      prismaMock.bankAccount.findUnique.mockResolvedValue({ ...mockAccount, isDefault: true } as any);
      prismaMock.bankAccount.count.mockResolvedValue(2 as any);

      await expect(service.remove(accountId, userId)).rejects.toThrow(BadRequestException);
    });

    it('should allow deleting default account when it is the only one', async () => {
      prismaMock.bankAccount.findUnique.mockResolvedValue({ ...mockAccount, isDefault: true } as any);
      prismaMock.bankAccount.count.mockResolvedValue(1 as any);
      prismaMock.bankAccount.delete.mockResolvedValue({ ...mockAccount, isDefault: true } as any);

      const result = await service.remove(accountId, userId);
      expect(result.id).toEqual(accountId);
    });
  });
});
