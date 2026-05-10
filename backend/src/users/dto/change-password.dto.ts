import { IsNotEmpty, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import type { IChangePasswordRequest } from '@preduzetnik/shared';

export class ChangePasswordDto implements IChangePasswordRequest {
    @ApiProperty({ example: 'oldPassword123' })
    @IsString()
    @IsNotEmpty()
    currentPassword: string;

    @ApiProperty({ example: 'newPassword123' })
    @IsString()
    @MinLength(8)
    newPassword: string;
}
