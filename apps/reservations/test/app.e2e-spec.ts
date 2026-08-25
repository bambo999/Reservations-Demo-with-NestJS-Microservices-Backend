import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { ReservationsController } from '../src/reservations.controller';
import { ReservationsService } from '../src/reservations.service';
import { AUTH_SERVICE, JwtAuthGuard } from '@app/common';

describe('ReservationsController (e2e)', () => {
  let app: INestApplication;

  const mockReservation = {
    _id: 'res_e2e_123',
    startDate: new Date('2026-09-01'),
    endDate: new Date('2026-09-05'),
    invoiceId: 'inv_e2e_123',
    userId: 'user_e2e_123',
    timestamp: new Date(),
  };

  const mockReservationsService = {
    create: jest.fn().mockResolvedValue(mockReservation),
    findAll: jest.fn().mockResolvedValue([mockReservation]),
    findOne: jest.fn().mockResolvedValue(mockReservation),
    update: jest.fn().mockResolvedValue({ ...mockReservation, endDate: new Date('2026-09-10') }),
    remove: jest.fn().mockResolvedValue(mockReservation),
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [ReservationsController],
      providers: [
        {
          provide: ReservationsService,
          useValue: mockReservationsService,
        },
        {
          provide: AUTH_SERVICE,
          useValue: {},
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /reservations', () => {
    it('should create a new reservation', () => {
      return request(app.getHttpServer())
        .post('/reservations')
        .send({
          startDate: '2026-09-01',
          endDate: '2026-09-05',
          charge: {
            amount: 500,
            card: {
              cvc: '123',
              exp_month: 12,
              exp_year: 2028,
              number: '4242424242424242',
            },
          },
        })
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('_id');
          expect(mockReservationsService.create).toHaveBeenCalled();
        });
    });
  });

  describe('GET /reservations', () => {
    it('should return all reservations', () => {
      return request(app.getHttpServer())
        .get('/reservations')
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
          expect(mockReservationsService.findAll).toHaveBeenCalled();
        });
    });
  });

  describe('GET /reservations/:id', () => {
    it('should return a single reservation', () => {
      return request(app.getHttpServer())
        .get('/reservations/res_e2e_123')
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('_id', 'res_e2e_123');
          expect(mockReservationsService.findOne).toHaveBeenCalledWith('res_e2e_123');
        });
    });
  });

  describe('PATCH /reservations/:id', () => {
    it('should update a reservation', () => {
      return request(app.getHttpServer())
        .patch('/reservations/res_e2e_123')
        .send({ endDate: '2026-09-10' })
        .expect(200)
        .expect((res) => {
          expect(mockReservationsService.update).toHaveBeenCalled();
        });
    });
  });

  describe('DELETE /reservations/:id', () => {
    it('should delete a reservation', () => {
      return request(app.getHttpServer())
        .delete('/reservations/res_e2e_123')
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('_id', 'res_e2e_123');
          expect(mockReservationsService.remove).toHaveBeenCalledWith('res_e2e_123');
        });
    });
  });
});
