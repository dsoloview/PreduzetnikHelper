import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { PrismaService } from '../prisma/prisma.service';
import { createPrismaMock } from '../prisma/prisma.service.mock';
import { NotFoundException, UnprocessableEntityException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

jest.mock('bcrypt', () => ({
  hash: jest.fn().mockResolvedValue('new-hashed'),
  compare: jest.fn(),
}));

describe('UsersService', () => {
  let service: UsersService;
  let prismaMock: ReturnType<typeof createPrismaMock>;

  const userId = 'user-1';
  const mockUser = {
    id: userId,
    email: 'test@example.com',
    password: 'hashed-password',
    name: 'Test User',
    createdAt: new Date(),
  };

  beforeEach(async () => {
    prismaMock = createPrismaMock();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: PrismaService, useValue: prismaMock },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('user', () => {
    it('should return user by unique input', async () => {
      prismaMock.user.findUnique.mockResolvedValue(mockUser as any);

      const result = await service.user({ email: 'test@example.com' });

      expect(prismaMock.user.findUnique).toHaveBeenCalledWith({ where: { email: 'test@example.com' } });
      expect(result?.id).toEqual(userId);
    });

    it('should return null when user not found', async () => {
      prismaMock.user.findUnique.mockResolvedValue(null);

      const result = await service.user({ email: 'no@one.com' });
      expect(result).toBeNull();
    });
  });

  describe('users', () => {
    it('should return list of users with given params', async () => {
      prismaMock.user.findMany.mockResolvedValue([mockUser] as any);

      const result = await service.users({ where: { email: 'test@example.com' } });

      expect(prismaMock.user.findMany).toHaveBeenCalledWith(expect.objectContaining({
        where: { email: 'test@example.com' },
      }));
      expect(result).toHaveLength(1);
    });
  });

  describe('createUser', () => {
    it('should create and return new user', async () => {
      prismaMock.user.create.mockResolvedValue(mockUser as any);

      const result = await service.createUser({ email: 'test@example.com', password: 'hashed', name: 'Test User' });

      expect(prismaMock.user.create).toHaveBeenCalledWith(expect.objectContaining({
        data: expect.objectContaining({ email: 'test@example.com' }),
      }));
      expect(result.id).toEqual(userId);
    });
  });

  describe('updateUser', () => {
    it('should update and return user via raw prisma params', async () => {
      const updated = { ...mockUser, name: 'Changed' };
      prismaMock.user.update.mockResolvedValue(updated as any);

      const result = await service.updateUser({ where: { id: userId }, data: { name: 'Changed' } });

      expect(prismaMock.user.update).toHaveBeenCalledWith(expect.objectContaining({
        where: { id: userId },
        data: { name: 'Changed' },
      }));
      expect(result.name).toEqual('Changed');
    });
  });

  describe('updateProfile', () => {
    it('should update profile and return user without password', async () => {
      const updatedUser = { ...mockUser, name: 'Updated Name' };
      prismaMock.user.update.mockResolvedValue(updatedUser as any);

      const result = await service.updateProfile(userId, { name: 'Updated Name' });

      expect(prismaMock.user.update).toHaveBeenCalledWith(expect.objectContaining({
        where: { id: userId },
        data: { name: 'Updated Name' },
      }));
      expect(result.name).toEqual('Updated Name');
      expect((result as any).password).toBeUndefined();
    });
  });

  describe('changePassword', () => {
    it('should update password when current password is correct', async () => {
      prismaMock.user.findUnique.mockResolvedValue(mockUser as any);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      prismaMock.user.update.mockResolvedValue(mockUser as any);

      await service.changePassword(userId, { currentPassword: 'old', newPassword: 'new-strong' });

      expect(bcrypt.hash).toHaveBeenCalledWith('new-strong', 10);
      expect(prismaMock.user.update).toHaveBeenCalledWith(expect.objectContaining({
        where: { id: userId },
        data: { password: 'new-hashed' },
      }));
    });

    it('should throw NotFoundException when user not found', async () => {
      prismaMock.user.findUnique.mockResolvedValue(null);

      await expect(service.changePassword(userId, { currentPassword: 'old', newPassword: 'new' }))
        .rejects.toThrow(NotFoundException);
    });

    it('should throw UnprocessableEntityException when current password is wrong', async () => {
      prismaMock.user.findUnique.mockResolvedValue(mockUser as any);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(service.changePassword(userId, { currentPassword: 'wrong', newPassword: 'new' }))
        .rejects.toThrow(UnprocessableEntityException);
    });
  });

  describe('deleteUser', () => {
    it('should delete and return the user', async () => {
      prismaMock.user.delete.mockResolvedValue(mockUser as any);

      const result = await service.deleteUser({ id: userId });

      expect(prismaMock.user.delete).toHaveBeenCalledWith({ where: { id: userId } });
      expect(result.id).toEqual(userId);
    });
  });
});
