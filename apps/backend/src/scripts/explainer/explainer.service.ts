import { Injectable } from '@nestjs/common';
import {
  DictCategory,
  EXPLAIN_RULES,
  ExplainRule,
  templatedSummary,
} from './dictionary';
import { LlmExplainerClient, ScriptSummary } from './llm.client';
import { BlockKind, blockSymbolName, detectUnits, explainBlock, LogicalLine } from './blocks';

export interface LineExplanation {
  lineNumber: number;
  /** When the logical command spans several physical lines, the final one. */
  endLineNumber?: number;
  /** Raw content as written; preserves newlines for multi-line commands. */
  content: string;
  tech: string;
  plain: string;
  source: 'dict' | 'llm' | 'comment' | 'empty' | 'unknown' | 'block';
  /** For block units, the structural kind (if / for / function / …). */
  blockKind?: BlockKind;
  /** For function blocks, the name of the function (without parens). */
  symbolName?: string;
  /**
   * Set by AnalysisService when the line's raw content matches a known
   * risk or warning pattern. Drives row highlighting in the UI.
   */
  severity?: 'risk' | 'warning';
  /** Human-readable description of the matched rule (for tooltip / a11y). */
  severityReason?: string;
}

export interface ScriptExplanation {
  summary: ScriptSummary;
  lines: LineExplanation[];
}

function endsWithContinuation(line: string): boolean {
  const m = line.match(/(\\+)$/);
  if (!m) return false;
  return m[1].length % 2 === 1;
}

/** Folds bash backslash continuations into a single logical line. */
function foldLogicalLines(content: string): LogicalLine[] {
  const raw = content.split('\n');
  const out: LogicalLine[] = [];
  let i = 0;
  while (i < raw.length) {
    const start = i + 1;
    const buf = [raw[i]];
    while (i < raw.length - 1 && endsWithContinuation(raw[i])) {
      i++;
      buf.push(raw[i]);
    }
    const end = i + 1;
    const joined = buf
      .map((l, idx) => (idx < buf.length - 1 ? l.replace(/\\+$/, '') : l))
      .join(' ')
      .replace(/\s+/g, ' ')
      .trim();
    out.push({ startLine: start, endLine: end, raw: buf.join('\n'), joined });
    i++;
  }
  return out;
}

@Injectable()
export class ExplainerService {
  constructor(private readonly llm: LlmExplainerClient) {}

  async explain(content: string): Promise<ScriptExplanation> {
    const logical = foldLogicalLines(content);
    const units = detectUnits(logical);
    const lines: LineExplanation[] = [];
    const matchedCategories = new Set<DictCategory>();
    const unmatched: Array<{ index: number; lineNumber: number; content: string }> = [];
    // Function blocks queued for an LLM pass — we always populate a templated
    // fallback first so the response degrades gracefully if the LLM is down.
    const functions: Array<{
      index: number;
      lineNumber: number;
      name: string;
      source: string;
    }> = [];

    for (const unit of units) {
      if (unit.type === 'block') {
        const b = unit.block;
        const explanation = explainBlock(b);
        const symbolName = blockSymbolName(b);
        matchedCategories.add(explanation.category);
        const idx = lines.length;
        lines.push({
          lineNumber: b.startLine,
          endLineNumber: b.endLine !== b.startLine ? b.endLine : undefined,
          content: b.raw,
          tech: explanation.tech,
          plain: explanation.plain,
          source: 'block',
          blockKind: b.kind,
          ...(symbolName ? { symbolName } : {}),
        });
        if (b.kind === 'function') {
          functions.push({
            index: idx,
            lineNumber: b.startLine,
            name: symbolName ?? '(anonymous)',
            source: b.raw,
          });
        }
        continue;
      }

      const l = unit.line;
      const base = {
        lineNumber: l.startLine,
        ...(l.endLine !== l.startLine ? { endLineNumber: l.endLine } : {}),
        content: l.raw,
      };
      const trimmed = l.joined.trim();

      if (trimmed.length === 0) {
        lines.push({
          ...base,
          tech: '(blank line)',
          plain: '(blank line)',
          source: 'empty',
        });
        continue;
      }

      if (trimmed.startsWith('#') && !trimmed.startsWith('#!')) {
        lines.push({
          ...base,
          tech: 'Comment — ignored by the shell.',
          plain: 'A note left by the script author; the computer ignores it.',
          source: 'comment',
        });
        continue;
      }

      const matched = matchRule(l.joined);
      if (matched) {
        matchedCategories.add(matched.rule.category);
        lines.push({
          ...base,
          tech: matched.tech,
          plain: matched.plain,
          source: 'dict',
        });
        continue;
      }

      lines.push({
        ...base,
        tech: 'Unrecognised by local heuristics.',
        plain: 'We could not work out what this line does on our own.',
        source: 'unknown',
      });
      unmatched.push({ index: lines.length - 1, lineNumber: l.startLine, content: l.joined });
    }

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

    // Functions get a dedicated LLM pass — the templated explainBlock() text
    // is generic ("Creates a reusable command called X…") and rarely useful.
    // We keep `source: 'block'` + `blockKind: 'function'` so the frontend
    // folding UI still treats them as collapsible symbols.
    if (this.llm.isAvailable() && functions.length > 0) {
      const enriched = await this.llm.explainFunctions(
        functions.map((f) => ({ lineNumber: f.lineNumber, name: f.name, source: f.source })),
      );
      if (enriched) {
        const byLine = new Map(enriched.map((e) => [e.lineNumber, e]));
        for (const f of functions) {
          const e = byLine.get(f.lineNumber);
          if (e) {
            lines[f.index] = {
              ...lines[f.index],
              tech: e.tech,
              plain: e.plain,
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
