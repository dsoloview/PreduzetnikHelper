import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { LimitsService } from './limits.service';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { JwtPayload } from '../auth/types/jwt-payload.type';
import { ILimitsResponse } from '@preduzetnik/shared';

@ApiTags('Limits')
@ApiBearerAuth()
@Controller('limits')
export class LimitsController {
    constructor(private readonly limitsService: LimitsService) {}

    @Get()
    @ApiOperation({ summary: 'Get current status of 6M (Paušal) and 8M (VAT) limits' })
    @ApiResponse({ status: 200, description: 'Limits retrieved successfully' })
    async getLimits(@CurrentUser() user: JwtPayload): Promise<ILimitsResponse> {
        return this.limitsService.getLimits(user.userId);
    }
}
