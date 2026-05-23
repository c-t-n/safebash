import { Inject, Injectable, Logger } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import {
  ANALYSIS_QUEUE_CLIENT,
  ANALYZE_SCRIPT_PATTERN,
  AnalyzeScriptPayload,
} from './jobs.constants';

/**
 * Thin wrapper around the RMQ ClientProxy. Centralises the event name and
 * payload shape so callers don't have to know either.
 *
 * `emit()` is fire-and-forget at the protocol level (no reply expected),
 * but the returned Observable resolves once the broker has acked the
 * publish. We await that ack so a broker outage surfaces as a synchronous
 * error in the HTTP request rather than silently dropping the job.
 */
@Injectable()
export class AnalysisJobDispatcher {
  private readonly logger = new Logger(AnalysisJobDispatcher.name);

  constructor(
    @Inject(ANALYSIS_QUEUE_CLIENT) private readonly client: ClientProxy,
  ) {}

  async dispatch(versionId: string): Promise<void> {
    const payload: AnalyzeScriptPayload = { versionId };
    try {
      await firstValueFrom(this.client.emit(ANALYZE_SCRIPT_PATTERN, payload));
      this.logger.log(`Dispatched analyze-script for version ${versionId}`);
    } catch (err) {
      this.logger.error(
        `Failed to dispatch analyze-script for ${versionId}: ${(err as Error).message}`,
      );
      throw err;
    }
  }
}
