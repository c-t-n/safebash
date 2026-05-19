import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { ScriptsController } from './scripts.controller';
import { ScriptsService } from './scripts.service';
import { AnalysisService } from './analysis.service';
import { CreateScriptDto } from './dto/create-script.dto';
import { ScriptResponseDto } from './dto/script-response.dto';

describe('ScriptsController', () => {
  let controller: ScriptsController;
  let scriptsService: ScriptsService;
  let analysisService: AnalysisService;

  const mockScriptResponse: ScriptResponseDto = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    name: 'Test Script',
    content: '#!/bin/bash\necho "test"',
    description: 'Test description',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ScriptsController],
      providers: [
        {
          provide: ScriptsService,
          useValue: {
            findAll: jest.fn(),
            findOne: jest.fn(),
            create: jest.fn(),
            delete: jest.fn(),
          },
        },
        {
          provide: AnalysisService,
          useValue: {
            analyzeScript: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<ScriptsController>(ScriptsController);
    scriptsService = module.get<ScriptsService>(ScriptsService);
    analysisService = module.get<AnalysisService>(AnalysisService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should return an array of scripts', () => {
      const result: ScriptResponseDto[] = [mockScriptResponse];
      jest.spyOn(scriptsService, 'findAll').mockReturnValue(result);

      expect(controller.findAll()).toBe(result);
      expect(scriptsService.findAll).toHaveBeenCalled();
    });

    it('should return empty array when no scripts exist', () => {
      jest.spyOn(scriptsService, 'findAll').mockReturnValue([]);

      expect(controller.findAll()).toEqual([]);
    });
  });

  describe('findOne', () => {
    it('should return a single script by ID', () => {
      jest.spyOn(scriptsService, 'findOne').mockReturnValue(mockScriptResponse);

      const result = controller.findOne(mockScriptResponse.id);

      expect(result).toBe(mockScriptResponse);
      expect(scriptsService.findOne).toHaveBeenCalledWith(mockScriptResponse.id);
    });

    it('should throw NotFoundException for invalid ID', () => {
      const invalidId = 'invalid-id';
      jest
        .spyOn(scriptsService, 'findOne')
        .mockImplementation(() => {
          throw new NotFoundException(`Script with ID ${invalidId} not found`);
        });

      expect(() => controller.findOne(invalidId)).toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('should create a new script', () => {
      const createDto: CreateScriptDto = {
        name: 'New Script',
        content: '#!/bin/bash\necho "new"',
        description: 'New script description',
      };

      jest.spyOn(scriptsService, 'create').mockReturnValue(mockScriptResponse);

      const result = controller.create(createDto);

      expect(result).toBe(mockScriptResponse);
      expect(scriptsService.create).toHaveBeenCalledWith(createDto);
    });

    it('should create script without optional fields', () => {
      const createDto: CreateScriptDto = {
        name: 'Minimal Script',
        content: '#!/bin/bash',
      };

      const minimalResponse = { ...mockScriptResponse, description: undefined };
      jest.spyOn(scriptsService, 'create').mockReturnValue(minimalResponse);

      const result = controller.create(createDto);

      expect(result.description).toBeUndefined();
      expect(scriptsService.create).toHaveBeenCalledWith(createDto);
    });

    it('should create script with URL', () => {
      const createDto: CreateScriptDto = {
        name: 'Remote Script',
        content: '#!/bin/bash',
        url: 'https://example.com/script.sh',
      };

      const responseWithUrl = { ...mockScriptResponse, url: createDto.url };
      jest.spyOn(scriptsService, 'create').mockReturnValue(responseWithUrl);

      const result = controller.create(createDto);

      expect(result.url).toBe(createDto.url);
    });
  });

  describe('delete', () => {
    it('should delete a script by ID', () => {
      const scriptId = mockScriptResponse.id;
      jest.spyOn(scriptsService, 'delete').mockImplementation();

      controller.delete(scriptId);

      expect(scriptsService.delete).toHaveBeenCalledWith(scriptId);
    });

    it('should throw NotFoundException when deleting non-existent script', () => {
      const invalidId = 'non-existent-id';
      jest
        .spyOn(scriptsService, 'delete')
        .mockImplementation(() => {
          throw new NotFoundException(`Script with ID ${invalidId} not found`);
        });

      expect(() => controller.delete(invalidId)).toThrow(NotFoundException);
    });
  });

  describe('analyzeScript', () => {
    it('should analyze a script by URL', async () => {
      const url = 'https://example.com/script.sh';
      const analysisResult = {
        url,
        trustScore: 85,
        risks: [],
        warnings: ['Uses sudo'],
        safePatterns: ['Read-only operations'],
        timestamp: new Date(),
      };

      jest.spyOn(analysisService, 'analyzeScript').mockResolvedValue(analysisResult);

      const result = await controller.analyzeScript(url);

      expect(result).toBe(analysisResult);
      expect(analysisService.analyzeScript).toHaveBeenCalledWith(url);
    });
  });
});
