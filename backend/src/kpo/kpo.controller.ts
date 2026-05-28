import { Controller, Get, Query, Res, ParseIntPipe } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import type { Response } from 'express';
import { KpoService } from './kpo.service';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { JwtPayload } from '../auth/types/jwt-payload.type';
import { IKpoResponse } from '@preduzetnik/shared';

@ApiTags('KPO')
@ApiBearerAuth()
@Controller('kpo')
export class KpoController {
    constructor(private readonly kpoService: KpoService) {}

    @Get()
    @ApiOperation({ summary: 'Get KPO book entries for a specific year' })
    @ApiQuery({ name: 'year', required: true, type: Number })
    async getKpo(
        @CurrentUser() user: JwtPayload,
        @Query('year', ParseIntPipe) year: number,
    ): Promise<IKpoResponse> {
        return this.kpoService.getKpoForYear(user.userId, year);
    }

    @Get('pdf')
    @Throttle({ pdf: { ttl: 60000, limit: 10 } })
    @ApiOperation({ summary: 'Generate PDF of KPO book for a specific year' })
    @ApiQuery({ name: 'year', required: true, type: Number })
    @ApiResponse({ status: 200, description: 'PDF file generated successfully' })
    async getKpoPdf(
        @CurrentUser() user: JwtPayload,
        @Query('year', ParseIntPipe) year: number,
        @Res() res: Response,
    ): Promise<void> {
        const pdfBuffer = await this.kpoService.generateKpoPdf(user.userId, year);

        res.set({
            'Content-Type': 'application/pdf',
            'Content-Disposition': `attachment; filename="KPO-${year}.pdf"`,
            'Content-Length': pdfBuffer.length,
        });

        res.end(pdfBuffer);
    }
}
