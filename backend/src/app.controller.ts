import { Controller, Get, HttpCode } from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { Public } from './auth/helpers/auth.helpers';

@ApiTags('health')
@Controller('health')
export class AppController {
  // Probed by Docker / load balancers without a token
  @Public()
  @Get()
  @HttpCode(200)
  @ApiOkResponse({
    description: 'Liveness probe',
    schema: { example: { status: 'ok' } },
  })
  health(): { status: string } {
    return { status: 'ok' };
  }
}
