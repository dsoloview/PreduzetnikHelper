import {
  IsEmail,
  IsNotEmpty,
  MinLength,
  Matches,
  MaxLength,
} from 'class-validator';
import { MAX_LENGTH } from '../../common/validation/max-length';
import { ApiProperty } from '@nestjs/swagger';
import { IRegisterRequest } from '@preduzetnik/shared';

export class RegisterDto implements IRegisterRequest {
  @ApiProperty({ example: 'user@example.com' })
  @IsEmail()
  @MaxLength(MAX_LENGTH.email)
  email: string;

  @ApiProperty({ example: 'Password1', minLength: 8 })
  @IsNotEmpty()
  @MinLength(8)
  @Matches(/^(?=.*[A-Z])(?=.*\d).+$/, {
    message: 'Password must contain at least 1 uppercase letter and 1 digit',
  })
  @MaxLength(MAX_LENGTH.password)
  password: string;

  @ApiProperty({ example: 'Bob Marley' })
  @IsNotEmpty()
  @MaxLength(MAX_LENGTH.name)
  name: string;
}
