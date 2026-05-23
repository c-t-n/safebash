import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AnalysisJobConsumer } from './jobs/analysis-job.consumer';
import { AnalysisService } from './scripts/analysis.service';
import { ExplainerService } from './scripts/explainer/explainer.service';
import { LlmExplainerClient } from './scripts/explainer/llm.client';
import { ScriptFetcher } from './scripts/script-fetcher.service';
import { VersionsService } from './scripts/versions.service';
import {
  ScriptVersion,
  ScriptVersionSchema,
} from './scripts/schemas/script-version.schema';

/**
 * Slim NestJS module for the worker process. Deliberately omits the HTTP
 * stack, auth, and ScriptsModule's controllers — the worker only needs:
 *  - Mongoose connection (to write analysis results back)
 *  - The ScriptVersion model + VersionsService for lookup/save
 *  - The AnalysisService + its dependencies (explainer, LLM, fetcher)
 *  - The AnalysisJobConsumer wired as a controller so @EventPattern fires
 */
@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        uri:
          config.get<string>('MONGODB_URI') ??
          'mongodb://localhost:27017/safebash',
      }),
    }),
    MongooseModule.forFeature([
      { name: ScriptVersion.name, schema: ScriptVersionSchema },
    ]),
  ],
  controllers: [AnalysisJobConsumer],
  providers: [
    VersionsService,
    AnalysisService,
    ExplainerService,
    LlmExplainerClient,
    ScriptFetcher,
  ],
})
export class WorkerModule {}
