import { UsersService } from "./users.service";
import { UserResponseDto } from "./dto/user-response.dto";
import type { JwtPayload } from "../auth/types/jwt-payload.type";
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    profile(userPayload: JwtPayload): Promise<UserResponseDto>;
}
