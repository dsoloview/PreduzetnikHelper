import {
    Controller, Get, Post, Patch, Delete,
    Param, Body, ParseUUIDPipe,
} from '@nestjs/common';
import {
    ApiTags, ApiBearerAuth, ApiOperation, ApiResponse,
} from '@nestjs/swagger';
import { BankAccountsService } from './bank-accounts.service';
import { CreateBankAccountDto } from './dto/create-bank-account.dto';
import { UpdateBankAccountDto } from './dto/update-bank-account.dto';
import { BankAccountResponseDto } from './dto/bank-account-response.dto';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { JwtPayload } from '../auth/types/jwt-payload.type';

@ApiTags('Bank Accounts')
@ApiBearerAuth()
@Controller('bank-accounts')
export class BankAccountsController {
    constructor(private readonly bankAccountsService: BankAccountsService) {}

    @Post()
    @ApiOperation({ summary: 'Add a new bank account' })
    @ApiResponse({ status: 201, type: BankAccountResponseDto })
    async create(
        @CurrentUser() user: JwtPayload,
        @Body() dto: CreateBankAccountDto,
    ): Promise<BankAccountResponseDto> {
        return this.bankAccountsService.create(user.userId, dto);
    }

    @Get()
    @ApiOperation({ summary: 'Get all bank accounts for current user' })
    @ApiResponse({ status: 200, type: [BankAccountResponseDto] })
    async findAll(@CurrentUser() user: JwtPayload): Promise<BankAccountResponseDto[]> {
        return this.bankAccountsService.findAll(user.userId);
    }

    @Patch(':id')
    @ApiOperation({ summary: 'Update a bank account' })
    @ApiResponse({ status: 200, type: BankAccountResponseDto })
    async update(
        @Param('id', ParseUUIDPipe) id: string,
        @CurrentUser() user: JwtPayload,
        @Body() dto: UpdateBankAccountDto,
    ): Promise<BankAccountResponseDto> {
        return this.bankAccountsService.update(id, user.userId, dto);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Delete a bank account' })
    @ApiResponse({ status: 200, type: BankAccountResponseDto })
    async remove(
        @Param('id', ParseUUIDPipe) id: string,
        @CurrentUser() user: JwtPayload,
    ): Promise<BankAccountResponseDto> {
        return this.bankAccountsService.remove(id, user.userId);
    }
}
