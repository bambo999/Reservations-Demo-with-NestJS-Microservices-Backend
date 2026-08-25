import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { UsersRepository } from './users.repository';
import { NotFoundException, UnauthorizedException, UnprocessableEntityException } from '@nestjs/common';

jest.mock('bcryptjs', () => ({
  hash: jest.fn(),
  compare: jest.fn(),
}));

import * as bcrypt from 'bcryptjs';

describe('UsersService', () => {
  let service: UsersService;
  let repository: UsersRepository;

  const mockUser = {
    _id: 'user_123',
    email: 'test@example.com',
    password: 'hashedPassword',
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: UsersRepository,
          useValue: {
            create: jest.fn().mockResolvedValue(mockUser),
            findOne: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    repository = module.get<UsersRepository>(UsersRepository);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should successfully create a new user when email does not exist', async () => {
      // simulate repository findOne throwing NotFoundException (meaning email is available)
      (repository.findOne as jest.Mock).mockRejectedValue(new NotFoundException());
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashedPassword');

      const result = await service.create({
        email: 'test@example.com',
        password: 'password123',
      });

      expect(repository.findOne).toHaveBeenCalledWith({ email: 'test@example.com' });
      expect(repository.create).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'hashedPassword',
      });
      expect(result).toEqual(mockUser);
    });

    it('should throw UnprocessableEntityException when email already exists', async () => {
      // simulate repository finding an existing user
      (repository.findOne as jest.Mock).mockResolvedValue(mockUser);

      await expect(
        service.create({
          email: 'test@example.com',
          password: 'password123',
        }),
      ).rejects.toThrow(UnprocessableEntityException);
    });
  });

  describe('verifyUser', () => {
    it('should return user if password matches', async () => {
      (repository.findOne as jest.Mock).mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await service.verifyUser('test@example.com', 'password123');

      expect(repository.findOne).toHaveBeenCalledWith({ email: 'test@example.com' });
      expect(bcrypt.compare).toHaveBeenCalledWith('password123', mockUser.password);
      expect(result).toEqual(mockUser);
    });

    it('should throw UnauthorizedException if password does not match', async () => {
      (repository.findOne as jest.Mock).mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(
        service.verifyUser('test@example.com', 'wrongpassword'),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('getUser', () => {
    it('should find and return user by filter', async () => {
      (repository.findOne as jest.Mock).mockResolvedValue(mockUser);

      const result = await service.getUser({ _id: 'user_123' });

      expect(repository.findOne).toHaveBeenCalledWith({ _id: 'user_123' });
      expect(result).toEqual(mockUser);
    });
  });
});
