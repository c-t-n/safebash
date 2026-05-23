import { Controller, Logger } from '@nestjs/common';
import { Ctx, EventPattern, Payload, RmqContext } from '@nestjs/microservices';
import { AnalysisService } from '../scripts/analysis.service';
import { VersionsService } from '../scripts/versions.service';
import { ANALYZE_SCRIPT_PATTERN, AnalyzeScriptPayload } from './jobs.constants';

/**
 * Worker-side consumer. Lives in the worker process only — never wired into
 * the HTTP backend module. Loads the target ScriptVersion, runs the
 * (possibly very slow) analysis, and writes the result back.
 *
 * Ack/nack semantics: we always ack — even on failure — because retrying a
 * 60-second LLM call automatically is rarely the right answer. The failure
 * is captured on the version document so the UI can surface it and the
 * owner can hit "Re-analyze" themselves.
 */
@Controller()
export class AnalysisJobConsumer {
  private readonly logger = new Logger(AnalysisJobConsumer.name);

  constructor(
    private readonly versionsService: VersionsService,
    private readonly analysisService: AnalysisService,
  ) {}

  @EventPattern(ANALYZE_SCRIPT_PATTERN)
  async handle(
    @Payload() data: AnalyzeScriptPayload,
    @Ctx() ctx: RmqContext,
  ): Promise<void> {
    const channel = ctx.getChannelRef();
    const message = ctx.getMessage();

    try {
      await this.process(data);
    } catch (err) {
      // process() catches its own errors and persists them on the version
      // document — anything bubbling here is unexpected. Log it and ack
      // anyway so a poison message doesn't loop forever.
      this.logger.error(
        `Unexpected error handling analyze-script: ${(err as Error).message}`,
      );
    } finally {
      channel.ack(message);
    }
  }

  private async process(data: AnalyzeScriptPayload): Promise<void> {
    if (!data?.versionId) {
      this.logger.warn('analyze-script received without versionId — dropping.');
      return;
    }

    const version = await this.versionsService.findById(data.versionId);
    if (!version) {
      this.logger.warn(`Version ${data.versionId} not found — dropping.`);
      return;
    }

    version.analysisStatus = 'processing';
    version.analysisError = undefined;
    await version.save();
    this.logger.log(`Analyzing version ${data.versionId}…`);

    try {
      const result = await this.analysisService.analyze(version.content);
      version.analysis = result as unknown as Record<string, unknown>;
      version.analysisStatus = 'completed';
      version.analysisError = undefined;
      await version.save();
      this.logger.log(
        `Completed analyze-script for ${data.versionId} (trustScore=${result.trustScore})`,
      );
    } catch (err) {
      const msg = (err as Error).message;
      this.logger.error(`Analysis failed for ${data.versionId}: ${msg}`);
      version.analysisStatus = 'failed';
      version.analysisError = msg;
      await version.save();
    }
  }
}
