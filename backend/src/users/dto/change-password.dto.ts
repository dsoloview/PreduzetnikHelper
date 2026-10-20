import {
  IsNotEmpty,
  IsString,
  MinLength,
  Matches,
  MaxLength,
} from 'class-validator';
import { MAX_LENGTH } from '../../common/validation/max-length';
import { ApiProperty } from '@nestjs/swagger';
import type { IChangePasswordRequest } from '@preduzetnik/shared';

export class ChangePasswordDto implements IChangePasswordRequest {
  @ApiProperty({ example: 'oldPassword123' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(MAX_LENGTH.password)
  currentPassword: string;

  @ApiProperty({ example: 'NewPassword1', minLength: 8 })
  @IsString()
  @MinLength(8)
  @Matches(/^(?=.*[A-Z])(?=.*\d).+$/, {
    message: 'Password must contain at least 1 uppercase letter and 1 digit',
  })
  @MaxLength(MAX_LENGTH.password)
  newPassword: string;
}
