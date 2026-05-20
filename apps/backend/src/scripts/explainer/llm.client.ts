import { Injectable, Logger } from '@nestjs/common';
import Anthropic from '@anthropic-ai/sdk';

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

const DEFAULT_MODEL = 'claude-haiku-4-5-20251001';

const SYSTEM_PROMPT = `You explain bash scripts to two audiences at once:

1. "tech" — a developer who knows shell. Use precise terminology, command names, flags.
2. "plain" — a non-technical reader. Use everyday language, no jargon, no command names unless unavoidable.

Be concise: 1–2 sentences per explanation. Be accurate: never invent behaviour. If a line is genuinely ambiguous, say so.

Always respond with valid JSON. Never wrap your response in markdown fences. Never add commentary outside the JSON.`;

@Injectable()
export class LlmExplainerClient {
  private readonly logger = new Logger(LlmExplainerClient.name);
  private readonly client: Anthropic | null;
  private readonly model: string;

  constructor() {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    this.model = process.env.ANTHROPIC_MODEL ?? DEFAULT_MODEL;
    this.client = apiKey ? new Anthropic({ apiKey }) : null;
    if (!this.client) {
      this.logger.log('ANTHROPIC_API_KEY not set — explainer LLM fallback disabled.');
    }
  }

  isAvailable(): boolean {
    return this.client !== null;
  }

  async summarise(content: string): Promise<ScriptSummary | null> {
    if (!this.client) return null;
    try {
      const message = await this.client.messages.create({
        model: this.model,
        max_tokens: 600,
        system: [
          { type: 'text', text: SYSTEM_PROMPT, cache_control: { type: 'ephemeral' } },
        ],
        messages: [
          {
            role: 'user',
            content: `Summarise what the following bash script does as a whole. Respond with JSON of shape {"tech": string, "plain": string}.\n\n<script>\n${content}\n</script>`,
          },
        ],
      });
      const text = extractText(message);
      const parsed = safeJson<ScriptSummary>(text);
      if (parsed && typeof parsed.tech === 'string' && typeof parsed.plain === 'string') {
        return parsed;
      }
      this.logger.warn('LLM summary response was not in the expected shape.');
      return null;
    } catch (err) {
      this.logger.warn(`LLM summarise() failed: ${(err as Error).message}`);
      return null;
    }
  }

  async explainLines(
    lines: LlmLineRequest[],
  ): Promise<LlmLineExplanation[] | null> {
    if (!this.client || lines.length === 0) return null;
    try {
      const message = await this.client.messages.create({
        model: this.model,
        max_tokens: Math.min(4000, 200 + lines.length * 120),
        system: [
          { type: 'text', text: SYSTEM_PROMPT, cache_control: { type: 'ephemeral' } },
        ],
        messages: [
          {
            role: 'user',
            content:
              'Explain each of the following bash lines. Respond with JSON of shape ' +
              '{"lines": [{"lineNumber": number, "tech": string, "plain": string}]}. ' +
              'The lineNumber values must match exactly.\n\n' +
              JSON.stringify({ lines }, null, 2),
          },
        ],
      });
      const text = extractText(message);
      const parsed = safeJson<{ lines: LlmLineExplanation[] }>(text);
      if (parsed && Array.isArray(parsed.lines)) {
        return parsed.lines.filter(
          (l) =>
            typeof l.lineNumber === 'number' &&
            typeof l.tech === 'string' &&
            typeof l.plain === 'string',
        );
      }
      this.logger.warn('LLM line explanation response was not in the expected shape.');
      return null;
    } catch (err) {
      this.logger.warn(`LLM explainLines() failed: ${(err as Error).message}`);
      return null;
    }
  }
}

function extractText(message: Anthropic.Message): string {
  return message.content
    .filter((block): block is Anthropic.TextBlock => block.type === 'text')
    .map((block) => block.text)
    .join('');
}

function safeJson<T>(text: string): T | null {
  if (!text) return null;
  // Strip ```json ... ``` fences just in case the model ignored instructions.
  const cleaned = text.trim().replace(/^```(?:json)?\s*/i, '').replace(/```$/, '').trim();
  try {
    return JSON.parse(cleaned) as T;
  } catch {
    return null;
  }
}
