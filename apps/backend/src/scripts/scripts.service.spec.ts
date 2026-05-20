import { Test, TestingModule } from '@nestjs/testing';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { getModelToken } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { ScriptsService } from './scripts.service';
import { VersionsService } from './versions.service';
import { AnalysisService, AnalysisResult } from './analysis.service';
import { Script } from './schemas/script.schema';

const mockAnalysis: AnalysisResult = {
  trustScore: 85,
  risks: [],
  warnings: ['Uses sudo for elevated privileges'],
  safePatterns: ['Has proper shebang line', 'Exits on command failure (set -e)'],
  analyzedAt: new Date('2024-01-01'),
};

const scriptId = new Types.ObjectId().toString();
const ownerId = new Types.ObjectId().toString();
const otherUserId = new Types.ObjectId().toString();

const makeScriptDoc = (override: Record<string, unknown> = {}) => ({
  _id: { toString: () => scriptId },
  ownerId: { toString: () => ownerId },
  name: 'Test Script',
  description: 'A test script',
  url: undefined,
  currentVersionNumber: 1,
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
  save: jest.fn().mockResolvedValue(undefined),
  ...override,
});

const makeVersionDoc = (override: Record<string, unknown> = {}) => ({
  _id: new Types.ObjectId(),
  scriptId: new Types.ObjectId(scriptId),
  versionNumber: 1,
  content: '#!/bin/bash\nset -e\nsudo apt-get install curl',
  analysis: mockAnalysis,
  createdAt: new Date('2024-01-01'),
  ...override,
});

describe('ScriptsService', () => {
  let service: ScriptsService;
  let versionsService: jest.Mocked<VersionsService>;
  let analysisService: jest.Mocked<AnalysisService>;

  const saveMock = jest.fn();
  const mockScriptModel: Record<string, jest.Mock> = {
    find: jest.fn(),
    findById: jest.fn(),
    findByIdAndDelete: jest.fn(),
  };

  const ScriptModelConstructor = jest
    .fn()
    .mockImplementation(() => ({ save: saveMock }));
  Object.assign(ScriptModelConstructor, mockScriptModel);

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ScriptsService,
        { provide: getModelToken(Script.name), useValue: ScriptModelConstructor },
        {
          provide: VersionsService,
          useValue: {
            findAll: jest.fn(),
            findByNumber: jest.fn(),
            findLatest: jest.fn(),
            create: jest.fn(),
            deleteAllForScript: jest.fn(),
          },
        },
        {
          provide: AnalysisService,
          useValue: { analyze: jest.fn(), analyzeFromUrl: jest.fn() },
        },
      ],
    }).compile();

    service = module.get<ScriptsService>(ScriptsService);
    versionsService = module.get(VersionsService);
    analysisService = module.get(AnalysisService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('returns a list of script summaries with ownerId', async () => {
      const docs = [makeScriptDoc(), makeScriptDoc({ _id: { toString: () => 'other-id' } })];
      mockScriptModel.find.mockReturnValue({ exec: jest.fn().mockResolvedValue(docs) });

      const result = await service.findAll();

      expect(result).toHaveLength(2);
      expect(result[0].ownerId).toBe(ownerId);
      expect(result[0].latestVersion).toBeUndefined();
    });
  });

  describe('findOne', () => {
    it('returns the script with ownerId and latest version attached', async () => {
      const doc = makeScriptDoc();
      const version = makeVersionDoc();
      mockScriptModel.findById.mockReturnValue({ exec: jest.fn().mockResolvedValue(doc) });
      versionsService.findLatest.mockResolvedValue(version as any);

      const result = await service.findOne(scriptId);

      expect(result.id).toBe(scriptId);
      expect(result.ownerId).toBe(ownerId);
      expect(result.latestVersion?.versionNumber).toBe(1);
    });

    it('throws NotFoundException when script does not exist', async () => {
      mockScriptModel.findById.mockReturnValue({ exec: jest.fn().mockResolvedValue(null) });

      await expect(service.findOne('bad-id')).rejects.toThrow(NotFoundException);
    });
  });

  describe('getRawContent', () => {
    it('returns the raw content of the latest version', async () => {
      const doc = makeScriptDoc();
      const version = makeVersionDoc();
      mockScriptModel.findById.mockReturnValue({ exec: jest.fn().mockResolvedValue(doc) });
      versionsService.findLatest.mockResolvedValue(version as any);

      expect(await service.getRawContent(scriptId)).toBe(version.content);
    });

    it('throws NotFoundException when script has no versions', async () => {
      const doc = makeScriptDoc();
      mockScriptModel.findById.mockReturnValue({ exec: jest.fn().mockResolvedValue(doc) });
      versionsService.findLatest.mockResolvedValue(null);

      await expect(service.getRawContent(scriptId)).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('creates a script with the given ownerId and returns version 1', async () => {
      const doc = makeScriptDoc();
      const version = makeVersionDoc();
      saveMock.mockResolvedValue(doc);
      analysisService.analyze.mockReturnValue(mockAnalysis);
      versionsService.create.mockResolvedValue(version as any);
      versionsService.findLatest.mockResolvedValue(version as any);

      const result = await service.create(
        { name: 'Test Script', content: '#!/bin/bash\nset -e\nsudo apt-get install curl' },
        ownerId,
      );

      expect(versionsService.create).toHaveBeenCalledWith(
        scriptId,
        1,
        '#!/bin/bash\nset -e\nsudo apt-get install curl',
        mockAnalysis,
      );
      expect(result.ownerId).toBe(ownerId);
      expect(result.currentVersionNumber).toBe(1);
    });
  });

  describe('addVersion', () => {
    it('creates a new version when called by the owner', async () => {
      const doc = makeScriptDoc({ currentVersionNumber: 1 });
      const newVersion = makeVersionDoc({ versionNumber: 2, content: '#!/bin/bash\necho v2' });
      mockScriptModel.findById.mockReturnValue({ exec: jest.fn().mockResolvedValue(doc) });
      analysisService.analyze.mockReturnValue(mockAnalysis);
      versionsService.create.mockResolvedValue(newVersion as any);

      const result = await service.addVersion(scriptId, '#!/bin/bash\necho v2', ownerId);

      expect(versionsService.create).toHaveBeenCalledWith(
        scriptId, 2, '#!/bin/bash\necho v2', mockAnalysis,
      );
      expect(result.latestVersion?.versionNumber).toBe(2);
    });

    it('throws ForbiddenException when called by a non-owner', async () => {
      const doc = makeScriptDoc();
      mockScriptModel.findById.mockReturnValue({ exec: jest.fn().mockResolvedValue(doc) });

      await expect(
        service.addVersion(scriptId, '#!/bin/bash\necho v2', otherUserId),
      ).rejects.toThrow(ForbiddenException);
      expect(versionsService.create).not.toHaveBeenCalled();
    });

    it('throws NotFoundException when script does not exist', async () => {
      mockScriptModel.findById.mockReturnValue({ exec: jest.fn().mockResolvedValue(null) });

      await expect(service.addVersion('bad-id', 'content', ownerId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('delete', () => {
    it('deletes the script and all its versions', async () => {
      const doc = makeScriptDoc();
      mockScriptModel.findByIdAndDelete.mockReturnValue({ exec: jest.fn().mockResolvedValue(doc) });

      await service.delete(scriptId);

      expect(versionsService.deleteAllForScript).toHaveBeenCalledWith(scriptId);
    });

    it('throws NotFoundException when script does not exist', async () => {
      mockScriptModel.findByIdAndDelete.mockReturnValue({ exec: jest.fn().mockResolvedValue(null) });

      await expect(service.delete('bad-id')).rejects.toThrow(NotFoundException);
    });
  });
});
