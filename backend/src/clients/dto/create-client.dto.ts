import type {ClientType} from "@preduzetnik/shared";
import {CLIENT_TYPES, ICreateClientRequest} from "@preduzetnik/shared";
import {ApiProperty, ApiPropertyOptional} from "@nestjs/swagger";
import {IsEmail, IsNotEmpty, IsOptional, IsPhoneNumber, IsString} from "class-validator";
import {Transform} from "class-transformer";
import {emptyToUndefined} from "../../common/transformers/empty-to-undefined.transformer";

export class CreateClientDto implements ICreateClientRequest {
    @ApiProperty({ enum: CLIENT_TYPES })
    @IsNotEmpty()
    type: ClientType;
    @ApiProperty({ example: 'name' })
    @IsNotEmpty()
    name: string;
    @ApiPropertyOptional({ example: 'test@test.com' })
    @Transform(emptyToUndefined)
    @IsOptional()
    @IsEmail()
    email?: string;
    /**
     * International phone number in E.164 format (with leading `+` and country code,
     * e.g. `+381641234567`). Accepted from any country, not just Serbia.
     */
    @ApiPropertyOptional({ example: '+381641234567', description: 'E.164 format with country code (e.g. +381641234567)' })
    @Transform(emptyToUndefined)
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