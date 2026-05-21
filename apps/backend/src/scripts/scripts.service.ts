import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Script, ScriptDocument } from './schemas/script.schema';
import { VersionsService } from './versions.service';
import { AnalysisService } from './analysis.service';
import { CreateScriptDto } from './dto/create-script.dto';
import { UpdateScriptDto } from './dto/update-script.dto';
import { ScriptResponseDto, VersionSummaryDto } from './dto/script-response.dto';
import { ScriptVersionDocument } from './schemas/script-version.schema';

@Injectable()
export class ScriptsService {
  constructor(
    @InjectModel(Script.name) private readonly scriptModel: Model<ScriptDocument>,
    private readonly versionsService: VersionsService,
    private readonly analysisService: AnalysisService,
  ) {}

  async findAll(): Promise<ScriptResponseDto[]> {
    const scripts = await this.scriptModel.find().exec();
    return scripts.map((s) => this.toSummaryDto(s));
  }

  async findOne(id: string): Promise<ScriptResponseDto> {
    const script = await this.scriptModel.findById(id).exec();
    if (!script) {
      throw new NotFoundException(`Script with ID ${id} not found`);
    }
    return this.toDetailDto(script);
  }

  async getRawContent(id: string): Promise<string> {
    const script = await this.scriptModel.findById(id).exec();
    if (!script) {
      throw new NotFoundException(`Script with ID ${id} not found`);
    }
    const latest = await this.versionsService.findLatest(id);
    if (!latest) {
      throw new NotFoundException(`No versions found for script ${id}`);
    }
    return latest.content;
  }

  async create(dto: CreateScriptDto, ownerId: string): Promise<ScriptResponseDto> {
    const analysis = await this.analysisService.analyze(dto.content);
    const script = await new this.scriptModel({
      ownerId: new Types.ObjectId(ownerId),
      name: dto.name,
      description: dto.description,
      url: dto.url,
      currentVersionNumber: 1,
    }).save();

    const version = await this.versionsService.create(
      script._id.toString(),
      1,
      dto.content,
      analysis,
    );

    return this.toDetailDto(script, version);
  }

  async addVersion(
    scriptId: string,
    content: string,
    requestingUserId: string,
  ): Promise<ScriptResponseDto> {
    const script = await this.scriptModel.findById(scriptId).exec();
    if (!script) {
      throw new NotFoundException(`Script with ID ${scriptId} not found`);
    }
    if (script.ownerId.toString() !== requestingUserId) {
      throw new ForbiddenException('Only the script owner can add new versions');
    }

    const nextVersion = script.currentVersionNumber + 1;
    const analysis = await this.analysisService.analyze(content);
    const version = await this.versionsService.create(
      scriptId,
      nextVersion,
      content,
      analysis,
    );

    script.currentVersionNumber = nextVersion;
    await script.save();

    return this.toDetailDto(script, version);
  }

  async updateMetadata(
    id: string,
    dto: UpdateScriptDto,
    requestingUserId: string,
  ): Promise<ScriptResponseDto> {
    const script = await this.scriptModel.findById(id).exec();
    if (!script) {
      throw new NotFoundException(`Script with ID ${id} not found`);
    }
    if (script.ownerId.toString() !== requestingUserId) {
      throw new ForbiddenException('Only the script owner can edit metadata');
    }

    if (dto.name !== undefined)        script.name = dto.name;
    if (dto.description !== undefined) script.description = dto.description;
    if (dto.url !== undefined)         script.url = dto.url;
    await script.save();

    return this.toDetailDto(script);
  }

  async delete(id: string): Promise<void> {
    const result = await this.scriptModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException(`Script with ID ${id} not found`);
    }
    await this.versionsService.deleteAllForScript(id);
  }

  private toSummaryDto(script: ScriptDocument): ScriptResponseDto {
    return {
      id: script._id.toString(),
      ownerId: script.ownerId.toString(),
      name: script.name,
      description: script.description,
      url: script.url,
      currentVersionNumber: script.currentVersionNumber,
      createdAt: script.createdAt!,
      updatedAt: script.updatedAt!,
    };
  }

  private async toDetailDto(
    script: ScriptDocument,
    preloadedVersion?: ScriptVersionDocument,
  ): Promise<ScriptResponseDto> {
    const dto = this.toSummaryDto(script);
    const version =
      preloadedVersion ?? (await this.versionsService.findLatest(script._id.toString()));
    if (version) {
      dto.latestVersion = this.toVersionSummary(version);
    }
    return dto;
  }

  private toVersionSummary(version: ScriptVersionDocument): VersionSummaryDto {
    return {
      versionNumber: version.versionNumber,
      content: version.content,
      analysis: version.analysis as VersionSummaryDto['analysis'],
      createdAt: version.createdAt!,
    };
  }
}
