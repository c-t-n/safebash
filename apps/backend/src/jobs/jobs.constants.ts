/** DI token for the RMQ ClientProxy used by the API to publish jobs. */
export const ANALYSIS_QUEUE_CLIENT = 'ANALYSIS_QUEUE_CLIENT';

/** Event name the producer emits and the worker subscribes to. */
export const ANALYZE_SCRIPT_PATTERN = 'analyze-script';

/** Default queue name; overridden via ANALYSIS_QUEUE env var. */
export const DEFAULT_ANALYSIS_QUEUE = 'safebash.analysis';

export interface AnalyzeScriptPayload {
  /** ObjectId string of the ScriptVersion to analyze. */
  versionId: string;
}
