import { Test, TestingModule } from '@nestjs/testing';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';
import { PaymentsCreateChargeDto } from '../dto/payments-create-charge.dto';

describe('PaymentsController', () => {
  let paymentsController: PaymentsController;
  let paymentsService: PaymentsService;

  const mockPaymentIntent = {
    id: 'pi_test123',
    amount: 10000,
    status: 'succeeded',
  };

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [PaymentsController],
      providers: [
        {
          provide: PaymentsService,
          useValue: {
            createCharge: jest.fn().mockResolvedValue(mockPaymentIntent),
          },
        },
      ],
    }).compile();

    paymentsController = app.get<PaymentsController>(PaymentsController);
    paymentsService = app.get<PaymentsService>(PaymentsService);
  });

  it('should be defined', () => {
    expect(paymentsController).toBeDefined();
  });

  describe('createCharge', () => {
    it('should delegate createCharge to paymentsService and return the payment intent', async () => {
      const chargeDto: PaymentsCreateChargeDto = {
        amount: 100,
        email: 'user@test.com',
        card: {
          cvc: '123',
          exp_month: 12,
          exp_year: 2028,
          number: '4242424242424242',
        },
      };

      const result = await paymentsController.createCharge(chargeDto);

      expect(paymentsService.createCharge).toHaveBeenCalledWith(chargeDto);
      expect(result).toEqual(mockPaymentIntent);
    });
  });
});
