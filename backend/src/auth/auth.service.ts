import {Injectable, UnprocessableEntityException} from '@nestjs/common';
import {JwtService} from "@nestjs/jwt";
import {UsersService} from "../users/users.service";
import {LoginDto} from "./dto/login.dto";
import {RegisterDto} from "./dto/register.dto";
import * as bcrypt from 'bcrypt';
import {User} from "../generated/prisma/client";
import {AuthResponseDto} from "./dto/auth-response.dto";

@Injectable()
export class AuthService {
    constructor(
        private jwtService: JwtService,
        private usersService: UsersService,
    ) {
    }

    async login(loginDto: LoginDto): Promise<AuthResponseDto> {
        const user = await this.usersService.user({email: loginDto.email});
        if (!user) {
            throw new UnprocessableEntityException("Invalid credentials")
        }

        if (!await bcrypt.compare(loginDto.password, user.password)) {
            throw new UnprocessableEntityException("Invalid credentials")
        }

        return this.createAccessToken(user);
    }

    async register(registerDto: RegisterDto): Promise<AuthResponseDto> {
        const existingUser = await this.usersService.user({email: registerDto.email});
        if (existingUser) {
            throw new UnprocessableEntityException("Email already exists")
        }

        const hashedPassword = await bcrypt.hash(registerDto.password, 10);
        const createdUser = await this.usersService.createUser({
            ...registerDto,
            password: hashedPassword
        });

        if (!createdUser) {
            throw new UnprocessableEntityException("Failed to create user")
        }

        return this.createAccessToken(createdUser);
    }

    private createAccessToken(user: User): AuthResponseDto {
        return {
            accessToken: this.jwtService.sign({username: user.name, sub: user.id}),
        }
    }
}
