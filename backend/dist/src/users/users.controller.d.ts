import { UsersService } from "./users.service";
import { UserResponseDto } from "./dto/user-response.dto";
import type { JwtPayload } from "../auth/types/jwt-payload.type";
import { UpdateUserDto } from "./dto/update-user.dto";
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    profile(userPayload: JwtPayload): Promise<UserResponseDto>;
    updateProfile(user: JwtPayload, dto: UpdateUserDto): Promise<UserResponseDto>;
}
