import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ScriptsController } from './scripts.controller';
import { ScriptsService } from './scripts.service';
import { AnalysisService } from './analysis.service';
import { Script, ScriptSchema } from './schemas/script.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Script.name, schema: ScriptSchema }]),
  ],
  controllers: [ScriptsController],
  providers: [ScriptsService, AnalysisService],
})
export class ScriptsModule {}
