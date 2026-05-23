import { Injectable, Logger } from '@nestjs/common';

export interface ScriptSummary {
  tech: string;
  plain: string;
}

export interface LlmLineRequest {
  lineNumber: number;
  content: string;
}

export interface LlmLineExplanation {
  lineNumber: number;
  tech: string;
  plain: string;
}

const DEFAULT_URL   = 'http://localhost:11434';
const DEFAULT_MODEL = 'qwen2.5:3b';
const REQUEST_TIMEOUT_MS = 60_000;

const SYSTEM_PROMPT = `You explain bash scripts to two audiences at once:

1. "tech" — a developer who knows shell. Use precise terminology, command names, flags.
2. "plain" — a non-technical reader. Use everyday language, no jargon, no command names unless unavoidable.

Be concise: 1–2 sentences per explanation. Be accurate: never invent behaviour. If a line is genuinely ambiguous, say so.

Always respond with valid JSON. Never wrap your response in markdown fences. Never add commentary outside the JSON.`;

/** Talks to a local Ollama daemon (`/api/chat`, JSON mode). Public surface
 *  is unchanged from the previous Anthropic-backed client so the rest of
 *  the explainer pipeline stays untouched. */
@Injectable()
export class LlmExplainerClient {
  private readonly logger = new Logger(LlmExplainerClient.name);
  private readonly url:   string;
  private readonly model: string;

  constructor() {
    this.url   = (process.env.OLLAMA_URL ?? DEFAULT_URL).trim();
    this.model = (process.env.OLLAMA_MODEL ?? DEFAULT_MODEL).trim() || DEFAULT_MODEL;
    if (!this.url) {
      this.logger.log('OLLAMA_URL not set — explainer LLM fallback disabled.');
    } else {
      this.logger.log(`Explainer LLM: ollama@${this.url} model=${this.model}`);
    }
  }

  isAvailable(): boolean {
    return this.url.length > 0;
  }

  async summarise(content: string): Promise<ScriptSummary | null> {
    const text = await this.chat(
      `Summarise what the following bash script does as a whole. Respond with JSON of shape {"tech": string, "plain": string}.\n\n<script>\n${content}\n</script>`,
    );
    if (text === null) return null;
    const parsed = safeJson<ScriptSummary>(text);
    if (parsed && typeof parsed.tech === 'string' && typeof parsed.plain === 'string') {
      return parsed;
    }
    this.logger.warn('LLM summary response was not in the expected shape.');
    return null;
  }

  async explainLines(
    lines: LlmLineRequest[],
  ): Promise<LlmLineExplanation[] | null> {
    if (lines.length === 0) return null;
    const text = await this.chat(
      'Explain each of the following bash lines. Respond with JSON of shape ' +
        '{"lines": [{"lineNumber": number, "tech": string, "plain": string}]}. ' +
        'The lineNumber values must match exactly.\n\n' +
        JSON.stringify({ lines }, null, 2),
    );
    if (text === null) return null;
    const parsed = safeJson<{ lines: LlmLineExplanation[] }>(text);
    if (!parsed || !Array.isArray(parsed.lines)) {
      this.logger.warn('LLM line explanation response was not in the expected shape.');
      return null;
    }
    return parsed.lines.filter(
      (l) =>
        typeof l.lineNumber === 'number' &&
        typeof l.tech === 'string' &&
        typeof l.plain === 'string',
    );
  }

  private async chat(userMessage: string): Promise<string | null> {
    if (!this.isAvailable()) return null;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
    try {
      const res = await fetch(`${this.url}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: this.model,
          stream: false,
          format: 'json',
          messages: [
            { role: 'system', content: SYSTEM_PROMPT },
            { role: 'user',   content: userMessage },
          ],
        }),
        signal: controller.signal,
      });
      if (!res.ok) {
        this.logger.warn(`Ollama responded with HTTP ${res.status}`);
        return null;
      }
      const body = (await res.json()) as { message?: { content?: string } };
      const content = body.message?.content?.trim();
      if (!content) {
        this.logger.warn('Ollama returned an empty message.content.');
        return null;
      }
      return content;
    } catch (err) {
      this.logger.warn(`Ollama call failed: ${(err as Error).message}`);
      return null;
    } finally {
      clearTimeout(timeout);
    }
  }
}

function safeJson<T>(text: string): T | null {
  if (!text) return null;
  const cleaned = text.trim().replace(/^```(?:json)?\s*/i, '').replace(/```$/, '').trim();
  try {
    return JSON.parse(cleaned) as T;
  } catch {
    return null;
  }
}
