import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { UnauthorizedException, UnprocessableEntityException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

jest.mock('bcrypt', () => ({
  hash: jest.fn().mockResolvedValue('hashed'),
  compare: jest.fn(),
}));

jest.mock('crypto', () => ({
  ...jest.requireActual('crypto'),
  randomBytes: jest.fn(() => ({ toString: () => 'mock-raw-token' })),
  randomUUID: jest.fn(() => 'mock-jti'),
}));

const META = { ip: '127.0.0.1', userAgent: 'test' };

describe('AuthService', () => {
  let service: AuthService;
  let usersServiceMock: Partial<UsersService>;
  let jwtServiceMock: Partial<JwtService>;
  let prismaMock: { refreshToken: { create: jest.Mock; findMany: jest.Mock; findUnique: jest.Mock; delete: jest.Mock; deleteMany: jest.Mock } };
  let configServiceMock: Partial<ConfigService>;

  beforeEach(async () => {
    usersServiceMock = {
      user: jest.fn(),
      createUser: jest.fn(),
    };
    jwtServiceMock = {
      sign: jest.fn().mockReturnValue('mock-jwt-token'),
    };
    prismaMock = {
      refreshToken: {
        create: jest.fn().mockResolvedValue({}),
        findMany: jest.fn().mockResolvedValue([]),
        findUnique: jest.fn().mockResolvedValue(null),
        delete: jest.fn().mockResolvedValue({}),
        deleteMany: jest.fn().mockResolvedValue({}),
      },
    };
    configServiceMock = {
      get: jest.fn().mockReturnValue(30),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: usersServiceMock },
        { provide: JwtService, useValue: jwtServiceMock },
        { provide: PrismaService, useValue: prismaMock },
        { provide: ConfigService, useValue: configServiceMock },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('login', () => {
    it('should return accessToken and refreshToken if credentials are valid', async () => {
      const mockUser = { id: '1', email: 'test@example.com', password: 'hashed', name: 'User' };
      (usersServiceMock.user as jest.Mock).mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await service.login({ email: 'test@example.com', password: 'password123' }, META);

      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
      expect(jwtServiceMock.sign).toHaveBeenCalledWith({ username: 'User', sub: '1' });
    });

    it('should throw UnprocessableEntityException if user not found', async () => {
      (usersServiceMock.user as jest.Mock).mockResolvedValue(null);

      await expect(service.login({ email: 'test@example.com', password: 'password' }, META))
        .rejects.toThrow(UnprocessableEntityException);
    });

    it('should throw UnprocessableEntityException if password invalid', async () => {
      (usersServiceMock.user as jest.Mock).mockResolvedValue({ password: 'hashed' });
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(service.login({ email: 'test@example.com', password: 'wrong' }, META))
        .rejects.toThrow(UnprocessableEntityException);
    });
  });

  describe('register', () => {
    it('should create user and return token pair', async () => {
      const dto = {
        email: 'new@example.com',
        password: 'Password1',
        name: 'Dima',
      };

      (usersServiceMock.user as jest.Mock).mockResolvedValue(null);
      (usersServiceMock.createUser as jest.Mock).mockResolvedValue({ id: '2', ...dto });

      const result = await service.register(dto, META);

      expect(usersServiceMock.createUser).toHaveBeenCalled();
      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
    });

    it('should throw UnprocessableEntityException if email already exists', async () => {
      (usersServiceMock.user as jest.Mock).mockResolvedValue({ id: '1' });

      await expect(service.register({ email: 'existing@example.com', password: 'p', name: 'x' }, META))
        .rejects.toThrow(UnprocessableEntityException);
    });
  });

  describe('refresh', () => {
    const jti = 'mock-jti';
    const rawToken = 'mock-raw-token';
    const cookieToken = `${jti}.${rawToken}`;

    it('should return new token pair when refresh token is valid', async () => {
      const mockUser = { id: '1', email: 'test@example.com', name: 'User', password: 'hashed' };
      const record = {
        jti,
        userId: '1',
        hashedToken: 'hashed-refresh',
        expiresAt: new Date(Date.now() + 86400000),
        user: mockUser,
      };
      prismaMock.refreshToken.findUnique.mockResolvedValue(record);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await service.refresh(cookieToken, META);

      expect(prismaMock.refreshToken.delete).toHaveBeenCalledWith({ where: { jti } });
      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
    });

    it('should throw UnauthorizedException when token record not found', async () => {
      prismaMock.refreshToken.findUnique.mockResolvedValue(null);

      await expect(service.refresh(cookieToken, META)).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException when token is expired', async () => {
      prismaMock.refreshToken.findUnique.mockResolvedValue({
        jti,
        userId: '1',
        hashedToken: 'hashed',
        expiresAt: new Date(Date.now() - 1000),
        user: {},
      });

      await expect(service.refresh(cookieToken, META)).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException and revoke all tokens when hash mismatch (token theft)', async () => {
      prismaMock.refreshToken.findUnique.mockResolvedValue({
        jti,
        userId: '1',
        hashedToken: 'hashed',
        expiresAt: new Date(Date.now() + 86400000),
        user: {},
      });
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(service.refresh(cookieToken, META)).rejects.toThrow(UnauthorizedException);
      expect(prismaMock.refreshToken.deleteMany).toHaveBeenCalledWith({ where: { userId: '1' } });
    });

    it('should throw UnauthorizedException when cookie has invalid format', async () => {
      await expect(service.refresh('no-dot-token', META)).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('logout', () => {
    const jti = 'mock-jti';
    const rawToken = 'mock-raw-token';
    const cookieToken = `${jti}.${rawToken}`;

    it('should delete refresh token when token is valid', async () => {
      prismaMock.refreshToken.findUnique.mockResolvedValue({
        jti,
        hashedToken: 'hashed',
      });
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      await service.logout(cookieToken);

      expect(prismaMock.refreshToken.delete).toHaveBeenCalledWith({ where: { jti } });
    });

    it('should silently skip when token record not found', async () => {
      prismaMock.refreshToken.findUnique.mockResolvedValue(null);

      await expect(service.logout(cookieToken)).resolves.not.toThrow();
      expect(prismaMock.refreshToken.delete).not.toHaveBeenCalled();
    });

    it('should silently skip when token hash does not match', async () => {
      prismaMock.refreshToken.findUnique.mockResolvedValue({ jti, hashedToken: 'hashed' });
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(service.logout(cookieToken)).resolves.not.toThrow();
      expect(prismaMock.refreshToken.delete).not.toHaveBeenCalled();
    });

    it('should silently ignore invalid token format', async () => {
      await expect(service.logout('no-dot-format')).resolves.not.toThrow();
    });
  });

  describe('logoutAll', () => {
    it('should delete all refresh tokens for the user', async () => {
      await service.logoutAll('user-1');

      expect(prismaMock.refreshToken.deleteMany).toHaveBeenCalledWith({ where: { userId: 'user-1' } });
    });
  });
});
