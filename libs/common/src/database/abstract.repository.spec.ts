import { Logger, NotFoundException } from '@nestjs/common';
import { AbstractRepository } from './abstract.repository';
import { AbstractEntity } from './abstract.entity';
import { EntityManager, Repository } from 'typeorm';

class TestEntity extends AbstractEntity<TestEntity> {
  name: string;
}

class TestRepository extends AbstractRepository<TestEntity> {
  protected readonly logger = new Logger(TestRepository.name);

  constructor(
    entityRepository: Repository<TestEntity>,
    entityManager: EntityManager,
  ) {
    super(entityRepository, entityManager);
  }
}

describe('AbstractRepository', () => {
  let repository: TestRepository;
  let mockEntityRepository: Partial<Repository<TestEntity>>;
  let mockEntityManager: Partial<EntityManager>;

  const mockEntity: TestEntity = new TestEntity({
    id: 1,
    name: 'test_item',
  });

  beforeEach(() => {
    mockEntityRepository = {
      findOne: jest.fn(),
      update: jest.fn(),
      find: jest.fn(),
      delete: jest.fn(),
    };

    mockEntityManager = {
      save: jest.fn().mockResolvedValue(mockEntity),
    };

    repository = new TestRepository(
      mockEntityRepository as Repository<TestEntity>,
      mockEntityManager as EntityManager,
    );
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });

  describe('create', () => {
    it('should create and save a new entity', async () => {
      const result = await repository.create(mockEntity);
      expect(mockEntityManager.save).toHaveBeenCalledWith(mockEntity);
      expect(result).toEqual(mockEntity);
    });
  });

  describe('findOne', () => {
    it('should return entity if found', async () => {
      (mockEntityRepository.findOne as jest.Mock).mockResolvedValue(mockEntity);

      const result = await repository.findOne({ id: 1 });
      expect(mockEntityRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
        relations: undefined,
      });
      expect(result).toEqual(mockEntity);
    });

    it('should throw NotFoundException if entity not found', async () => {
      (mockEntityRepository.findOne as jest.Mock).mockResolvedValue(null);

      await expect(repository.findOne({ id: 999 })).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('findOneAndUpdate', () => {
    it('should update and return entity', async () => {
      (mockEntityRepository.update as jest.Mock).mockResolvedValue({ affected: 1 });
      (mockEntityRepository.findOne as jest.Mock).mockResolvedValue(mockEntity);

      const result = await repository.findOneAndUpdate(
        { id: 1 },
        { name: 'updated_name' },
      );
      expect(mockEntityRepository.update).toHaveBeenCalledWith(
        { id: 1 },
        { name: 'updated_name' },
      );
      expect(result).toEqual(mockEntity);
    });

    it('should throw NotFoundException if entity to update is not found', async () => {
      (mockEntityRepository.update as jest.Mock).mockResolvedValue({ affected: 0 });

      await expect(
        repository.findOneAndUpdate({ id: 999 }, { name: 'updated' }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('find', () => {
    it('should return an array of entities', async () => {
      (mockEntityRepository.find as jest.Mock).mockResolvedValue([mockEntity]);

      const result = await repository.find({});
      expect(mockEntityRepository.find).toHaveBeenCalledWith({
        where: {},
        relations: undefined,
      });
      expect(result).toEqual([mockEntity]);
    });
  });

  describe('findOneAndDelete', () => {
    it('should delete entity', async () => {
      (mockEntityRepository.delete as jest.Mock).mockResolvedValue({ affected: 1 });

      await repository.findOneAndDelete({ id: 1 });
      expect(mockEntityRepository.delete).toHaveBeenCalledWith({ id: 1 });
    });
  });
});

