import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { UnprocessableEntityException } from '@nestjs/common';
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
  let prismaMock: { refreshToken: { create: jest.Mock; findMany: jest.Mock; delete: jest.Mock; deleteMany: jest.Mock } };
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
});
