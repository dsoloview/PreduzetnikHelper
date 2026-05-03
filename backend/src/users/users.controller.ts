import {Controller, Get, NotFoundException, Request} from '@nestjs/common';
import {UsersService} from "./users.service";
import {ApiBearerAuth, ApiOperation, ApiResponse, ApiTags} from "@nestjs/swagger";
import {UserResponseDto} from "./dto/user-response.dto";
import {CurrentUser} from "../auth/decorators/current-user.decorator";
import type {JwtPayload} from "../auth/types/jwt-payload.type";

@ApiTags('Users')
@ApiBearerAuth()
@Controller('users')
export class UsersController {
    constructor(private readonly usersService: UsersService) {
    }

    @Get('profile')
    @ApiOperation({ summary: 'Get current user profile' })
    @ApiResponse({ status: 200, type: UserResponseDto })
    async profile(@CurrentUser() userPayload: JwtPayload): Promise<UserResponseDto> {
        const user = await this.usersService.user({ id: userPayload.userId });

        if (!user) {
            throw new NotFoundException('User not found');
        }

        const {password, ...profile} = user;
        return profile;
    }
}

