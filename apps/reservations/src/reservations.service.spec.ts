import { Test, TestingModule } from '@nestjs/testing';
import { ReservationsService } from './reservations.service';
import { ReservationsRepository } from './reservation.repository';
import { PAYMENTS_SERVICE, UserDto } from '@app/common';
import { ClientProxy } from '@nestjs/microservices';
import { of, firstValueFrom } from 'rxjs';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { UpdateReservationDto } from './dto/update-reservation.dto';

describe('ReservationsService', () => {
  let service: ReservationsService;
  let repository: ReservationsRepository;
  let paymentsService: ClientProxy;

  const mockUser: UserDto = {
    _id: 'user_123',
    email: 'test@example.com',
    password: 'password',
  };

  const mockReservation = {
    _id: 'res_123',
    startDate: new Date('2026-09-01'),
    endDate: new Date('2026-09-05'),
    invoiceId: 'inv_123',
    userId: 'user_123',
    timestamp: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReservationsService,
        {
          provide: ReservationsRepository,
          useValue: {
            create: jest.fn().mockResolvedValue(mockReservation),
            find: jest.fn().mockResolvedValue([mockReservation]),
            findOne: jest.fn().mockResolvedValue(mockReservation),
            findOneAndUpdate: jest.fn().mockResolvedValue(mockReservation),
            findOneAndDelete: jest.fn().mockResolvedValue(mockReservation),
          },
        },
        {
          provide: PAYMENTS_SERVICE,
          useValue: {
            send: jest.fn().mockReturnValue(of({ id: 'inv_123' })),
          },
        },
      ],
    }).compile();

    service = module.get<ReservationsService>(ReservationsService);
    repository = module.get<ReservationsRepository>(ReservationsRepository);
    paymentsService = module.get<ClientProxy>(PAYMENTS_SERVICE);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should charge payment and create reservation', async () => {
      const createDto: CreateReservationDto = {
        startDate: new Date('2026-09-01'),
        endDate: new Date('2026-09-05'),
        charge: {
          amount: 300,
          card: {
            cvc: '123',
            exp_month: 12,
            exp_year: 2028,
            number: '4242424242424242',
          },
        },
      };

      const observable = await service.create(createDto, mockUser);
      const result = await firstValueFrom(observable);
      const resolved = await result;

      expect(paymentsService.send).toHaveBeenCalledWith('create_charge', {
        amount: 300,
        card: createDto.charge.card,
        email: mockUser.email,
      });

      expect(repository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          startDate: createDto.startDate,
          endDate: createDto.endDate,
          invoiceId: 'inv_123',
          userId: mockUser._id,
        }),
      );

      expect(resolved).toEqual(mockReservation);
    });
  });

  describe('findAll', () => {
    it('should find all reservations', async () => {
      const result = await service.findAll();
      expect(repository.find).toHaveBeenCalledWith({});
      expect(result).toEqual([mockReservation]);
    });
  });

  describe('findOne', () => {
    it('should find one reservation by id', async () => {
      const result = await service.findOne('res_123');
      expect(repository.findOne).toHaveBeenCalledWith({ _id: 'res_123' });
      expect(result).toEqual(mockReservation);
    });
  });

  describe('update', () => {
    it('should update reservation by id', async () => {
      const updateDto: UpdateReservationDto = { endDate: new Date('2026-09-10') };
      const result = await service.update('res_123', updateDto);
      expect(repository.findOneAndUpdate).toHaveBeenCalledWith(
        { _id: 'res_123' },
        { $set: updateDto },
      );
      expect(result).toEqual(mockReservation);
    });
  });

  describe('remove', () => {
    it('should delete reservation by id', async () => {
      const result = await service.remove('res_123');
      expect(repository.findOneAndDelete).toHaveBeenCalledWith({ _id: 'res_123' });
      expect(result).toEqual(mockReservation);
    });
  });
});
