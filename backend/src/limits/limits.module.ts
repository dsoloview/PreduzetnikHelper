import { Module } from '@nestjs/common';
import { LimitsService } from './limits.service';
import { LimitsController } from './limits.controller';

@Module({
  providers: [LimitsService],
  controllers: [LimitsController]
})
export class LimitsModule {}
