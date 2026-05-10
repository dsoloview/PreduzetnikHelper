"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const config_1 = require("@nestjs/config");
const users_service_1 = require("../users/users.service");
const prisma_service_1 = require("../prisma/prisma.service");
const bcrypt = __importStar(require("bcrypt"));
const crypto = __importStar(require("crypto"));
let AuthService = class AuthService {
    jwtService;
    usersService;
    prisma;
    config;
    constructor(jwtService, usersService, prisma, config) {
        this.jwtService = jwtService;
        this.usersService = usersService;
        this.prisma = prisma;
        this.config = config;
    }
    async login(loginDto, meta) {
        const user = await this.usersService.user({ email: loginDto.email });
        if (!user) {
            throw new common_1.UnprocessableEntityException('Invalid credentials');
        }
        if (!await bcrypt.compare(loginDto.password, user.password)) {
            throw new common_1.UnprocessableEntityException('Invalid credentials');
        }
        return this.createTokenPair(user, meta);
    }
    async register(registerDto, meta) {
        const existingUser = await this.usersService.user({ email: registerDto.email });
        if (existingUser) {
            throw new common_1.UnprocessableEntityException('Email already exists');
        }
        const hashedPassword = await bcrypt.hash(registerDto.password, 10);
        const createdUser = await this.usersService.createUser({
            ...registerDto,
            password: hashedPassword,
        });
        if (!createdUser) {
            throw new common_1.UnprocessableEntityException('Failed to create user');
        }
        return this.createTokenPair(createdUser, meta);
    }
    async refresh(rawRefreshToken, meta) {
        const record = await this.prisma.refreshToken.findMany({
            where: { expiresAt: { gt: new Date() } },
            include: { user: true },
        });
        let matched;
        for (const r of record) {
            if (await bcrypt.compare(rawRefreshToken, r.hashedToken)) {
                matched = r;
                break;
            }
        }
        if (!matched) {
            throw new common_1.UnauthorizedException('Invalid or expired refresh token');
        }
        await this.prisma.refreshToken.delete({ where: { id: matched.id } });
        return this.createTokenPair(matched.user, meta);
    }
    async logout(rawRefreshToken) {
        const records = await this.prisma.refreshToken.findMany();
        for (const r of records) {
            if (await bcrypt.compare(rawRefreshToken, r.hashedToken)) {
                await this.prisma.refreshToken.delete({ where: { id: r.id } });
                return;
            }
        }
    }
    async logoutAll(userId) {
        await this.prisma.refreshToken.deleteMany({ where: { userId } });
    }
    async createTokenPair(user, meta) {
        const jti = crypto.randomUUID();
        const rawToken = crypto.randomBytes(64).toString('hex');
        const hashedToken = await bcrypt.hash(rawToken, 10);
        const expiresInDays = this.config.get('REFRESH_TOKEN_EXPIRES_DAYS', 30);
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
        const accessToken = this.jwtService.sign({ username: user.name, sub: user.id });
        return { accessToken, refreshToken: rawToken };
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [jwt_1.JwtService,
        users_service_1.UsersService,
        prisma_service_1.PrismaService,
        config_1.ConfigService])
], AuthService);
//# sourceMappingURL=auth.service.js.map