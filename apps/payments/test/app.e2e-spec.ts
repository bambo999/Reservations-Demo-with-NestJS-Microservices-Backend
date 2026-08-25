import { Test, TestingModule } from '@nestjs/testing';
import { PaymentsController } from '../src/payments.controller';
import { PaymentsService } from '../src/payments.service';
import { PaymentsCreateChargeDto } from '../dto/payments-create-charge.dto';

describe('PaymentsController (e2e)', () => {
  let controller: PaymentsController;
  let service: PaymentsService;

  const mockPaymentIntent = {
    id: 'pi_e2e_123',
    amount: 50000,
    currency: 'usd',
    status: 'succeeded',
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
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

    controller = moduleFixture.get<PaymentsController>(PaymentsController);
    service = moduleFixture.get<PaymentsService>(PaymentsService);
  });

  describe('create_charge message pattern', () => {
    it('should process payment charge and return payment intent', async () => {
      const chargeDto: PaymentsCreateChargeDto = {
        amount: 500,
        email: 'payer@example.com',
        card: {
          cvc: '123',
          exp_month: 12,
          exp_year: 2028,
          number: '4242424242424242',
        },
      };

      const result = await controller.createCharge(chargeDto);

      expect(service.createCharge).toHaveBeenCalledWith(chargeDto);
      expect(result).toEqual(mockPaymentIntent);
    });
  });
});
