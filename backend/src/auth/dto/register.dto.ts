import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { IRegisterRequest } from "@preduzetnik/shared";

export class RegisterDto implements IRegisterRequest {
    @ApiProperty({ example: 'user@example.com' })
    @IsEmail()
    email: string;

    @ApiProperty({ example: 'password123', minLength: 6 })
    @IsNotEmpty()
    @MinLength(6)
    password: string;

    @ApiProperty({ example: 'Bob Marley' })
    @IsNotEmpty()
    name: string;
}
