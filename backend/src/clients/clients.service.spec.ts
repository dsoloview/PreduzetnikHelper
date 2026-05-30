import { Test, TestingModule } from '@nestjs/testing';
import { ClientsService } from './clients.service';
import { PrismaService } from '../prisma/prisma.service';
import { createPrismaMock } from '../prisma/prisma.service.mock';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { ClientType } from '../generated/prisma/enums';

describe('ClientsService', () => {
  let service: ClientsService;
  let prismaMock: ReturnType<typeof createPrismaMock>;

  const mockClient = {
    id: 'client-1',
    userId: 'user-1',
    name: 'ACME Corp',
    type: ClientType.DOMESTIC,
    taxId: '123456789',
    registrationNumber: '987654321',
    address: 'Knez Mihailova 1',
    city: 'Belgrade',
    country: 'Serbia',
    email: 'acme@example.com',
    createdAt: new Date(),
  };

  beforeEach(async () => {
    prismaMock = createPrismaMock();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ClientsService,
        { provide: PrismaService, useValue: prismaMock },
      ],
    }).compile();

    service = module.get<ClientsService>(ClientsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create and return a client', async () => {
      prismaMock.client.create.mockResolvedValue(mockClient as any);

      const dto = { name: 'ACME Corp', type: ClientType.DOMESTIC, taxId: '123456789', registrationNumber: '987654321', address: 'Knez Mihailova 1', city: 'Belgrade', country: 'Serbia', email: 'acme@example.com' };
      const result = await service.create('user-1', dto);

      expect(prismaMock.client.create).toHaveBeenCalledWith(expect.objectContaining({
        data: expect.objectContaining({ userId: 'user-1', name: 'ACME Corp' }),
      }));
      expect(result.id).toEqual('client-1');
    });
  });

  describe('findAll', () => {
    it('should return list of clients for the user', async () => {
      prismaMock.client.findMany.mockResolvedValue([mockClient] as any);

      const result = await service.findAll('user-1');

      expect(prismaMock.client.findMany).toHaveBeenCalledWith(expect.objectContaining({
        where: { userId: 'user-1' },
      }));
      expect(result).toHaveLength(1);
    });
  });

  describe('findOne', () => {
    it('should return client when found and owned', async () => {
      prismaMock.client.findUnique.mockResolvedValue(mockClient as any);

      const result = await service.findOne('client-1', 'user-1');
      expect(result.id).toEqual('client-1');
    });

    it('should throw NotFoundException when client not found', async () => {
      prismaMock.client.findUnique.mockResolvedValue(null);

      await expect(service.findOne('client-1', 'user-1')).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException when client belongs to another user', async () => {
      prismaMock.client.findUnique.mockResolvedValue({ ...mockClient, userId: 'other-user' } as any);

      await expect(service.findOne('client-1', 'user-1')).rejects.toThrow(ForbiddenException);
    });
  });

  describe('update', () => {
    it('should update and return client', async () => {
      prismaMock.client.findUnique.mockResolvedValue(mockClient as any);
      const updated = { ...mockClient, name: 'Updated Corp' };
      prismaMock.client.update.mockResolvedValue(updated as any);

      const result = await service.update('client-1', 'user-1', { name: 'Updated Corp' });

      expect(prismaMock.client.update).toHaveBeenCalledWith(expect.objectContaining({
        where: { id: 'client-1' },
        data: { name: 'Updated Corp' },
      }));
      expect(result.name).toEqual('Updated Corp');
    });

    it('should throw NotFoundException when updating non-existent client', async () => {
      prismaMock.client.findUnique.mockResolvedValue(null);

      await expect(service.update('client-1', 'user-1', { name: 'x' })).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should delete and return client', async () => {
      prismaMock.client.findUnique.mockResolvedValue(mockClient as any);
      prismaMock.client.delete.mockResolvedValue(mockClient as any);

      const result = await service.remove('client-1', 'user-1');

      expect(prismaMock.client.delete).toHaveBeenCalledWith({ where: { id: 'client-1' } });
      expect(result.id).toEqual('client-1');
    });

    it('should throw ForbiddenException when removing a client owned by another user', async () => {
      prismaMock.client.findUnique.mockResolvedValue({ ...mockClient, userId: 'other' } as any);

      await expect(service.remove('client-1', 'user-1')).rejects.toThrow(ForbiddenException);
    });
  });
});
