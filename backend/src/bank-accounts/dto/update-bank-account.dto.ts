import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEnum,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { MAX_LENGTH } from '../../common/validation/max-length';
import type { Currency } from '@preduzetnik/shared';
import { Currency as CurrencyEnum } from '../../generated/prisma/enums';
import { IUpdateBankAccountRequest } from '@preduzetnik/shared';

export class UpdateBankAccountDto implements IUpdateBankAccountRequest {
  @ApiPropertyOptional({ example: 'UniCredit Bank' })
  @IsOptional()
  @IsString()
  @MaxLength(MAX_LENGTH.name)
  bankName?: string;

  @ApiPropertyOptional({ example: '105-987654321012-34' })
  @IsOptional()
  @IsString()
  @MaxLength(MAX_LENGTH.code)
  accountNumber?: string;

  @ApiPropertyOptional({ example: 'BKBMRS22' })
  @IsOptional()
  @IsString()
  @MaxLength(MAX_LENGTH.code)
  swiftCode?: string;

  @ApiPropertyOptional({ example: 'RS35160005080003520714' })
  @IsOptional()
  @IsString()
  @MaxLength(MAX_LENGTH.code)
  iban?: string;

  @ApiPropertyOptional({ enum: CurrencyEnum })
  @IsOptional()
  @IsEnum(CurrencyEnum)
  currency?: Currency;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;
}
