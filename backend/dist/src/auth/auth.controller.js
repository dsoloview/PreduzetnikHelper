"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const common_1 = require("@nestjs/common");
const auth_service_1 = require("./auth.service");
const login_dto_1 = require("./dto/login.dto");
const auth_helpers_1 = require("./helpers/auth.helpers");
const register_dto_1 = require("./dto/register.dto");
const swagger_1 = require("@nestjs/swagger");
const auth_response_dto_1 = require("./dto/auth-response.dto");
const throttler_1 = require("@nestjs/throttler");
const config_1 = require("@nestjs/config");
const REFRESH_COOKIE = 'refreshToken';
let AuthController = class AuthController {
    authService;
    config;
    constructor(authService, config) {
        this.authService = authService;
        this.config = config;
    }
    async login(loginDto, req, res) {
        const meta = { ip: req.ip, userAgent: req.headers['user-agent'] };
        const { accessToken, refreshToken } = await this.authService.login(loginDto, meta);
        this.setRefreshCookie(res, refreshToken);
        return { accessToken };
    }
    async register(registerDto, req, res) {
        const meta = { ip: req.ip, userAgent: req.headers['user-agent'] };
        const { accessToken, refreshToken } = await this.authService.register(registerDto, meta);
        this.setRefreshCookie(res, refreshToken);
        return { accessToken };
    }
    async refresh(req, res) {
        const rawToken = req.cookies?.[REFRESH_COOKIE];
        if (!rawToken) {
            throw new common_1.UnauthorizedException('Refresh token missing');
        }
        const meta = { ip: req.ip, userAgent: req.headers['user-agent'] };
        const { accessToken, refreshToken } = await this.authService.refresh(rawToken, meta);
        this.setRefreshCookie(res, refreshToken);
        return { accessToken };
    }
    async logout(req, res) {
        const rawToken = req.cookies?.[REFRESH_COOKIE];
        if (rawToken) {
            await this.authService.logout(rawToken);
        }
        res.clearCookie(REFRESH_COOKIE, { httpOnly: true, sameSite: 'strict', secure: true });
    }
    setRefreshCookie(res, token) {
        const expiresInDays = this.config.get('REFRESH_TOKEN_EXPIRES_DAYS', 30);
        res.cookie(REFRESH_COOKIE, token, {
            httpOnly: true,
            secure: this.config.get('NODE_ENV') === 'production',
            sameSite: 'strict',
            maxAge: expiresInDays * 24 * 60 * 60 * 1000,
            path: '/',
        });
    }
};
exports.AuthController = AuthController;
__decorate([
    (0, auth_helpers_1.Public)(),
    (0, common_1.Post)('login'),
    (0, swagger_1.ApiOperation)({ summary: 'Login with email and password' }),
    (0, swagger_1.ApiResponse)({ status: 200, type: auth_response_dto_1.AuthResponseDto }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Res)({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [login_dto_1.LoginDto, Object, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "login", null);
__decorate([
    (0, auth_helpers_1.Public)(),
    (0, common_1.Post)('register'),
    (0, swagger_1.ApiOperation)({ summary: 'Register a new user' }),
    (0, swagger_1.ApiResponse)({ status: 201, type: auth_response_dto_1.AuthResponseDto }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Res)({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [register_dto_1.RegisterDto, Object, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "register", null);
__decorate([
    (0, auth_helpers_1.Public)(),
    (0, common_1.Post)('refresh'),
    (0, common_1.HttpCode)(200),
    (0, swagger_1.ApiCookieAuth)(REFRESH_COOKIE),
    (0, swagger_1.ApiOperation)({ summary: 'Get new access token using refresh token cookie' }),
    (0, swagger_1.ApiResponse)({ status: 200, type: auth_response_dto_1.AuthResponseDto }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Res)({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "refresh", null);
__decorate([
    (0, auth_helpers_1.Public)(),
    (0, common_1.Post)('logout'),
    (0, common_1.HttpCode)(204),
    (0, swagger_1.ApiCookieAuth)(REFRESH_COOKIE),
    (0, swagger_1.ApiOperation)({ summary: 'Logout and invalidate refresh token' }),
    (0, swagger_1.ApiResponse)({ status: 204 }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Res)({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "logout", null);
exports.AuthController = AuthController = __decorate([
    (0, swagger_1.ApiTags)('Auth'),
    (0, throttler_1.Throttle)({ default: { ttl: 60000, limit: 5 } }),
    (0, common_1.Controller)('auth'),
    __metadata("design:paramtypes", [auth_service_1.AuthService,
        config_1.ConfigService])
], AuthController);
//# sourceMappingURL=auth.controller.js.map