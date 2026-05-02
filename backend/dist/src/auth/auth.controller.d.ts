import { AuthService } from "./auth.service";
import { LoginDto } from "./dto/login.dto";
import { RegisterDto } from "./dto/register.dto";
export declare class AuthController {
    private authService;
    constructor(authService: AuthService);
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
