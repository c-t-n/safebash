import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ScriptsService } from './scripts.service';
import { CreateScriptDto } from './dto/create-script.dto';
import { Script, ScriptDocument } from './schemas/script.schema';

describe('ScriptsService', () => {
  let service: ScriptsService;
  let model: Model<ScriptDocument>;

  const mockScript = (override = {}) => ({
    _id: '507f1f77bcf86cd799439011',
    name: 'Test Script',
    content: '#!/bin/bash\necho "Hello World"',
    description: 'A test script',
    createdAt: new Date(),
    updatedAt: new Date(),
    ...override,
  });

  const mockModel = {
    new: jest.fn(),
    constructor: jest.fn(),
    find: jest.fn(),
    findById: jest.fn(),
    findByIdAndDelete: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    exec: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ScriptsService,
        {
          provide: getModelToken(Script.name),
          useValue: mockModel,
        },
      ],
    }).compile();

    service = module.get<ScriptsService>(ScriptsService);
    model = module.get<Model<ScriptDocument>>(getModelToken(Script.name));
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new script', async () => {
      const createDto: CreateScriptDto = {
        name: 'Test Script',
        content: '#!/bin/bash\necho "Hello World"',
        description: 'A test script',
      };

      const savedScript = mockScript();
      const saveMock = jest.fn().mockResolvedValue(savedScript);

      jest.spyOn(model, 'constructor' as any).mockImplementation(() => ({
        save: saveMock,
      }));

      // Mock the model constructor to return an object with a save method
      (mockModel as any).mockImplementation(() => ({
        save: saveMock,
      }));

      const result = await service.create(createDto);

      expect(result).toBeDefined();
      expect(result.name).toBe(savedScript.name);
      expect(result.content).toBe(savedScript.content);
    });
  });

  describe('findAll', () => {
    it('should return an array of scripts', async () => {
      const scripts = [mockScript(), mockScript({ _id: 'another-id', name: 'Another Script' })];

      mockModel.find.mockReturnValue({
        exec: jest.fn().mockResolvedValue(scripts),
      });

      const result = await service.findAll();

      expect(result).toHaveLength(2);
      expect(mockModel.find).toHaveBeenCalled();
    });

    it('should return empty array when no scripts exist', async () => {
      mockModel.find.mockReturnValue({
        exec: jest.fn().mockResolvedValue([]),
      });

      const result = await service.findAll();

      expect(result).toEqual([]);
    });
  });

  describe('findOne', () => {
    it('should return a script by ID', async () => {
      const script = mockScript();

      mockModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(script),
      });

      const result = await service.findOne(script._id);

      expect(result).toBeDefined();
      expect(result.id).toBe(script._id);
      expect(mockModel.findById).toHaveBeenCalledWith(script._id);
    });

    it('should throw NotFoundException for non-existent ID', async () => {
      mockModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      await expect(service.findOne('non-existent-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('delete', () => {
    it('should delete a script by ID', async () => {
      const script = mockScript();

      mockModel.findByIdAndDelete.mockReturnValue({
        exec: jest.fn().mockResolvedValue(script),
      });

      await service.delete(script._id);

      expect(mockModel.findByIdAndDelete).toHaveBeenCalledWith(script._id);
    });

    it('should throw NotFoundException when deleting non-existent script', async () => {
      mockModel.findByIdAndDelete.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      await expect(service.delete('non-existent-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
