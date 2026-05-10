import { Controller, Post, Body, Req, Res, UnauthorizedException, HttpCode } from '@nestjs/common';
import type { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { Public } from './helpers/auth.helpers';
import { RegisterDto } from './dto/register.dto';
import { ApiOperation, ApiResponse, ApiTags, ApiCookieAuth } from '@nestjs/swagger';
import { AuthResponseDto } from './dto/auth-response.dto';
import { Throttle } from '@nestjs/throttler';
import { ConfigService } from '@nestjs/config';

const REFRESH_COOKIE = 'refreshToken';

@ApiTags('Auth')
@Throttle({ default: { ttl: 60000, limit: 5 } })
@Controller('auth')
export class AuthController {
    constructor(
        private authService: AuthService,
        private config: ConfigService,
    ) {}

    @Public()
    @Post('login')
    @ApiOperation({ summary: 'Login with email and password' })
    @ApiResponse({ status: 200, type: AuthResponseDto })
    async login(
        @Body() loginDto: LoginDto,
        @Req() req: Request,
        @Res({ passthrough: true }) res: Response,
    ): Promise<AuthResponseDto> {
        const meta = { ip: req.ip, userAgent: req.headers['user-agent'] };
        const { accessToken, refreshToken } = await this.authService.login(loginDto, meta);
        this.setRefreshCookie(res, refreshToken);
        return { accessToken };
    }

    @Public()
    @Post('register')
    @ApiOperation({ summary: 'Register a new user' })
    @ApiResponse({ status: 201, type: AuthResponseDto })
    async register(
        @Body() registerDto: RegisterDto,
        @Req() req: Request,
        @Res({ passthrough: true }) res: Response,
    ): Promise<AuthResponseDto> {
        const meta = { ip: req.ip, userAgent: req.headers['user-agent'] };
        const { accessToken, refreshToken } = await this.authService.register(registerDto, meta);
        this.setRefreshCookie(res, refreshToken);
        return { accessToken };
    }

    @Public()
    @Post('refresh')
    @HttpCode(200)
    @ApiCookieAuth(REFRESH_COOKIE)
    @ApiOperation({ summary: 'Get new access token using refresh token cookie' })
    @ApiResponse({ status: 200, type: AuthResponseDto })
    async refresh(
        @Req() req: Request,
        @Res({ passthrough: true }) res: Response,
    ): Promise<AuthResponseDto> {
        const rawToken: string | undefined = req.cookies?.[REFRESH_COOKIE];
        if (!rawToken) {
            throw new UnauthorizedException('Refresh token missing');
        }
        const meta = { ip: req.ip, userAgent: req.headers['user-agent'] };
        const { accessToken, refreshToken } = await this.authService.refresh(rawToken, meta);
        this.setRefreshCookie(res, refreshToken);
        return { accessToken };
    }

    @Public()
    @Post('logout')
    @HttpCode(204)
    @ApiCookieAuth(REFRESH_COOKIE)
    @ApiOperation({ summary: 'Logout and invalidate refresh token' })
    @ApiResponse({ status: 204 })
    async logout(
        @Req() req: Request,
        @Res({ passthrough: true }) res: Response,
    ): Promise<void> {
        const rawToken: string | undefined = req.cookies?.[REFRESH_COOKIE];
        if (rawToken) {
            await this.authService.logout(rawToken);
        }
        res.clearCookie(REFRESH_COOKIE, { httpOnly: true, sameSite: 'strict', secure: true });
    }

    private setRefreshCookie(res: Response, token: string): void {
        const expiresInDays = this.config.get<number>('REFRESH_TOKEN_EXPIRES_DAYS', 30);
        res.cookie(REFRESH_COOKIE, token, {
            httpOnly: true,
            secure: this.config.get('NODE_ENV') === 'production',
            sameSite: 'strict',
            maxAge: expiresInDays * 24 * 60 * 60 * 1000,
            path: '/',
        });
    }
}
