import { Injectable, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { CreateScriptDto } from './dto/create-script.dto';
import { ScriptResponseDto } from './dto/script-response.dto';

export interface Script {
  id: string;
  name: string;
  content: string;
  description?: string;
  url?: string;
  trustScore?: number;
  createdAt: Date;
  updatedAt: Date;
}

@Injectable()
export class ScriptsService {
  private scripts: Map<string, Script> = new Map();

  findAll(): ScriptResponseDto[] {
    return Array.from(this.scripts.values());
  }

  findOne(id: string): ScriptResponseDto {
    const script = this.scripts.get(id);
    if (!script) {
      throw new NotFoundException(`Script with ID ${id} not found`);
    }
    return script;
  }

  create(createScriptDto: CreateScriptDto): ScriptResponseDto {
    const now = new Date();
    const script: Script = {
      id: randomUUID(),
      name: createScriptDto.name,
      content: createScriptDto.content,
      description: createScriptDto.description,
      url: createScriptDto.url,
      createdAt: now,
      updatedAt: now,
    };

    this.scripts.set(script.id, script);
    return script;
  }

  delete(id: string): void {
    const script = this.scripts.get(id);
    if (!script) {
      throw new NotFoundException(`Script with ID ${id} not found`);
    }
    this.scripts.delete(id);
  }
}
