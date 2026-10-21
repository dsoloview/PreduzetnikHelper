import { PartialType } from '@nestjs/swagger';
import { IUpdateTaxObligationRequest } from '@preduzetnik/shared';
import { CreateTaxObligationDto } from './create-tax-obligation.dto';

export class UpdateTaxObligationDto
  extends PartialType(CreateTaxObligationDto)
  implements IUpdateTaxObligationRequest {}
