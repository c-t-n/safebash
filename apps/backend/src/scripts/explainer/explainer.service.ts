import { Injectable } from '@nestjs/common';
import {
  DictCategory,
  EXPLAIN_RULES,
  ExplainRule,
  templatedSummary,
} from './dictionary';
import { LlmExplainerClient, ScriptSummary } from './llm.client';

export interface LineExplanation {
  lineNumber: number;
  content: string;
  tech: string;
  plain: string;
  source: 'dict' | 'llm' | 'comment' | 'empty' | 'unknown';
}

export interface ScriptExplanation {
  summary: ScriptSummary;
  lines: LineExplanation[];
}

@Injectable()
export class ExplainerService {
  constructor(private readonly llm: LlmExplainerClient) {}

  async explain(content: string): Promise<ScriptExplanation> {
    const rawLines = content.split('\n');
    const lines: LineExplanation[] = [];
    const matchedCategories = new Set<DictCategory>();
    const unmatched: Array<{ index: number; lineNumber: number; content: string }> = [];

    rawLines.forEach((raw, idx) => {
      const lineNumber = idx + 1;
      const trimmed = raw.trim();

      if (trimmed.length === 0) {
        lines.push({
          lineNumber,
          content: raw,
          tech: '(blank line)',
          plain: '(blank line)',
          source: 'empty',
        });
        return;
      }

      if (trimmed.startsWith('#') && !trimmed.startsWith('#!')) {
        lines.push({
          lineNumber,
          content: raw,
          tech: 'Comment — ignored by the shell.',
          plain: 'A note left by the script author; the computer ignores it.',
          source: 'comment',
        });
        return;
      }

      const matched = matchRule(raw);
      if (matched) {
        matchedCategories.add(matched.rule.category);
        lines.push({
          lineNumber,
          content: raw,
          tech: matched.tech,
          plain: matched.plain,
          source: 'dict',
        });
        return;
      }

      lines.push({
        lineNumber,
        content: raw,
        tech: 'Unrecognised by local heuristics.',
        plain: 'We could not work out what this line does on our own.',
        source: 'unknown',
      });
      unmatched.push({ index: lines.length - 1, lineNumber, content: raw });
    });

    if (this.llm.isAvailable() && unmatched.length > 0) {
      const enriched = await this.llm.explainLines(
        unmatched.map((u) => ({ lineNumber: u.lineNumber, content: u.content })),
      );
      if (enriched) {
        const byLine = new Map(enriched.map((e) => [e.lineNumber, e]));
        for (const u of unmatched) {
          const e = byLine.get(u.lineNumber);
          if (e) {
            lines[u.index] = {
              ...lines[u.index],
              tech: e.tech,
              plain: e.plain,
              source: 'llm',
            };
          }
        }
      }
    }

    const summary = this.llm.isAvailable()
      ? (await this.llm.summarise(content)) ?? templatedSummary(matchedCategories)
      : templatedSummary(matchedCategories);

    return { summary, lines };
  }
}

function matchRule(
  raw: string,
): { rule: ExplainRule; tech: string; plain: string } | null {
  for (const rule of EXPLAIN_RULES) {
    const m = raw.match(rule.pattern);
    if (m) {
      return {
        rule,
        tech: interpolate(rule.tech, m),
        plain: interpolate(rule.plain, m),
      };
    }
  }
  return null;
}

function interpolate(template: string, match: RegExpMatchArray): string {
  return template.replace(/\$(\d)/g, (_, n) => match[Number(n)] ?? '');
}
