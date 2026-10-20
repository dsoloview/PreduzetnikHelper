import { IUpdateUserRequest } from '@preduzetnik/shared';
import { IsOptional, IsString, MaxLength } from 'class-validator';
import { MAX_LENGTH } from '../../common/validation/max-length';

export class UpdateUserDto implements IUpdateUserRequest {
  @IsOptional() @IsString() @MaxLength(MAX_LENGTH.name) name?: string;
  @IsOptional() @IsString() @MaxLength(MAX_LENGTH.name) companyName?: string;
  @IsOptional() @IsString() @MaxLength(MAX_LENGTH.code) pib?: string;
  @IsOptional() @IsString() @MaxLength(MAX_LENGTH.code) mbr?: string;
  @IsOptional() @IsString() @MaxLength(MAX_LENGTH.code) activityCode?: string;
  @IsOptional() @IsString() @MaxLength(MAX_LENGTH.address) address?: string;
  @IsOptional() @IsString() @MaxLength(MAX_LENGTH.city) city?: string;
  @IsOptional()
  @IsString()
  @MaxLength(MAX_LENGTH.postalCode)
  postalCode?: string;
  @IsOptional() @IsString() @MaxLength(MAX_LENGTH.city) municipality?: string;
  @IsOptional() @IsString() @MaxLength(MAX_LENGTH.code) phone?: string;
}
