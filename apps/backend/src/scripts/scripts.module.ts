import { Module } from '@nestjs/common';
import { ScriptsController } from './scripts.controller';
import { ScriptsService } from './scripts.service';
import { AnalysisService } from './analysis.service';

@Module({
  controllers: [ScriptsController],
  providers: [ScriptsService, AnalysisService],
})
export class ScriptsModule {}
