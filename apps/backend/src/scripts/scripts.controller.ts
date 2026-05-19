import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { ScriptsService } from './scripts.service';
import { AnalysisService } from './analysis.service';

@Controller('scripts')
export class ScriptsController {
  constructor(
    private readonly scriptsService: ScriptsService,
    private readonly analysisService: AnalysisService,
  ) {}

  @Get()
  findAll() {
    return this.scriptsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.scriptsService.findOne(id);
  }

  @Post('analyze')
  async analyzeScript(@Body('url') url: string) {
    return this.analysisService.analyzeScript(url);
  }
}
