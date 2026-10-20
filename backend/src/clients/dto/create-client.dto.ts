import type { ClientType } from '@preduzetnik/shared';
import { CLIENT_TYPES, ICreateClientRequest } from '@preduzetnik/shared';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsPhoneNumber,
  IsString,
  MaxLength,
} from 'class-validator';
import { MAX_LENGTH } from '../../common/validation/max-length';
import { Transform } from 'class-transformer';
import { emptyToUndefined } from '../../common/transformers/empty-to-undefined.transformer';

export class CreateClientDto implements ICreateClientRequest {
  @ApiProperty({ enum: CLIENT_TYPES })
  @IsNotEmpty()
  type: ClientType;
  @ApiProperty({ example: 'name' })
  @IsNotEmpty()
  @MaxLength(MAX_LENGTH.name)
  name: string;
  @ApiPropertyOptional({ example: 'test@test.com' })
  @Transform(emptyToUndefined)
  @IsOptional()
  @IsEmail()
  @MaxLength(MAX_LENGTH.email)
  email?: string;
  @ApiPropertyOptional({
    example: '+381641234567',
    description: 'E.164 format with country code (e.g. +381641234567)',
  })
  @Transform(emptyToUndefined)
  @IsOptional()
  @IsPhoneNumber()
  @MaxLength(MAX_LENGTH.code)
  phone?: string;
  @ApiProperty({ example: 'address' })
  @IsNotEmpty()
  @MaxLength(MAX_LENGTH.address)
  address: string;
  @ApiProperty({ example: 'city' })
  @IsNotEmpty()
  @MaxLength(MAX_LENGTH.city)
  city: string;
  @ApiProperty({ example: '11000', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(MAX_LENGTH.postalCode)
  postalCode?: string;
  @ApiProperty({ example: 'country' })
  @IsNotEmpty()
  @MaxLength(MAX_LENGTH.city)
  country: string;
  @ApiProperty({ example: '123456789' })
  @IsNotEmpty()
  @MaxLength(MAX_LENGTH.code)
  taxId: string;
  @ApiProperty({ example: '123456789' })
  @IsNotEmpty()
  @MaxLength(MAX_LENGTH.code)
  registrationNumber: string;
}
