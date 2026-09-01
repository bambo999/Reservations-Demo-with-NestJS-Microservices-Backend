import { Test, TestingModule } from '@nestjs/testing';
import { ReservationsController } from './reservations.controller';
import { ReservationsService } from './reservations.service';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { UpdateReservationDto } from './dto/update-reservation.dto';
import { AUTH_SERVICE, JwtAuthGuard, UserDto } from '@app/common';

describe('ReservationsController', () => {
  let controller: ReservationsController;
  let service: ReservationsService;

  const mockUser: UserDto = {
    id: 1,
    email: 'test@example.com',
    password: 'hashedpassword',
  };

  const mockReservation = {
    id: 1,
    startDate: new Date('2026-09-01'),
    endDate: new Date('2026-09-05'),
    invoiceId: 'inv123',
    userId: 1,
    timestamp: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ReservationsController],
      providers: [
        {
          provide: ReservationsService,
          useValue: {
            create: jest.fn().mockResolvedValue(mockReservation),
            findAll: jest.fn().mockResolvedValue([mockReservation]),
            findOne: jest.fn().mockResolvedValue(mockReservation),
            update: jest.fn().mockResolvedValue({ ...mockReservation, endDate: new Date('2026-09-10') }),
            remove: jest.fn().mockResolvedValue(mockReservation),
          },
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

    controller = module.get<ReservationsController>(ReservationsController);
    service = module.get<ReservationsService>(ReservationsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a reservation for current user', async () => {
      const createDto: CreateReservationDto = {
        startDate: new Date('2026-09-01'),
        endDate: new Date('2026-09-05'),
        charge: {
          amount: 500,
          card: {
            cvc: '123',
            exp_month: 12,
            exp_year: 2028,
            number: '4242424242424242',
          },
        },
      };

      const result = await controller.create(createDto, mockUser);
      expect(service.create).toHaveBeenCalledWith(createDto, mockUser);
      expect(result).toEqual(mockReservation);
    });
  });

  describe('findAll', () => {
    it('should return an array of reservations', async () => {
      const result = await controller.findAll();
      expect(service.findAll).toHaveBeenCalled();
      expect(result).toEqual([mockReservation]);
    });
  });

  describe('findOne', () => {
    it('should return a single reservation by id', async () => {
      const result = await controller.findOne('1');
      expect(service.findOne).toHaveBeenCalledWith(1);
      expect(result).toEqual(mockReservation);
    });
  });

  describe('update', () => {
    it('should update and return the reservation', async () => {
      const updateDto: UpdateReservationDto = { endDate: new Date('2026-09-10') };
      const result = await controller.update('1', updateDto);
      expect(service.update).toHaveBeenCalledWith(1, updateDto);
      expect(result).toEqual({ ...mockReservation, endDate: new Date('2026-09-10') });
    });
  });

  describe('remove', () => {
    it('should delete and return the reservation', async () => {
      const result = await controller.remove('1');
      expect(service.remove).toHaveBeenCalledWith(1);
      expect(result).toEqual(mockReservation);
    });
  });
});
