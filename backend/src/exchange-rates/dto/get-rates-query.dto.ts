import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsOptional } from 'class-validator';

export class GetRatesQueryDto {
  @ApiPropertyOptional({
    example: '2026-05-03',
    description: 'ISO date (YYYY-MM-DD). Defaults to today.',
  })
  @IsOptional()
  @IsDateString({ strict: true })
  date?: string;
}
