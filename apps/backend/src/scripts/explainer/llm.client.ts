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

export interface LlmFunctionRequest {
  /** First line of the function definition — used as the routing key. */
  lineNumber: number;
  /** Function name (without parens) or '(anonymous)'. */
  name: string;
  /** Full source of the function (signature + body, multiple lines). */
  source: string;
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

  /** Explains bash *functions* (multi-line definitions) in one batched call.
   *  Returns one tech/plain pair per requested function, keyed by its opening
   *  line number. Same null-on-failure contract as explainLines(). */
  async explainFunctions(
    funcs: LlmFunctionRequest[],
  ): Promise<LlmLineExplanation[] | null> {
    if (funcs.length === 0) return null;
    // We deliberately keep the same `lines` wrapper for input and output so
    // small models (qwen2.5:3b in particular) don't echo the input wrapper
    // key back. The per-entry fields tell the model these are functions.
    const payload = funcs.map((f) => ({
      lineNumber: f.lineNumber,
      functionName: f.name,
      bashSource: f.source,
    }));
    const text = await this.chat(
      'For each entry below, explain what the bash function does as a whole — ' +
        'its overall purpose and effects, not a line-by-line walkthrough. ' +
        'Each input entry has: lineNumber (the line where the function starts), ' +
        'functionName, and bashSource (the full multi-line definition).\n\n' +
        'Respond with JSON of shape ' +
        '{"lines": [{"lineNumber": number, "tech": string, "plain": string}]}. ' +
        'Use the exact same "lines" key. Echo each lineNumber unchanged. ' +
        'Do not include functionName or bashSource in your output.\n\n' +
        JSON.stringify({ lines: payload }, null, 2),
    );
    if (text === null) return null;
    const parsed = safeJson<Record<string, unknown>>(text);
    // Some small models stubbornly mirror a different wrapper key; accept any
    // top-level array so a well-formed payload isn't thrown away.
    const arr =
      (parsed && (parsed as { lines?: unknown }).lines) ||
      (parsed && (parsed as { functions?: unknown }).functions) ||
      (Array.isArray(parsed) ? parsed : null);
    if (!Array.isArray(arr)) {
      this.logger.warn('LLM function explanation response was not in the expected shape.');
      return null;
    }
    const out: LlmLineExplanation[] = [];
    for (const item of arr) {
      if (!item || typeof item !== 'object') continue;
      const o = item as Record<string, unknown>;
      // Coerce stringy line numbers to int — another common small-model habit.
      const ln = typeof o.lineNumber === 'number'
        ? o.lineNumber
        : typeof o.lineNumber === 'string'
          ? Number.parseInt(o.lineNumber, 10)
          : NaN;
      if (!Number.isFinite(ln)) continue;
      if (typeof o.tech !== 'string' || typeof o.plain !== 'string') continue;
      out.push({ lineNumber: ln, tech: o.tech, plain: o.plain });
    }
    return out;
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
