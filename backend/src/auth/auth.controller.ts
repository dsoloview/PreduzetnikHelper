import {Controller, Post, Body} from '@nestjs/common';
import {AuthService} from "./auth.service";
import {LoginDto} from "./dto/login.dto";
import {Public} from "./helpers/auth.helpers";
import {RegisterDto} from "./dto/register.dto";
import {ApiOperation, ApiResponse, ApiTags} from "@nestjs/swagger";
import {AuthResponseDto} from "./dto/auth-response.dto";
import { Throttle } from '@nestjs/throttler';

@ApiTags('Auth')
@Throttle({ default: { ttl: 60000, limit: 5 } })
@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) {
    }

    @Public()
    @Post('login')
    @ApiOperation({ summary: 'Login with email and password' })
    @ApiResponse({ status: 200, type: AuthResponseDto })
    async login(@Body() loginDto: LoginDto): Promise<AuthResponseDto> {
        return this.authService.login(loginDto);
    }

    @Public()
    @Post('register')
    @ApiOperation({ summary: 'Register a new user' })
    @ApiResponse({ status: 201, type: AuthResponseDto })
    async register(@Body() registerDto: RegisterDto): Promise<AuthResponseDto> {
        return this.authService.register(registerDto);
    }
}
