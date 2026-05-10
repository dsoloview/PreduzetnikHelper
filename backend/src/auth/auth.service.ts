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

    async refresh(rawRefreshToken: string, meta: { ip?: string; userAgent?: string }): Promise<TokenPair> {
        const record = await this.prisma.refreshToken.findMany({
            where: { expiresAt: { gt: new Date() } },
            include: { user: true },
        });

        // Find matching record by comparing bcrypt hash
        let matched: (typeof record)[0] | undefined;
        for (const r of record) {
            if (await bcrypt.compare(rawRefreshToken, r.hashedToken)) {
                matched = r;
                break;
            }
        }

        if (!matched) {
            throw new UnauthorizedException('Invalid or expired refresh token');
        }

        // Rotate: delete old, issue new
        await this.prisma.refreshToken.delete({ where: { id: matched.id } });
        return this.createTokenPair(matched.user, meta);
    }

    async logout(rawRefreshToken: string): Promise<void> {
        const records = await this.prisma.refreshToken.findMany();
        for (const r of records) {
            if (await bcrypt.compare(rawRefreshToken, r.hashedToken)) {
                await this.prisma.refreshToken.delete({ where: { id: r.id } });
                return;
            }
        }
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

        return { accessToken, refreshToken: rawToken };
    }
}
