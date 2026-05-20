import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { getModelToken } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { VersionsService } from './versions.service';
import { ScriptVersion } from './schemas/script-version.schema';
import { AnalysisResult } from './analysis.service';

const mockAnalysis: AnalysisResult = {
  trustScore: 90,
  risks: [],
  warnings: [],
  safePatterns: ['Has proper shebang line'],
  analyzedAt: new Date('2024-01-01'),
};

const scriptId = new Types.ObjectId().toString();

const makeVersion = (override: Record<string, unknown> = {}) => ({
  _id: new Types.ObjectId(),
  scriptId: new Types.ObjectId(scriptId),
  versionNumber: 1,
  content: '#!/bin/bash\nset -e\necho "hello"',
  analysis: mockAnalysis,
  createdAt: new Date('2024-01-01'),
  ...override,
});

describe('VersionsService', () => {
  let service: VersionsService;

  const saveMock = jest.fn();
  const mockModel: Record<string, jest.Mock> = {
    find: jest.fn(),
    findOne: jest.fn(),
    deleteMany: jest.fn(),
  };

  // Simulate `new Model(data)` returning an object with `.save()`
  const ModelConstructor = jest.fn().mockImplementation(() => ({ save: saveMock }));
  Object.assign(ModelConstructor, mockModel);

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        VersionsService,
        { provide: getModelToken(ScriptVersion.name), useValue: ModelConstructor },
      ],
    }).compile();

    service = module.get<VersionsService>(VersionsService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('returns versions sorted by number', async () => {
      const versions = [makeVersion(), makeVersion({ versionNumber: 2 })];
      mockModel.find.mockReturnValue({ sort: () => ({ exec: jest.fn().mockResolvedValue(versions) }) });

      const result = await service.findAll(scriptId);

      expect(result).toHaveLength(2);
      expect(mockModel.find).toHaveBeenCalledWith({ scriptId: expect.any(Types.ObjectId) });
    });

    it('returns empty array when no versions exist', async () => {
      mockModel.find.mockReturnValue({ sort: () => ({ exec: jest.fn().mockResolvedValue([]) }) });

      expect(await service.findAll(scriptId)).toEqual([]);
    });
  });

  describe('findByNumber', () => {
    it('returns the requested version', async () => {
      const version = makeVersion();
      mockModel.findOne.mockReturnValue({ exec: jest.fn().mockResolvedValue(version) });

      const result = await service.findByNumber(scriptId, 1);

      expect(result.versionNumber).toBe(1);
    });

    it('throws NotFoundException when version does not exist', async () => {
      mockModel.findOne.mockReturnValue({ exec: jest.fn().mockResolvedValue(null) });

      await expect(service.findByNumber(scriptId, 99)).rejects.toThrow(NotFoundException);
    });
  });

  describe('findLatest', () => {
    it('returns the latest version document', async () => {
      const version = makeVersion({ versionNumber: 3 });
      mockModel.findOne.mockReturnValue({ sort: () => ({ exec: jest.fn().mockResolvedValue(version) }) });

      const result = await service.findLatest(scriptId);

      expect(result).toEqual(version);
    });
  });

  describe('create', () => {
    it('saves a new version and returns the document', async () => {
      const saved = makeVersion();
      saveMock.mockResolvedValue(saved);

      const result = await service.create(scriptId, 1, saved.content, mockAnalysis);

      expect(saveMock).toHaveBeenCalled();
      expect(result).toEqual(saved);
    });
  });

  describe('deleteAllForScript', () => {
    it('deletes all versions for a script', async () => {
      mockModel.deleteMany.mockReturnValue({ exec: jest.fn().mockResolvedValue({ deletedCount: 2 }) });

      await service.deleteAllForScript(scriptId);

      expect(mockModel.deleteMany).toHaveBeenCalledWith({ scriptId: expect.any(Types.ObjectId) });
    });
  });
});
