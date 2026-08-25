import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import cookieParser from 'cookie-parser';
import { AuthController } from '../src/auth.controller';
import { AuthService } from '../src/auth.service';
import { UsersController } from '../src/users/users.controller';
import { UsersService } from '../src/users/users.service';
import { LocalAuthGuard } from '../src/guards/local-auth.guard';
import { JwtAuthGuard } from '../src/guards/jwt-auth.guard';
import { Response } from 'express';

describe('AuthController & UsersController (e2e)', () => {
  let app: INestApplication;

  const mockUser = {
    _id: 'user_e2e_123',
    email: 'e2e@example.com',
    password: 'hashedPassword',
  };

  const mockUsersService = {
    create: jest.fn().mockResolvedValue(mockUser),
    getUser: jest.fn().mockResolvedValue(mockUser),
    verifyUser: jest.fn().mockResolvedValue(mockUser),
  };

  const mockAuthService = {
    login: jest.fn(async (user, response: Response) => {
      response.cookie('Authentication', 'mock_jwt_token', {
        httpOnly: true,
      });
    }),
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [AuthController, UsersController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
      ],
    })
      .overrideGuard(LocalAuthGuard)
      .useValue({
        canActivate: (context: any) => {
          context.switchToHttp().getRequest().user = mockUser;
          return true;
        },
      })
      .overrideGuard(JwtAuthGuard)
      .useValue({
        canActivate: (context: any) => {
          context.switchToHttp().getRequest().user = mockUser;
          return true;
        },
      })
      .compile();

    app = moduleFixture.createNestApplication();
    app.use(cookieParser());
    app.useGlobalPipes(new ValidationPipe());
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /users (Registration)', () => {
    it('should register a new user', () => {
      return request(app.getHttpServer())
        .post('/users')
        .send({
          email: 'e2e@example.com',
          password: 'Password123!',
        })
        .expect(201)
        .expect((res) => {
          expect(res.body).toEqual(mockUser);
          expect(mockUsersService.create).toHaveBeenCalledWith({
            email: 'e2e@example.com',
            password: 'Password123!',
          });
        });
    });
  });

  describe('POST /auth/login (Login & Cookie Setting)', () => {
    it('should authenticate user and set Authentication cookie', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'e2e@example.com',
          password: 'Password123!',
        })
        .expect(201);

      expect(res.headers['set-cookie']).toBeDefined();
      expect(res.headers['set-cookie'][0]).toContain('Authentication=mock_jwt_token');
      expect(res.body).toEqual(mockUser);
    });
  });

  describe('GET /users (Get Authenticated User)', () => {
    it('should return authenticated user profile', () => {
      return request(app.getHttpServer())
        .get('/users')
        .set('Cookie', ['Authentication=mock_jwt_token'])
        .expect(200)
        .expect((res) => {
          expect(res.body).toEqual(mockUser);
        });
    });
  });
});
