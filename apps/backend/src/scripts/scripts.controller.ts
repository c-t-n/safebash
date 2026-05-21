import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  HttpCode,
  HttpStatus,
  Res,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { Response } from 'express';
import { ScriptsService } from './scripts.service';
import { VersionsService } from './versions.service';
import { AnalysisService } from './analysis.service';
import { CreateScriptDto } from './dto/create-script.dto';
import { CreateVersionDto } from './dto/create-version.dto';
import { FetchUrlDto, FetchUrlResponseDto } from './dto/fetch-url.dto';
import { ScriptResponseDto } from './dto/script-response.dto';
import { VersionResponseDto } from './dto/version-response.dto';
import { ScriptFetcher } from './script-fetcher.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtUser } from '../auth/strategies/jwt.strategy';

@Controller('scripts')
export class ScriptsController {
  constructor(
    private readonly scriptsService: ScriptsService,
    private readonly versionsService: VersionsService,
    private readonly analysisService: AnalysisService,
    private readonly fetcher: ScriptFetcher,
  ) {}

  // ── Script CRUD ─────────────────────────────────────────────────────────────

  @Get()
  findAll(): Promise<ScriptResponseDto[]> {
    return this.scriptsService.findAll();
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(
    @Body() dto: CreateScriptDto,
    @CurrentUser() user: JwtUser,
  ): Promise<ScriptResponseDto> {
    return this.scriptsService.create(dto, user.id);
  }

  // Declared before :id so the literal segment wins over the param
  @Post('analyze')
  analyzeFromUrl(@Body('url') url: string) {
    return this.analysisService.analyzeFromUrl(url);
  }

  // Fetches a script's content over the public network so the user can preview
  // and publish it without manually copy-pasting. Auth-guarded because the
  // server performs the egress on behalf of the caller.
  @UseGuards(JwtAuthGuard)
  @Post('fetch-url')
  async fetchFromUrl(@Body() dto: FetchUrlDto): Promise<FetchUrlResponseDto> {
    const content = await this.fetcher.fetchText(dto.url);
    return {
      url: dto.url,
      content,
      suggestedName: this.fetcher.suggestedName(dto.url),
    };
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<ScriptResponseDto> {
    return this.scriptsService.findOne(id);
  }

  // Serves the latest version as raw bash content, suitable for curl | sh
  @Get(':id/raw')
  async getRaw(@Param('id') id: string, @Res() res: Response): Promise<void> {
    const content = await this.scriptsService.getRawContent(id);
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.send(content);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  delete(@Param('id') id: string): Promise<void> {
    return this.scriptsService.delete(id);
  }

  // ── Versioning ───────────────────────────────────────────────────────────────

  @Get(':id/versions')
  getVersions(@Param('id') id: string): Promise<VersionResponseDto[]> {
    return this.versionsService.findAll(id);
  }

  @Get(':id/versions/:versionNumber')
  getVersion(
    @Param('id') id: string,
    @Param('versionNumber', ParseIntPipe) versionNumber: number,
  ): Promise<VersionResponseDto> {
    return this.versionsService.findByNumber(id, versionNumber);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/versions')
  @HttpCode(HttpStatus.CREATED)
  addVersion(
    @Param('id') id: string,
    @Body() dto: CreateVersionDto,
    @CurrentUser() user: JwtUser,
  ): Promise<ScriptResponseDto> {
    return this.scriptsService.addVersion(id, dto.content, user.id);
  }
}
