import { JwtService } from "@nestjs/jwt";
import { UsersService } from "../users/users.service";
import { LoginDto } from "./dto/login.dto";
import { RegisterDto } from "./dto/register.dto";
export declare class AuthService {
    private jwtService;
    private usersService;
    constructor(jwtService: JwtService, usersService: UsersService);
    login(loginDto: LoginDto): Promise<{
        access_token: string;
    }>;
    register(registerDto: RegisterDto): Promise<{
        id: string;
        email: string;
        password: string;
        name: string;
        companyName: string | null;
        pib: string | null;
        mbr: string | null;
        activityCode: string | null;
        address: string | null;
        city: string | null;
        municipality: string | null;
        phone: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
}
