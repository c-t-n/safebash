import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { ScriptsService } from './scripts.service';
import { CreateScriptDto } from './dto/create-script.dto';

describe('ScriptsService', () => {
  let service: ScriptsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ScriptsService],
    }).compile();

    service = module.get<ScriptsService>(ScriptsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new script with UUID', () => {
      const createScriptDto: CreateScriptDto = {
        name: 'Test Script',
        content: '#!/bin/bash\necho "Hello World"',
        description: 'A test script',
      };

      const result = service.create(createScriptDto);

      expect(result).toBeDefined();
      expect(result.id).toBeDefined();
      expect(result.name).toBe(createScriptDto.name);
      expect(result.content).toBe(createScriptDto.content);
      expect(result.description).toBe(createScriptDto.description);
      expect(result.createdAt).toBeInstanceOf(Date);
      expect(result.updatedAt).toBeInstanceOf(Date);
    });

    it('should create script with optional url', () => {
      const createScriptDto: CreateScriptDto = {
        name: 'Remote Script',
        content: '#!/bin/bash\necho "test"',
        url: 'https://example.com/script.sh',
      };

      const result = service.create(createScriptDto);

      expect(result.url).toBe(createScriptDto.url);
    });

    it('should generate unique IDs for different scripts', () => {
      const dto: CreateScriptDto = {
        name: 'Script',
        content: 'content',
      };

      const script1 = service.create(dto);
      const script2 = service.create(dto);

      expect(script1.id).not.toBe(script2.id);
    });
  });

  describe('findAll', () => {
    it('should return empty array initially', () => {
      const result = service.findAll();
      expect(result).toEqual([]);
    });

    it('should return all created scripts', () => {
      const dto1: CreateScriptDto = {
        name: 'Script 1',
        content: 'content 1',
      };
      const dto2: CreateScriptDto = {
        name: 'Script 2',
        content: 'content 2',
      };

      service.create(dto1);
      service.create(dto2);

      const result = service.findAll();
      expect(result).toHaveLength(2);
      expect(result[0].name).toBe('Script 1');
      expect(result[1].name).toBe('Script 2');
    });
  });

  describe('findOne', () => {
    it('should return a script by ID', () => {
      const dto: CreateScriptDto = {
        name: 'Test Script',
        content: 'test content',
      };

      const created = service.create(dto);
      const found = service.findOne(created.id);

      expect(found).toBeDefined();
      expect(found.id).toBe(created.id);
      expect(found.name).toBe(dto.name);
    });

    it('should throw NotFoundException for non-existent ID', () => {
      expect(() => {
        service.findOne('non-existent-id');
      }).toThrow(NotFoundException);
    });

    it('should throw NotFoundException with proper message', () => {
      const id = 'test-id-123';
      expect(() => {
        service.findOne(id);
      }).toThrow(`Script with ID ${id} not found`);
    });
  });

  describe('delete', () => {
    it('should delete a script by ID', () => {
      const dto: CreateScriptDto = {
        name: 'To Delete',
        content: 'content',
      };

      const created = service.create(dto);
      expect(service.findAll()).toHaveLength(1);

      service.delete(created.id);
      expect(service.findAll()).toHaveLength(0);
    });

    it('should throw NotFoundException when deleting non-existent script', () => {
      expect(() => {
        service.delete('non-existent-id');
      }).toThrow(NotFoundException);
    });

    it('should not affect other scripts when deleting one', () => {
      const dto1: CreateScriptDto = {
        name: 'Script 1',
        content: 'content 1',
      };
      const dto2: CreateScriptDto = {
        name: 'Script 2',
        content: 'content 2',
      };

      const script1 = service.create(dto1);
      const script2 = service.create(dto2);

      service.delete(script1.id);

      const remaining = service.findAll();
      expect(remaining).toHaveLength(1);
      expect(remaining[0].id).toBe(script2.id);
    });
  });
});
