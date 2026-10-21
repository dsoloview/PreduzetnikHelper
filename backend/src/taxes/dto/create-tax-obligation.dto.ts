import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Matches,
  Max,
  MaxLength,
  Min,
  ValidateIf,
} from 'class-validator';
import { ICreateTaxObligationRequest } from '@preduzetnik/shared';
import { MAX_LENGTH } from '../../common/validation/max-length';

export class CreateTaxObligationDto implements ICreateTaxObligationRequest {
  @ApiProperty({ example: 'Porez na prihod od samostalne delatnosti' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(MAX_LENGTH.name)
  name: string;

  @ApiProperty({ example: 6500.5, description: 'Monthly amount in RSD' })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01)
  amount: number;

  @ApiProperty({ example: 'Poreska uprava' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(MAX_LENGTH.name)
  recipientName: string;

  @ApiProperty({ example: '840-711122843-32' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(MAX_LENGTH.code)
  recipientAccount: string;

  @ApiPropertyOptional({ example: '253', description: 'Šifra plaćanja' })
  @IsOptional()
  @Matches(/^[12]\d{2}$/, {
    message: 'paymentCode must be 3 digits starting with 1 or 2',
  })
  paymentCode?: string;

  @ApiPropertyOptional({ example: '97' })
  @IsOptional()
  @Matches(/^\d{2}$/, { message: 'model must be 2 digits' })
  model?: string;

  @ApiProperty({
    example: '12345678901234567890',
    description: 'Poziv na broj',
  })
  @IsString()
  @Matches(/^[\d-]{1,23}$/, {
    message: 'reference may contain only digits and dashes, up to 23',
  })
  reference: string;

  @ApiPropertyOptional({ example: 'Porez paušal', nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(35)
  purpose?: string | null;

  @ApiProperty({ example: 2026 })
  @IsInt()
  @Min(2000)
  @Max(2100)
  startYear: number;

  @ApiProperty({ example: 1 })
  @IsInt()
  @Min(1)
  @Max(12)
  startMonth: number;

  @ApiPropertyOptional({ example: 2026, nullable: true })
  @IsOptional()
  @ValidateIf((_, value) => value !== null)
  @IsInt()
  @Min(2000)
  @Max(2100)
  endYear?: number | null;

  @ApiPropertyOptional({ example: 12, nullable: true })
  @IsOptional()
  @ValidateIf((_, value) => value !== null)
  @IsInt()
  @Min(1)
  @Max(12)
  endMonth?: number | null;
}
