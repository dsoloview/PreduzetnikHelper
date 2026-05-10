import { IsNotEmpty, IsString, MinLength, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import type { IChangePasswordRequest } from '@preduzetnik/shared';

export class ChangePasswordDto implements IChangePasswordRequest {
    @ApiProperty({ example: 'oldPassword123' })
    @IsString()
    @IsNotEmpty()
    currentPassword: string;

    @ApiProperty({ example: 'NewPassword1', minLength: 8 })
    @IsString()
    @MinLength(8)
    @Matches(/^(?=.*[A-Z])(?=.*\d).+$/, {
        message: 'Password must contain at least 1 uppercase letter and 1 digit',
    })
    newPassword: string;
}
