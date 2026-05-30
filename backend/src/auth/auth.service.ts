import {
    Injectable,
    UnauthorizedException,
    UnprocessableEntityException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../users/users.service';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { User } from '../generated/prisma/client';

export interface TokenPair {
    accessToken: string;
    refreshToken: string;
}

@Injectable()
export class AuthService {
    constructor(
        private jwtService: JwtService,
        private usersService: UsersService,
        private prisma: PrismaService,
        private config: ConfigService,
    ) {}

    async login(loginDto: LoginDto, meta: { ip?: string; userAgent?: string }): Promise<TokenPair> {
        const user = await this.usersService.user({ email: loginDto.email });
        if (!user) {
            throw new UnprocessableEntityException('Invalid credentials');
        }

        if (!await bcrypt.compare(loginDto.password, user.password)) {
            throw new UnprocessableEntityException('Invalid credentials');
        }

        return this.createTokenPair(user, meta);
    }

    async register(registerDto: RegisterDto, meta: { ip?: string; userAgent?: string }): Promise<TokenPair> {
        const existingUser = await this.usersService.user({ email: registerDto.email });
        if (existingUser) {
            throw new UnprocessableEntityException('Email already exists');
        }

        const hashedPassword = await bcrypt.hash(registerDto.password, 10);
        const createdUser = await this.usersService.createUser({
            ...registerDto,
            password: hashedPassword,
        });

        if (!createdUser) {
            throw new UnprocessableEntityException('Failed to create user');
        }

        return this.createTokenPair(createdUser, meta);
    }

    async refresh(cookieToken: string, meta: { ip?: string; userAgent?: string }): Promise<TokenPair> {
        const { jti, rawToken } = this.parseTokenCookie(cookieToken);

        const record = await this.prisma.refreshToken.findUnique({
            where: { jti },
            include: { user: true },
        });

        if (!record || record.expiresAt < new Date()) {
            throw new UnauthorizedException('Invalid or expired refresh token');
        }

        if (!await bcrypt.compare(rawToken, record.hashedToken)) {
            await this.prisma.refreshToken.deleteMany({ where: { userId: record.userId } });
            throw new UnauthorizedException('Invalid or expired refresh token');
        }

        await this.prisma.refreshToken.delete({ where: { jti } });
        return this.createTokenPair(record.user, meta);
    }

    async logout(cookieToken: string): Promise<void> {
        try {
            const { jti, rawToken } = this.parseTokenCookie(cookieToken);
            const record = await this.prisma.refreshToken.findUnique({ where: { jti } });
            if (record && await bcrypt.compare(rawToken, record.hashedToken)) {
                await this.prisma.refreshToken.delete({ where: { jti } });
            }
        } catch {}
    }

    private parseTokenCookie(cookieToken: string): { jti: string; rawToken: string } {
        const dotIndex = cookieToken.indexOf('.');
        if (dotIndex === -1) {
            throw new UnauthorizedException('Invalid token format');
        }
        return {
            jti: cookieToken.substring(0, dotIndex),
            rawToken: cookieToken.substring(dotIndex + 1),
        };
    }

    async logoutAll(userId: string): Promise<void> {
        await this.prisma.refreshToken.deleteMany({ where: { userId } });
    }

    private async createTokenPair(user: User, meta: { ip?: string; userAgent?: string }): Promise<TokenPair> {
        const jti = crypto.randomUUID();
        const rawToken = crypto.randomBytes(64).toString('hex');
        const hashedToken = await bcrypt.hash(rawToken, 10);

        const expiresInDays = this.config.get<number>('REFRESH_TOKEN_EXPIRES_DAYS', 30);
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + expiresInDays);

        await this.prisma.refreshToken.create({
            data: {
                jti,
                userId: user.id,
                hashedToken,
                expiresAt,
                userAgent: meta.userAgent,
                ip: meta.ip,
            },
        });

        const accessToken = this.jwtService.sign(
            { username: user.name, sub: user.id },
        );

        return { accessToken, refreshToken: `${jti}.${rawToken}` };
    }
}
