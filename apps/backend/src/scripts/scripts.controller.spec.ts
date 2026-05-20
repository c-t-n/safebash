import { Test, TestingModule } from '@nestjs/testing';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { ScriptsController } from './scripts.controller';
import { ScriptsService } from './scripts.service';
import { VersionsService } from './versions.service';
import { AnalysisService, AnalysisResult } from './analysis.service';
import { ScriptResponseDto } from './dto/script-response.dto';
import { VersionResponseDto } from './dto/version-response.dto';
import { JwtUser } from '../auth/strategies/jwt.strategy';

const mockAnalysis: AnalysisResult = {
  trustScore: 90,
  risks: [],
  warnings: [],
  safePatterns: ['Has proper shebang line'],
  analyzedAt: new Date('2024-01-01'),
  summary: { tech: 'Test summary (tech).', plain: 'Test summary (plain).' },
  lines: [],
};

const owner: JwtUser = { id: 'owner-id', email: 'owner@example.com' };
const otherUser: JwtUser = { id: 'other-id', email: 'other@example.com' };

const mockScript: ScriptResponseDto = {
  id: '507f1f77bcf86cd799439011',
  ownerId: owner.id,
  name: 'Test Script',
  description: 'A test script',
  currentVersionNumber: 1,
  latestVersion: {
    versionNumber: 1,
    content: '#!/bin/bash\nset -e\necho "hello"',
    analysis: mockAnalysis,
    createdAt: new Date('2024-01-01'),
  },
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
};

const mockVersion: VersionResponseDto = {
  id: '507f1f77bcf86cd799439022',
  scriptId: mockScript.id,
  versionNumber: 1,
  content: '#!/bin/bash\nset -e\necho "hello"',
  analysis: mockAnalysis,
  createdAt: new Date('2024-01-01'),
};

describe('ScriptsController', () => {
  let controller: ScriptsController;
  let scriptsService: jest.Mocked<ScriptsService>;
  let versionsService: jest.Mocked<VersionsService>;
  let analysisService: jest.Mocked<AnalysisService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ScriptsController],
      providers: [
        {
          provide: ScriptsService,
          useValue: {
            findAll: jest.fn(),
            findOne: jest.fn(),
            getRawContent: jest.fn(),
            create: jest.fn(),
            addVersion: jest.fn(),
            delete: jest.fn(),
          },
        },
        {
          provide: VersionsService,
          useValue: { findAll: jest.fn(), findByNumber: jest.fn() },
        },
        {
          provide: AnalysisService,
          useValue: { analyze: jest.fn(), analyzeFromUrl: jest.fn() },
        },
      ],
    }).compile();

    controller = module.get<ScriptsController>(ScriptsController);
    scriptsService = module.get(ScriptsService);
    versionsService = module.get(VersionsService);
    analysisService = module.get(AnalysisService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('returns all scripts', async () => {
      scriptsService.findAll.mockResolvedValue([mockScript]);
      expect(await controller.findAll()).toEqual([mockScript]);
    });
  });

  describe('findOne', () => {
    it('returns a single script with ownerId and latest version', async () => {
      scriptsService.findOne.mockResolvedValue(mockScript);

      const result = await controller.findOne(mockScript.id);

      expect(result.ownerId).toBe(owner.id);
      expect(scriptsService.findOne).toHaveBeenCalledWith(mockScript.id);
    });

    it('throws NotFoundException for unknown ID', async () => {
      scriptsService.findOne.mockRejectedValue(new NotFoundException());
      await expect(controller.findOne('bad-id')).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('passes the authenticated user ID as ownerId', async () => {
      scriptsService.create.mockResolvedValue(mockScript);

      const result = await controller.create(
        { name: 'Test Script', content: '#!/bin/bash\nset -e\necho "hello"' },
        owner,
      );

      expect(scriptsService.create).toHaveBeenCalledWith(
        { name: 'Test Script', content: '#!/bin/bash\nset -e\necho "hello"' },
        owner.id,
      );
      expect(result.ownerId).toBe(owner.id);
    });
  });

  describe('delete', () => {
    it('deletes a script', async () => {
      scriptsService.delete.mockResolvedValue(undefined);
      await controller.delete(mockScript.id);
      expect(scriptsService.delete).toHaveBeenCalledWith(mockScript.id);
    });
  });

  describe('analyzeFromUrl', () => {
    it('delegates to AnalysisService', async () => {
      const url = 'https://example.com/install.sh';
      const result = { url, ...mockAnalysis };
      analysisService.analyzeFromUrl.mockResolvedValue(result);

      expect(await controller.analyzeFromUrl(url)).toBe(result);
    });
  });

  describe('getVersions', () => {
    it('returns all versions for a script', async () => {
      versionsService.findAll.mockResolvedValue([mockVersion]);
      expect(await controller.getVersions(mockScript.id)).toEqual([mockVersion]);
    });
  });

  describe('getVersion', () => {
    it('returns a specific version by number', async () => {
      versionsService.findByNumber.mockResolvedValue(mockVersion);
      expect(await controller.getVersion(mockScript.id, 1)).toBe(mockVersion);
    });

    it('throws NotFoundException for unknown version', async () => {
      versionsService.findByNumber.mockRejectedValue(new NotFoundException());
      await expect(controller.getVersion(mockScript.id, 99)).rejects.toThrow(NotFoundException);
    });
  });

  describe('addVersion', () => {
    it('passes the authenticated user ID to the service', async () => {
      const updated = { ...mockScript, currentVersionNumber: 2 };
      scriptsService.addVersion.mockResolvedValue(updated);

      const result = await controller.addVersion(
        mockScript.id,
        { content: '#!/bin/bash\necho v2' },
        owner,
      );

      expect(scriptsService.addVersion).toHaveBeenCalledWith(
        mockScript.id,
        '#!/bin/bash\necho v2',
        owner.id,
      );
      expect(result.currentVersionNumber).toBe(2);
    });

    it('propagates ForbiddenException when called by a non-owner', async () => {
      scriptsService.addVersion.mockRejectedValue(new ForbiddenException());

      await expect(
        controller.addVersion(mockScript.id, { content: '#!/bin/bash\necho v2' }, otherUser),
      ).rejects.toThrow(ForbiddenException);
    });
  });
});
