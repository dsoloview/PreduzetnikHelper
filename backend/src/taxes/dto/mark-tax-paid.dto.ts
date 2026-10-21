import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsInt, IsUUID, Max, Min } from 'class-validator';
import { IMarkTaxPaidRequest } from '@preduzetnik/shared';

export class MarkTaxPaidDto implements IMarkTaxPaidRequest {
  @ApiProperty()
  @IsUUID()
  obligationId: string;

  @ApiProperty({ example: 2026 })
  @IsInt()
  @Min(2000)
  @Max(2100)
  year: number;

  @ApiProperty({ example: 9, description: 'The month the tax is for' })
  @IsInt()
  @Min(1)
  @Max(12)
  month: number;

  @ApiProperty({ example: '2026-10-14' })
  @IsDateString({ strict: true })
  paidAt: string;
}
