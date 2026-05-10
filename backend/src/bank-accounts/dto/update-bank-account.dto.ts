import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsEnum, IsOptional, IsString } from 'class-validator';
import type { Currency } from '@preduzetnik/shared';
import { IUpdateBankAccountRequest } from '@preduzetnik/shared';

export class UpdateBankAccountDto implements IUpdateBankAccountRequest {
    @ApiPropertyOptional({ example: 'UniCredit Bank' })
    @IsOptional()
    @IsString()
    bankName?: string;

    @ApiPropertyOptional({ example: '105-987654321012-34' })
    @IsOptional()
    @IsString()
    accountNumber?: string;

    @ApiPropertyOptional({ example: 'BKBMRS22' })
    @IsOptional()
    @IsString()
    swiftCode?: string;

    @ApiPropertyOptional({ example: 'RS35160005080003520714' })
    @IsOptional()
    @IsString()
    iban?: string;

    @ApiPropertyOptional({ enum: ['RSD', 'EUR', 'USD'] })
    @IsOptional()
    @IsEnum(['RSD', 'EUR', 'USD'])
    currency?: Currency;

    @ApiPropertyOptional({ example: true })
    @IsOptional()
    @IsBoolean()
    isDefault?: boolean;
}
