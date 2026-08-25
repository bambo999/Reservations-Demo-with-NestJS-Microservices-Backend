import { Logger, NotFoundException } from '@nestjs/common';
import { AbstractRepository } from './abstract.repository';
import { AbstractDocument } from './abstract.schema';
import { Model, Types } from 'mongoose';

class TestDocument extends AbstractDocument {
  name: string;
}

class TestRepository extends AbstractRepository<TestDocument> {
  protected readonly logger = new Logger(TestRepository.name);

  constructor(model: Model<TestDocument>) {
    super(model);
  }
}

describe('AbstractRepository', () => {
  let repository: TestRepository;
  let mockModel: any;

  const mockDoc = {
    _id: new Types.ObjectId(),
    name: 'test_item',
  };

  beforeEach(() => {
    mockModel = jest.fn().mockImplementation((dto) => ({
      ...dto,
      save: jest.fn().mockResolvedValue({
        toJSON: () => ({ ...dto, _id: dto._id }),
      }),
    }));

    mockModel.findOne = jest.fn();
    mockModel.findOneAndUpdate = jest.fn();
    mockModel.find = jest.fn();
    mockModel.findOneAndDelete = jest.fn();

    repository = new TestRepository(mockModel as unknown as Model<TestDocument>);
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });

  describe('create', () => {
    it('should create and save a new document', async () => {
      const result = await repository.create({ name: 'test_item' } as any);
      expect(result.name).toBe('test_item');
      expect(result._id).toBeDefined();
    });
  });

  describe('findOne', () => {
    it('should return document if found', async () => {
      mockModel.findOne.mockReturnValue({
        lean: jest.fn().mockResolvedValue(mockDoc),
      });

      const result = await repository.findOne({ name: 'test_item' });
      expect(result).toEqual(mockDoc);
    });

    it('should throw NotFoundException if document not found', async () => {
      mockModel.findOne.mockReturnValue({
        lean: jest.fn().mockResolvedValue(null),
      });

      await expect(repository.findOne({ name: 'missing' })).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('findOneAndUpdate', () => {
    it('should update and return document', async () => {
      const updatedDoc = { ...mockDoc, name: 'updated_name' };
      mockModel.findOneAndUpdate.mockReturnValue({
        lean: jest.fn().mockResolvedValue(updatedDoc),
      });

      const result = await repository.findOneAndUpdate(
        { _id: mockDoc._id },
        { $set: { name: 'updated_name' } },
      );
      expect(result).toEqual(updatedDoc);
    });

    it('should throw NotFoundException if document to update is not found', async () => {
      mockModel.findOneAndUpdate.mockReturnValue({
        lean: jest.fn().mockResolvedValue(null),
      });

      await expect(
        repository.findOneAndUpdate(
          { _id: mockDoc._id },
          { $set: { name: 'updated' } },
        ),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('find', () => {
    it('should return an array of documents', async () => {
      mockModel.find.mockReturnValue({
        lean: jest.fn().mockResolvedValue([mockDoc]),
      });

      const result = await repository.find({});
      expect(result).toEqual([mockDoc]);
    });
  });

  describe('findOneAndDelete', () => {
    it('should delete and return document', async () => {
      mockModel.findOneAndDelete.mockReturnValue({
        lean: jest.fn().mockResolvedValue(mockDoc),
      });

      const result = await repository.findOneAndDelete({ _id: mockDoc._id });
      expect(result).toEqual(mockDoc);
    });

    it('should throw NotFoundException if document to delete is not found', async () => {
      mockModel.findOneAndDelete.mockReturnValue({
        lean: jest.fn().mockResolvedValue(null),
      });

      await expect(
        repository.findOneAndDelete({ _id: mockDoc._id }),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
