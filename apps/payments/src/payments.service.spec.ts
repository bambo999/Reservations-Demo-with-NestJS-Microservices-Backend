import { Test, TestingModule } from '@nestjs/testing';
import { PaymentsService } from './payments.service';
import { ConfigService } from '@nestjs/config';
import { NOTIFICATIONS_SERVICE } from '@app/common';
import { ClientProxy } from '@nestjs/microservices';
import { PaymentsCreateChargeDto } from '../dto/payments-create-charge.dto';

const mockPaymentIntent = {
  id: 'pi_test123',
  amount: 20000,
  currency: 'usd',
  status: 'succeeded',
};

const mockCreate = jest.fn().mockResolvedValue(mockPaymentIntent);

jest.mock('stripe', () => {
  return jest.fn().mockImplementation(() => ({
    paymentIntents: {
      create: mockCreate,
    },
  }));
});

describe('PaymentsService', () => {
  let service: PaymentsService;
  let notificationsService: ClientProxy;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PaymentsService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              if (key === 'STRIPE_SECRET_KEY') return 'sk_test_123';
              return null;
            }),
          },
        },
        {
          provide: NOTIFICATIONS_SERVICE,
          useValue: {
            emit: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<PaymentsService>(PaymentsService);
    notificationsService = module.get<ClientProxy>(NOTIFICATIONS_SERVICE);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createCharge', () => {
    it('should create a stripe payment intent and emit notify_email event', async () => {
      const chargeDto: PaymentsCreateChargeDto = {
        amount: 200,
        email: 'customer@example.com',
        card: {
          cvc: '123',
          exp_month: 12,
          exp_year: 2028,
          number: '4242424242424242',
        },
      };

      const result = await service.createCharge(chargeDto);

      expect(mockCreate).toHaveBeenCalledWith({
        amount: 20000,
        confirm: true,
        currency: 'usd',
        payment_method: 'pm_card_visa',
        automatic_payment_methods: {
          enabled: true,
          allow_redirects: 'never',
        },
      });

      expect(notificationsService.emit).toHaveBeenCalledWith('notify_email', {
        email: 'customer@example.com',
        text: 'You payment of $200  was successful',
      });

      expect(result).toEqual(mockPaymentIntent);
    });
  });
});
