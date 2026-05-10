import {Body, Controller, Get, HttpCode, HttpStatus, NotFoundException, Patch} from '@nestjs/common';
import {UsersService} from "./users.service";
import {ApiBearerAuth, ApiOperation, ApiResponse, ApiTags} from "@nestjs/swagger";
import {UserResponseDto} from "./dto/user-response.dto";
import {CurrentUser} from "../auth/decorators/current-user.decorator";
import type {JwtPayload} from "../auth/types/jwt-payload.type";
import {UpdateUserDto} from "./dto/update-user.dto";
import {ChangePasswordDto} from "./dto/change-password.dto";

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

    @Patch('profile')
    @ApiOperation({ summary: 'Update current user profile' })
    @ApiResponse({ status: 200, type: UserResponseDto })
    async updateProfile(
        @CurrentUser() user: JwtPayload,
        @Body() dto: UpdateUserDto,
    ): Promise<UserResponseDto> {
        return this.usersService.updateProfile(user.userId, dto);
    }

    @Patch('change-password')
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiOperation({ summary: 'Change current user password' })
    @ApiResponse({ status: 204, description: 'Password changed successfully' })
    @ApiResponse({ status: 422, description: 'Current password is incorrect' })
    async changePassword(
        @CurrentUser() user: JwtPayload,
        @Body() dto: ChangePasswordDto,
    ): Promise<void> {
        return this.usersService.changePassword(user.userId, dto);
    }
}

