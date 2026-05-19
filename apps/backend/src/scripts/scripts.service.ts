import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateScriptDto } from './dto/create-script.dto';
import { ScriptResponseDto } from './dto/script-response.dto';
import { Script, ScriptDocument } from './schemas/script.schema';

@Injectable()
export class ScriptsService {
  constructor(
    @InjectModel(Script.name) private scriptModel: Model<ScriptDocument>,
  ) {}

  async findAll(): Promise<ScriptResponseDto[]> {
    const scripts = await this.scriptModel.find().exec();
    return scripts.map((script) => this.toResponseDto(script));
  }

  async findOne(id: string): Promise<ScriptResponseDto> {
    const script = await this.scriptModel.findById(id).exec();
    if (!script) {
      throw new NotFoundException(`Script with ID ${id} not found`);
    }
    return this.toResponseDto(script);
  }

  async create(createScriptDto: CreateScriptDto): Promise<ScriptResponseDto> {
    const createdScript = new this.scriptModel(createScriptDto);
    const savedScript = await createdScript.save();
    return this.toResponseDto(savedScript);
  }

  async delete(id: string): Promise<void> {
    const result = await this.scriptModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException(`Script with ID ${id} not found`);
    }
  }

  private toResponseDto(script: ScriptDocument): ScriptResponseDto {
    return {
      id: script._id.toString(),
      name: script.name,
      content: script.content,
      description: script.description,
      url: script.url,
      trustScore: script.trustScore,
      createdAt: script.createdAt!,
      updatedAt: script.updatedAt!,
    };
  }
}
