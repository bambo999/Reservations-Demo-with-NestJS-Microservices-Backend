import { Controller, UsePipes, ValidationPipe } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import {
  PaymentsServiceController,
  PaymentsServiceControllerMethods,
} from '@app/common';
import { PaymentsCreateChargeDto } from '../dto/payments-create-charge.dto';

@Controller()
@PaymentsServiceControllerMethods()
export class PaymentsController implements PaymentsServiceController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @UsePipes(new ValidationPipe())
  async createCharge(data: PaymentsCreateChargeDto) {
    return this.paymentsService.createCharge(data);
  }
}
