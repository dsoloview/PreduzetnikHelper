import type {ClientType} from "@preduzetnik/shared";
import {CLIENT_TYPES, ICreateClientRequest} from "@preduzetnik/shared";
import {ApiProperty} from "@nestjs/swagger";
import {IsEmail, IsNotEmpty, IsOptional, IsPhoneNumber, IsString} from "class-validator";

export class CreateClientDto implements ICreateClientRequest {
    @ApiProperty({ enum: CLIENT_TYPES })
    @IsNotEmpty()
    type: ClientType;
    @ApiProperty({ example: 'name' })
    @IsNotEmpty()
    name: string;
    @ApiProperty({ example: 'test@test.com' })
    @IsEmail()
    @IsOptional()
    email?: string;
    @ApiProperty({ example: '123456789' })
    @IsOptional()
    @IsPhoneNumber()
    phone?: string;
    @ApiProperty({ example: 'address' })
    @IsNotEmpty()
    address: string;
    @ApiProperty({ example: 'city' })
    @IsNotEmpty()
    city: string;
    @ApiProperty({ example: '11000', required: false })
    @IsOptional()
    @IsString()
    postalCode?: string;
    @ApiProperty({ example: 'country' })
    @IsNotEmpty()
    country: string;
    @ApiProperty({ example: '123456789' })
    @IsNotEmpty()
    taxId: string;
    @ApiProperty({ example: '123456789' })
    @IsNotEmpty()
    registrationNumber: string;
}