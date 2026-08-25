import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { Response } from 'express';
import { UserDocument } from './users/model/user.schema';

describe('AuthController', () => {
  let authController: AuthController;
  let authService: AuthService;

  const mockUser = {
    _id: 'user_123',
    email: 'test@example.com',
    password: 'hashedPassword',
  } as unknown as UserDocument;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: {
            login: jest.fn().mockResolvedValue(undefined),
          },
        },
      ],
    }).compile();

    authController = app.get<AuthController>(AuthController);
    authService = app.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(authController).toBeDefined();
  });

  describe('login', () => {
    it('should call authService.login and send user in response', async () => {
      const mockResponse = {
        send: jest.fn(),
      } as unknown as Response;

      await authController.login(mockUser, mockResponse);

      expect(authService.login).toHaveBeenCalledWith(mockUser, mockResponse);
      expect(mockResponse.send).toHaveBeenCalledWith(mockUser);
    });
  });

  describe('authenticate', () => {
    it('should return user from payload data', async () => {
      const data = { user: mockUser, Authentication: 'some_jwt' };
      const result = await authController.authenticate(data);
      expect(result).toEqual(mockUser);
    });
  });
});
