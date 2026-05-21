import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ScriptsController } from './scripts.controller';
import { ScriptsService } from './scripts.service';
import { VersionsService } from './versions.service';
import { AnalysisService } from './analysis.service';
import { ExplainerService } from './explainer/explainer.service';
import { LlmExplainerClient } from './explainer/llm.client';
import { ScriptFetcher } from './script-fetcher.service';
import { Script, ScriptSchema } from './schemas/script.schema';
import { ScriptVersion, ScriptVersionSchema } from './schemas/script-version.schema';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Script.name, schema: ScriptSchema },
      { name: ScriptVersion.name, schema: ScriptVersionSchema },
    ]),
    AuthModule,
  ],
  controllers: [ScriptsController],
  providers: [
    ScriptsService,
    VersionsService,
    AnalysisService,
    ExplainerService,
    LlmExplainerClient,
    ScriptFetcher,
  ],
})
export class ScriptsModule {}
