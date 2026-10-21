import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseIntPipe,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { JwtPayload } from '../auth/types/jwt-payload.type';
import { TaxesService } from './taxes.service';
import { CreateTaxObligationDto } from './dto/create-tax-obligation.dto';
import { UpdateTaxObligationDto } from './dto/update-tax-obligation.dto';
import { MarkTaxPaidDto } from './dto/mark-tax-paid.dto';

@ApiTags('Taxes')
@ApiBearerAuth()
@Controller('taxes')
export class TaxesController {
  constructor(private readonly taxesService: TaxesService) {}

  @Get('obligations')
  @ApiOperation({
    summary: 'Monthly taxes and contributions from the paušal decision',
  })
  listObligations(@CurrentUser() user: JwtPayload) {
    return this.taxesService.listObligations(user.userId);
  }

  @Post('obligations')
  @ApiOperation({ summary: 'Add an obligation with its payment details' })
  createObligation(
    @CurrentUser() user: JwtPayload,
    @Body() dto: CreateTaxObligationDto,
  ) {
    return this.taxesService.createObligation(user.userId, dto);
  }

  @Patch('obligations/:id')
  @ApiOperation({ summary: 'Update an obligation' })
  updateObligation(
    @CurrentUser() user: JwtPayload,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateTaxObligationDto,
  ) {
    return this.taxesService.updateObligation(user.userId, id, dto);
  }

  @Delete('obligations/:id')
  @HttpCode(204)
  @ApiOperation({
    summary: 'Delete an obligation that has no recorded payments',
  })
  removeObligation(
    @CurrentUser() user: JwtPayload,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.taxesService.removeObligation(user.userId, id);
  }

  @Get('calendar')
  @ApiOperation({
    summary: 'Payments due per month of a year, with IPS QR codes',
  })
  getCalendar(
    @CurrentUser() user: JwtPayload,
    @Query('year', ParseIntPipe) year: number,
  ) {
    return this.taxesService.getCalendar(user.userId, year);
  }

  @Post('payments')
  @ApiOperation({ summary: 'Mark a month of an obligation as paid' })
  markPaid(@CurrentUser() user: JwtPayload, @Body() dto: MarkTaxPaidDto) {
    return this.taxesService.markPaid(user.userId, dto);
  }

  @Delete('payments/:id')
  @HttpCode(204)
  @ApiOperation({ summary: 'Undo marking a month as paid' })
  unmarkPaid(
    @CurrentUser() user: JwtPayload,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.taxesService.unmarkPaid(user.userId, id);
  }
}
