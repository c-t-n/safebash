import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { ScriptVersion, ScriptVersionDocument } from './schemas/script-version.schema';
import { AnalysisResult } from './analysis.service';
import { VersionResponseDto } from './dto/version-response.dto';

@Injectable()
export class VersionsService {
  constructor(
    @InjectModel(ScriptVersion.name)
    private readonly versionModel: Model<ScriptVersionDocument>,
  ) {}

  async findAll(scriptId: string): Promise<VersionResponseDto[]> {
    const versions = await this.versionModel
      .find({ scriptId: new Types.ObjectId(scriptId) })
      .sort({ versionNumber: 1 })
      .exec();
    return versions.map((v) => this.toResponseDto(v));
  }

  async findByNumber(scriptId: string, versionNumber: number): Promise<VersionResponseDto> {
    const version = await this.versionModel
      .findOne({ scriptId: new Types.ObjectId(scriptId), versionNumber })
      .exec();
    if (!version) {
      throw new NotFoundException(
        `Version ${versionNumber} not found for script ${scriptId}`,
      );
    }
    return this.toResponseDto(version);
  }

  async findLatest(scriptId: string): Promise<ScriptVersionDocument | null> {
    return this.versionModel
      .findOne({ scriptId: new Types.ObjectId(scriptId) })
      .sort({ versionNumber: -1 })
      .exec();
  }

  async create(
    scriptId: string,
    versionNumber: number,
    content: string,
    analysis: AnalysisResult,
  ): Promise<ScriptVersionDocument> {
    const version = new this.versionModel({
      scriptId: new Types.ObjectId(scriptId),
      versionNumber,
      content,
      analysis,
    });
    return version.save();
  }

  async deleteAllForScript(scriptId: string): Promise<void> {
    await this.versionModel
      .deleteMany({ scriptId: new Types.ObjectId(scriptId) })
      .exec();
  }

  private toResponseDto(version: ScriptVersionDocument): VersionResponseDto {
    return {
      id: version._id.toString(),
      scriptId: version.scriptId.toString(),
      versionNumber: version.versionNumber,
      content: version.content,
      analysis: version.analysis as AnalysisResult | undefined,
      createdAt: version.createdAt!,
    };
  }
}
