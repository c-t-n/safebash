import { Test, TestingModule } from '@nestjs/testing';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { getModelToken } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { ScriptsService } from './scripts.service';
import { VersionsService } from './versions.service';
import { AnalysisResult } from './analysis.service';
import { Script } from './schemas/script.schema';
import { AnalysisJobDispatcher } from '../jobs/analysis-job.dispatcher';

const mockAnalysis: AnalysisResult = {
  trustScore: 85,
  risks: [],
  warnings: ['Uses sudo for elevated privileges'],
  safePatterns: ['Has proper shebang line', 'Exits on command failure (set -e)'],
  analyzedAt: new Date('2024-01-01'),
  summary: { tech: 'Test summary (tech).', plain: 'Test summary (plain).' },
  lines: [
    {
      lineNumber: 1,
      content: '#!/bin/bash',
      tech: 'Shebang.',
      plain: 'Runs as a shell script.',
      source: 'dict',
    },
  ],
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
  let jobs: jest.Mocked<AnalysisJobDispatcher>;

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
            findById: jest.fn(),
            create: jest.fn(),
            deleteAllForScript: jest.fn(),
          },
        },
        {
          provide: AnalysisJobDispatcher,
          useValue: { dispatch: jest.fn().mockResolvedValue(undefined) },
        },
      ],
    }).compile();

    service = module.get<ScriptsService>(ScriptsService);
    versionsService = module.get(VersionsService);
    jobs = module.get(AnalysisJobDispatcher);
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
    it('creates a script + version with no analysis and dispatches a job', async () => {
      const doc = makeScriptDoc();
      const version = makeVersionDoc({ analysis: undefined, analysisStatus: 'pending' });
      saveMock.mockResolvedValue(doc);
      versionsService.create.mockResolvedValue(version as any);

      const result = await service.create(
        { name: 'Test Script', content: '#!/bin/bash\nset -e\nsudo apt-get install curl' },
        ownerId,
      );

      // Worker, not the API, runs the analysis — the service must not
      // pass an analysis blob to versions.create().
      expect(versionsService.create).toHaveBeenCalledWith(
        scriptId,
        1,
        '#!/bin/bash\nset -e\nsudo apt-get install curl',
      );
      expect(jobs.dispatch).toHaveBeenCalledWith(version._id.toString());
      expect(result.ownerId).toBe(ownerId);
      expect(result.currentVersionNumber).toBe(1);
      expect(result.latestVersion?.analysisStatus).toBe('pending');
    });
  });

  describe('addVersion', () => {
    it('persists a new version with no analysis and dispatches a job', async () => {
      const doc = makeScriptDoc({ currentVersionNumber: 1 });
      const newVersion = makeVersionDoc({
        versionNumber: 2,
        content: '#!/bin/bash\necho v2',
        analysis: undefined,
        analysisStatus: 'pending',
      });
      mockScriptModel.findById.mockReturnValue({ exec: jest.fn().mockResolvedValue(doc) });
      versionsService.create.mockResolvedValue(newVersion as any);

      const result = await service.addVersion(scriptId, '#!/bin/bash\necho v2', ownerId);

      expect(versionsService.create).toHaveBeenCalledWith(scriptId, 2, '#!/bin/bash\necho v2');
      expect(jobs.dispatch).toHaveBeenCalledWith(newVersion._id.toString());
      expect(result.latestVersion?.versionNumber).toBe(2);
      expect(result.latestVersion?.analysisStatus).toBe('pending');
    });

    it('throws ForbiddenException when called by a non-owner', async () => {
      const doc = makeScriptDoc();
      mockScriptModel.findById.mockReturnValue({ exec: jest.fn().mockResolvedValue(doc) });

      await expect(
        service.addVersion(scriptId, '#!/bin/bash\necho v2', otherUserId),
      ).rejects.toThrow(ForbiddenException);
      expect(versionsService.create).not.toHaveBeenCalled();
      expect(jobs.dispatch).not.toHaveBeenCalled();
    });

    it('throws NotFoundException when script does not exist', async () => {
      mockScriptModel.findById.mockReturnValue({ exec: jest.fn().mockResolvedValue(null) });

      await expect(service.addVersion('bad-id', 'content', ownerId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('reanalyzeLatest', () => {
    it('flips the latest version back to pending and dispatches a job', async () => {
      const doc = makeScriptDoc();
      const save = jest.fn().mockResolvedValue(undefined);
      const latest = makeVersionDoc({
        save,
        analysisStatus: 'completed',
        analysisError: 'old failure',
      }) as ReturnType<typeof makeVersionDoc> & {
        save: jest.Mock;
        analysisStatus: string;
        analysisError?: string;
      };
      mockScriptModel.findById.mockReturnValue({ exec: jest.fn().mockResolvedValue(doc) });
      versionsService.findLatest.mockResolvedValue(latest as any);

      const result = await service.reanalyzeLatest(scriptId, ownerId);

      expect(save).toHaveBeenCalled();
      expect(latest.analysisStatus).toBe('pending');
      expect(latest.analysisError).toBeUndefined();
      expect(jobs.dispatch).toHaveBeenCalledWith(latest._id.toString());
      expect(result.latestVersion?.analysisStatus).toBe('pending');
    });

    it('throws ForbiddenException for non-owners', async () => {
      const doc = makeScriptDoc();
      mockScriptModel.findById.mockReturnValue({ exec: jest.fn().mockResolvedValue(doc) });

      await expect(service.reanalyzeLatest(scriptId, otherUserId)).rejects.toThrow(ForbiddenException);
      expect(jobs.dispatch).not.toHaveBeenCalled();
    });

    it('throws NotFoundException when the script does not exist', async () => {
      mockScriptModel.findById.mockReturnValue({ exec: jest.fn().mockResolvedValue(null) });

      await expect(service.reanalyzeLatest('bad-id', ownerId)).rejects.toThrow(NotFoundException);
    });

    it('throws NotFoundException when no versions exist yet', async () => {
      const doc = makeScriptDoc();
      mockScriptModel.findById.mockReturnValue({ exec: jest.fn().mockResolvedValue(doc) });
      versionsService.findLatest.mockResolvedValue(null);

      await expect(service.reanalyzeLatest(scriptId, ownerId)).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateMetadata', () => {
    it('updates the provided fields when called by the owner', async () => {
      const doc = makeScriptDoc({ name: 'old', description: 'old desc', url: undefined });
      mockScriptModel.findById.mockReturnValue({ exec: jest.fn().mockResolvedValue(doc) });

      const result = await service.updateMetadata(
        scriptId,
        { name: 'new', description: 'new desc', url: 'https://example.com/x.sh' },
        ownerId,
      );

      expect(doc.name).toBe('new');
      expect(doc.description).toBe('new desc');
      expect(doc.url).toBe('https://example.com/x.sh');
      expect(doc.save).toHaveBeenCalled();
      expect(result.name).toBe('new');
    });

    it('leaves unspecified fields alone', async () => {
      const doc = makeScriptDoc({ name: 'keep-me', description: 'keep desc' });
      mockScriptModel.findById.mockReturnValue({ exec: jest.fn().mockResolvedValue(doc) });

      await service.updateMetadata(scriptId, { description: 'changed' }, ownerId);

      expect(doc.name).toBe('keep-me');
      expect(doc.description).toBe('changed');
    });

    it('throws ForbiddenException when called by a non-owner', async () => {
      const doc = makeScriptDoc();
      mockScriptModel.findById.mockReturnValue({ exec: jest.fn().mockResolvedValue(doc) });

      await expect(
        service.updateMetadata(scriptId, { name: 'nope' }, otherUserId),
      ).rejects.toThrow(ForbiddenException);
      expect(doc.save).not.toHaveBeenCalled();
    });

    it('throws NotFoundException when script does not exist', async () => {
      mockScriptModel.findById.mockReturnValue({ exec: jest.fn().mockResolvedValue(null) });

      await expect(
        service.updateMetadata('bad-id', { name: 'whatever' }, ownerId),
      ).rejects.toThrow(NotFoundException);
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
