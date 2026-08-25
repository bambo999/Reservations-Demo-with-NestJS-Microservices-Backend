import { Test, TestingModule } from '@nestjs/testing';
import { NotificationsController } from './notifications.controller';
import { NotificationsService } from './notifications.service';
import { NotifyEmailDto } from './dto/notify-email.dto';

describe('NotificationsController', () => {
  let notificationsController: NotificationsController;
  let notificationsService: NotificationsService;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [NotificationsController],
      providers: [
        {
          provide: NotificationsService,
          useValue: {
            notifyEmail: jest.fn(),
          },
        },
      ],
    }).compile();

    notificationsController = app.get<NotificationsController>(NotificationsController);
    notificationsService = app.get<NotificationsService>(NotificationsService);
  });

  it('should be defined', () => {
    expect(notificationsController).toBeDefined();
  });

  describe('notifyEmail', () => {
    it('should call notificationsService.notifyEmail with payload', async () => {
      const notifyEmailDto: NotifyEmailDto = {
        email: 'test@example.com',
        text: 'Payment successful',
      };

      await notificationsController.notifyEmail(notifyEmailDto);

      expect(notificationsService.notifyEmail).toHaveBeenCalledWith(notifyEmailDto);
    });
  });
});
