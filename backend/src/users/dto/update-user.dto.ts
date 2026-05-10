import { IUpdateUserRequest } from "@preduzetnik/shared";
import {IsOptional, IsString} from "class-validator";

export class UpdateUserDto implements IUpdateUserRequest {
    @IsOptional() @IsString() name?: string;
    @IsOptional() @IsString() companyName?: string;
    @IsOptional() @IsString() pib?: string;
    @IsOptional() @IsString() mbr?: string;
    @IsOptional() @IsString() activityCode?: string;
    @IsOptional() @IsString() address?: string;
    @IsOptional() @IsString() city?: string;
    @IsOptional() @IsString() postalCode?: string;
    @IsOptional() @IsString() municipality?: string;
    @IsOptional() @IsString() phone?: string;
}