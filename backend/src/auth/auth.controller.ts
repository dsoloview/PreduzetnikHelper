import {Controller, Post, UseGuards, Request} from '@nestjs/common';
import {JwtAuthGuard} from "./jwt-auth.guard";
import {AuthService} from "./auth.service";

@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) {}

    @Post('login')
    async login(@Request() req) {
        return this.authService.login(req.user);
     }
}
