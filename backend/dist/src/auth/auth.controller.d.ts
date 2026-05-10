import type { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { AuthResponseDto } from './dto/auth-response.dto';
import { ConfigService } from '@nestjs/config';
export declare class AuthController {
    private authService;
    private config;
    constructor(authService: AuthService, config: ConfigService);
    login(loginDto: LoginDto, req: Request, res: Response): Promise<AuthResponseDto>;
    register(registerDto: RegisterDto, req: Request, res: Response): Promise<AuthResponseDto>;
    refresh(req: Request, res: Response): Promise<AuthResponseDto>;
    logout(req: Request, res: Response): Promise<void>;
    private setRefreshCookie;
}
