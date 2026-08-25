import { Test, TestingModule } from '@nestjs/testing';
import { NotificationsService } from './notifications.service';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

jest.mock('nodemailer');

describe('NotificationsService', () => {
  let service: NotificationsService;
  let configService: ConfigService;
  const mockSendMail = jest.fn().mockResolvedValue({ messageId: '123' });

  beforeEach(async () => {
    jest.clearAllMocks();
    (nodemailer.createTransport as jest.Mock).mockReturnValue({
      sendMail: mockSendMail,
    });

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationsService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              const config: Record<string, string> = {
                SMTP_USER: 'test@gmail.com',
                GOOGLE_OAUTH_CLIENT_ID: 'client-id',
                GOOGLE_OAUTH_CLIENT_SECRET: 'client-secret',
                GOOGLE_OAUTH_REFRESH_TOKEN: 'refresh-token',
              };
              return config[key];
            }),
          },
        },
      ],
    }).compile();

    service = module.get<NotificationsService>(NotificationsService);
    configService = module.get<ConfigService>(ConfigService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('notifyEmail', () => {
    it('should send email using nodemailer transporter', async () => {
      const emailDto = {
        email: 'receiver@example.com',
        text: 'Your reservation was confirmed',
      };

      await service.notifyEmail(emailDto);

      expect(mockSendMail).toHaveBeenCalledWith({
        from: 'test@gmail.com',
        to: emailDto.email,
        subject: 'Sleepr Notification',
        text: emailDto.text,
      });
    });
  });
});
