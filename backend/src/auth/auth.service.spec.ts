import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { UnprocessableEntityException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

jest.mock('bcrypt', () => ({
  hash: jest.fn(),
  compare: jest.fn(),
}));

describe('AuthService', () => {
  let service: AuthService;
  let usersServiceMock: Partial<UsersService>;
  let jwtServiceMock: Partial<JwtService>;

  beforeEach(async () => {
    usersServiceMock = {
      user: jest.fn(),
      createUser: jest.fn(),
    };
    jwtServiceMock = {
      sign: jest.fn().mockReturnValue('mock-jwt-token'),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: usersServiceMock },
        { provide: JwtService, useValue: jwtServiceMock },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('login', () => {
    it('should return an accessToken if credentials are valid', async () => {
      const mockUser = { id: '1', email: 'test@example.com', password: 'hashed', name: 'User' };
      (usersServiceMock.user as jest.Mock).mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await service.login({ email: 'test@example.com', password: 'password123' });

      expect(result).toEqual({ accessToken: 'mock-jwt-token' });
      expect(jwtServiceMock.sign).toHaveBeenCalledWith({ username: 'User', sub: '1' });
    });

    it('should throw UnprocessableEntityException if user not found', async () => {
      (usersServiceMock.user as jest.Mock).mockResolvedValue(null);

      await expect(service.login({ email: 'test@example.com', password: 'password' }))
        .rejects.toThrow(UnprocessableEntityException);
    });

    it('should throw UnprocessableEntityException if password invalid', async () => {
      (usersServiceMock.user as jest.Mock).mockResolvedValue({ password: 'hashed' });
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(service.login({ email: 'test@example.com', password: 'wrong' }))
        .rejects.toThrow(UnprocessableEntityException);
    });
  });

  describe('register', () => {
    it('should create user and return accessToken', async () => {
      const dto = {
        email: 'new@example.com',
        password: 'password123',
        companyName: 'Test IT PR',
        name: 'Dima',
        address: 'Test St 1',
        city: 'Belgrade',
        pib: '123456789',
        mbr: '98765432',
        activityCode: '6201',
      };

      (usersServiceMock.user as jest.Mock).mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed_new');
      (usersServiceMock.createUser as jest.Mock).mockResolvedValue({ id: '2', ...dto });

      const result = await service.register(dto);

      expect(usersServiceMock.createUser).toHaveBeenCalled();
      expect(result).toEqual({ accessToken: 'mock-jwt-token' });
    });

    it('should throw UnprocessableEntityException if email already exists', async () => {
      (usersServiceMock.user as jest.Mock).mockResolvedValue({ id: '1' });

      await expect(service.register({ email: 'existing@example.com', password: 'p' } as any))
        .rejects.toThrow(UnprocessableEntityException);
    });
  });
});
