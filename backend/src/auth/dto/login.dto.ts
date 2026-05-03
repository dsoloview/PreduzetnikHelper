import {IsEmail, IsNotEmpty, MinLength} from "class-validator";
import {ApiProperty} from "@nestjs/swagger";
import { ILoginRequest } from "@preduzetnik/shared";

export class LoginDto implements ILoginRequest {
    @ApiProperty({ example: 'user@example.com' })
    @IsEmail()
    email: string;

    @ApiProperty({ example: 'password123', minLength: 6 })
    @IsNotEmpty()
    @MinLength(6)
    password: string;
}