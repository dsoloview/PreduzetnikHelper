import {
    Controller, Get, Post, Patch, Delete,
    Param, Body, Query, ParseUUIDPipe,
} from '@nestjs/common';
import {
    ApiTags, ApiBearerAuth, ApiOperation, ApiResponse, ApiQuery,
} from '@nestjs/swagger';
import { InvoicesService } from './invoices.service';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { UpdateInvoiceDto } from './dto/update-invoice.dto';
import { InvoiceResponseDto } from './dto/invoice-response.dto';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { JwtPayload } from '../auth/types/jwt-payload.type';

@ApiTags('Invoices')
@ApiBearerAuth()
@Controller('invoices')
export class InvoicesController {
    constructor(private readonly invoicesService: InvoicesService) {}

    @Post()
    @ApiOperation({ summary: 'Create a new invoice' })
    @ApiResponse({ status: 201, type: InvoiceResponseDto })
    async create(
        @CurrentUser() user: JwtPayload,
        @Body() dto: CreateInvoiceDto,
    ): Promise<InvoiceResponseDto> {
        return this.invoicesService.create(user.userId, dto);
    }

    @Get()
    @ApiOperation({ summary: 'Get all invoices for current user' })
    @ApiResponse({ status: 200, type: [InvoiceResponseDto] })
    @ApiQuery({ name: 'year', required: false, type: Number })
    @ApiQuery({ name: 'status', required: false, enum: ['DRAFT', 'SENT', 'PAID', 'CANCELLED'] })
    @ApiQuery({ name: 'clientId', required: false })
    async findAll(
        @CurrentUser() user: JwtPayload,
        @Query('year') year?: number,
        @Query('status') status?: string,
        @Query('clientId') clientId?: string,
    ): Promise<InvoiceResponseDto[]> {
        return this.invoicesService.findAll(user.userId, { year, status, clientId });
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get an invoice by ID' })
    @ApiResponse({ status: 200, type: InvoiceResponseDto })
    async findOne(
        @Param('id', ParseUUIDPipe) id: string,
        @CurrentUser() user: JwtPayload,
    ): Promise<InvoiceResponseDto> {
        return this.invoicesService.findOne(id, user.userId);
    }

    @Patch(':id')
    @ApiOperation({ summary: 'Update an invoice (only DRAFT invoices can be edited)' })
    @ApiResponse({ status: 200, type: InvoiceResponseDto })
    async update(
        @Param('id', ParseUUIDPipe) id: string,
        @CurrentUser() user: JwtPayload,
        @Body() dto: UpdateInvoiceDto,
    ): Promise<InvoiceResponseDto> {
        return this.invoicesService.update(id, user.userId, dto);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Delete an invoice (only DRAFT invoices can be deleted)' })
    @ApiResponse({ status: 200, type: InvoiceResponseDto })
    async remove(
        @Param('id', ParseUUIDPipe) id: string,
        @CurrentUser() user: JwtPayload,
    ): Promise<InvoiceResponseDto> {
        return this.invoicesService.remove(id, user.userId);
    }
}
