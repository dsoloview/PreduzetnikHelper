import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../users/users.service';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
export interface TokenPair {
    accessToken: string;
    refreshToken: string;
}
export declare class AuthService {
    private jwtService;
    private usersService;
    private prisma;
    private config;
    constructor(jwtService: JwtService, usersService: UsersService, prisma: PrismaService, config: ConfigService);
    login(loginDto: LoginDto, meta: {
        ip?: string;
        userAgent?: string;
    }): Promise<TokenPair>;
    register(registerDto: RegisterDto, meta: {
        ip?: string;
        userAgent?: string;
    }): Promise<TokenPair>;
    refresh(cookieToken: string, meta: {
        ip?: string;
        userAgent?: string;
    }): Promise<TokenPair>;
    logout(cookieToken: string): Promise<void>;
    private parseTokenCookie;
    logoutAll(userId: string): Promise<void>;
    private createTokenPair;
}
