import { Module } from '@nestjs/common';
import { KpoService } from './kpo.service';
import { KpoController } from './kpo.controller';
import { PdfModule } from '../pdf/pdf.module';

@Module({
  imports: [PdfModule],
  providers: [KpoService],
  controllers: [KpoController]
})
export class KpoModule {}
