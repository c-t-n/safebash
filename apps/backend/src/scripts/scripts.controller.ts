import { Controller, Get, Post, Delete, Body, Param, HttpCode, HttpStatus } from '@nestjs/common';
import { ScriptsService } from './scripts.service';
import { AnalysisService } from './analysis.service';
import { CreateScriptDto } from './dto/create-script.dto';
import { ScriptResponseDto } from './dto/script-response.dto';

@Controller('scripts')
export class ScriptsController {
  constructor(
    private readonly scriptsService: ScriptsService,
    private readonly analysisService: AnalysisService,
  ) {}

  @Get()
  async findAll(): Promise<ScriptResponseDto[]> {
    return this.scriptsService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<ScriptResponseDto> {
    return this.scriptsService.findOne(id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createScriptDto: CreateScriptDto): Promise<ScriptResponseDto> {
    return this.scriptsService.create(createScriptDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Param('id') id: string): Promise<void> {
    return this.scriptsService.delete(id);
  }

  @Post('analyze')
  async analyzeScript(@Body('url') url: string) {
    return this.analysisService.analyzeScript(url);
  }
}
