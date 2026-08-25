import { Test, TestingModule } from '@nestjs/testing';
import { NotificationsController } from '../src/notifications.controller';
import { NotificationsService } from '../src/notifications.service';
import { NotifyEmailDto } from '../src/dto/notify-email.dto';

describe('NotificationsController (e2e)', () => {
  let controller: NotificationsController;
  let service: NotificationsService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [NotificationsController],
      providers: [
        {
          provide: NotificationsService,
          useValue: {
            notifyEmail: jest.fn().mockResolvedValue(undefined),
          },
        },
      ],
    }).compile();

    controller = moduleFixture.get<NotificationsController>(NotificationsController);
    service = moduleFixture.get<NotificationsService>(NotificationsService);
  });

  describe('notify_email event pattern', () => {
    it('should receive email notification payload and dispatch email', async () => {
      const emailPayload: NotifyEmailDto = {
        email: 'receiver@example.com',
        text: 'Your reservation has been confirmed',
      };

      await controller.notifyEmail(emailPayload);

      expect(service.notifyEmail).toHaveBeenCalledWith(emailPayload);
    });
  });
});
