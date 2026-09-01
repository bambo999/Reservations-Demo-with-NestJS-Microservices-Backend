import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Response } from 'express';
import { User } from './users/model/user.entity';

describe('AuthService', () => {
  let service: AuthService;
  let jwtService: JwtService;

  const mockUser = {
    id: 1,
    email: 'test@example.com',
  } as User;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              if (key === 'JWT_EXPIRATION') return 3600;
              return null;
            }),
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn().mockReturnValue('signed_jwt_token'),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    jwtService = module.get<JwtService>(JwtService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('login', () => {
    it('should sign jwt and set Authentication cookie on response', async () => {
      const mockResponse = {
        cookie: jest.fn(),
      } as unknown as Response;

      await service.login(mockUser, mockResponse);

      expect(jwtService.sign).toHaveBeenCalledWith({
        userId: 1,
      });

      expect(mockResponse.cookie).toHaveBeenCalledWith(
        'Authentication',
        'signed_jwt_token',
        expect.objectContaining({
          httpOnly: true,
          expires: expect.any(Date),
        }),
      );
    });
  });
});
