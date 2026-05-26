import {IsEmail, IsNotEmpty, Matches, MinLength} from "class-validator";
import {ApiProperty} from "@nestjs/swagger";
import { ILoginRequest } from "@preduzetnik/shared";

export class LoginDto implements ILoginRequest {
    @ApiProperty({ example: 'user@example.com' })
    @IsEmail()
    email: string;

    @ApiProperty({ example: 'Password1', minLength: 8 })
    @IsNotEmpty()
    @MinLength(8)
    @Matches(/^(?=.*[A-Z])(?=.*\d).+$/, {
        message: 'Password must contain at least 1 uppercase letter and 1 digit',
    })
    password: string;
}