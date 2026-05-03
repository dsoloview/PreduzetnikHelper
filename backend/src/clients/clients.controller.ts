import {
    Controller, Get, Post, Patch, Delete,
    Param, Body, ParseUUIDPipe,
} from '@nestjs/common';
import {
    ApiTags, ApiBearerAuth, ApiOperation, ApiResponse,
} from '@nestjs/swagger';
import { ClientsService } from './clients.service';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';
import { ClientResponseDto } from './dto/client-response.dto';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { JwtPayload } from '../auth/types/jwt-payload.type';

@ApiTags('Clients')
@ApiBearerAuth()
@Controller('clients')
export class ClientsController {
    constructor(private readonly clientsService: ClientsService) {}

    @Post()
    @ApiOperation({ summary: 'Create a new client' })
    @ApiResponse({ status: 201, type: ClientResponseDto })
    async create(
        @CurrentUser() user: JwtPayload,
        @Body() dto: CreateClientDto,
    ): Promise<ClientResponseDto> {
        return this.clientsService.create(user.userId, dto);
    }

    @Get()
    @ApiOperation({ summary: 'Get all clients for current user' })
    @ApiResponse({ status: 200, type: [ClientResponseDto] })
    async findAll(@CurrentUser() user: JwtPayload): Promise<ClientResponseDto[]> {
        return this.clientsService.findAll(user.userId);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get a client by ID' })
    @ApiResponse({ status: 200, type: ClientResponseDto })
    async findOne(
        @Param('id', ParseUUIDPipe) id: string,
        @CurrentUser() user: JwtPayload,
    ): Promise<ClientResponseDto> {
        return this.clientsService.findOne(id, user.userId);
    }

    @Patch(':id')
    @ApiOperation({ summary: 'Update a client' })
    @ApiResponse({ status: 200, type: ClientResponseDto })
    async update(
        @Param('id', ParseUUIDPipe) id: string,
        @CurrentUser() user: JwtPayload,
        @Body() dto: UpdateClientDto,
    ): Promise<ClientResponseDto> {
        return this.clientsService.update(id, user.userId, dto);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Delete a client' })
    @ApiResponse({ status: 200, type: ClientResponseDto })
    async remove(
        @Param('id', ParseUUIDPipe) id: string,
        @CurrentUser() user: JwtPayload,
    ): Promise<ClientResponseDto> {
        return this.clientsService.remove(id, user.userId);
    }
}
