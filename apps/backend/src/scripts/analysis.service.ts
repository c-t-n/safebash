import { Injectable } from '@nestjs/common';
import { ExplainerService, LineExplanation } from './explainer/explainer.service';
import { ScriptSummary } from './explainer/llm.client';
import { ScriptFetcher } from './script-fetcher.service';

export interface AnalysisResult {
  trustScore: number;
  risks: string[];
  warnings: string[];
  safePatterns: string[];
  analyzedAt: Date;
  summary: ScriptSummary;
  lines: LineExplanation[];
}

interface Rule {
  pattern: RegExp;
  message: string;
  weight: number;
}

const RISKS: Rule[] = [
  { pattern: /rm\s+-[rf]{1,2}\s+\/(?:\s|$|\*)/, message: 'Deletes root filesystem (rm -rf /)', weight: 40 },
  { pattern: /:\(\)\s*\{\s*:\s*\|\s*:&\s*\}\s*;?\s*:/, message: 'Fork bomb pattern detected', weight: 40 },
  { pattern: /dd\s+if=\/dev\/(?:zero|urandom|random)\s+of=\/dev\/[a-z]/, message: 'Writes raw data to block device via dd', weight: 35 },
  { pattern: /\bmkfs\b/, message: 'Formats a filesystem (mkfs)', weight: 35 },
  { pattern: /curl[^#\n]*\|\s*(?:ba)?sh/, message: 'Pipes curl output directly to shell', weight: 30 },
  { pattern: /wget[^#\n]*\|\s*(?:ba)?sh/, message: 'Pipes wget output directly to shell', weight: 30 },
  { pattern: /base64\s+(?:-d|--decode)[^#\n]*\|\s*(?:ba)?sh/, message: 'Decodes and pipes base64 payload to shell', weight: 30 },
  { pattern: /eval\s+["'`$]/, message: 'Executes dynamically constructed code via eval', weight: 25 },
  { pattern: /chmod\s+(?:-R\s+)?777\s+\//, message: 'Sets world-writable permissions on system path', weight: 25 },
  { pattern: />>\s*\/etc\/(?:passwd|shadow|sudoers)/, message: 'Appends to critical authentication file', weight: 35 },
];

const WARNINGS: Rule[] = [
  { pattern: /\bsudo\b/, message: 'Uses sudo for elevated privileges', weight: 5 },
  { pattern: /\bsu\s+(?:-|root)/, message: 'Switches to root user', weight: 8 },
  { pattern: /\bcurl\b/, message: 'Makes network requests with curl', weight: 3 },
  { pattern: /\bwget\b/, message: 'Makes network requests with wget', weight: 3 },
  { pattern: /\bnc\b|\bnetcat\b/, message: 'Uses netcat for network connections', weight: 8 },
  { pattern: /apt(?:-get)?\s+install/, message: 'Installs system packages via apt', weight: 4 },
  { pattern: /\byum\s+install/, message: 'Installs system packages via yum', weight: 4 },
  { pattern: /\bbrew\s+install/, message: 'Installs packages via Homebrew', weight: 2 },
  { pattern: /\bcrontab\b/, message: 'Modifies scheduled cron jobs', weight: 6 },
  { pattern: />\s*~\/\.(?:bashrc|profile|bash_profile|zshrc)/, message: 'Overwrites shell configuration file', weight: 8 },
  { pattern: />\s*\/etc\//, message: 'Writes to system configuration directory', weight: 10 },
  { pattern: /\bchmod\b/, message: 'Changes file permissions', weight: 3 },
  { pattern: /\bchown\b/, message: 'Changes file ownership', weight: 3 },
];

const SAFE_PATTERNS: Array<{ pattern: RegExp; message: string; bonus: number }> = [
  { pattern: /^#!\/(?:usr\/)?(?:local\/)?bin\/(?:env\s+)?(?:ba)?sh/, message: 'Has proper shebang line', bonus: 5 },
  { pattern: /set\s+-e/, message: 'Exits on command failure (set -e)', bonus: 5 },
  { pattern: /set\s+-u/, message: 'Errors on undefined variables (set -u)', bonus: 5 },
  { pattern: /set\s+-o\s+pipefail/, message: 'Detects pipeline failures (set -o pipefail)', bonus: 5 },
  { pattern: /"(?:\$\w+|\$\{[^}]+\})"/, message: 'Properly quotes variable expansions', bonus: 3 },
];

@Injectable()
export class AnalysisService {
  constructor(
    private readonly explainer: ExplainerService,
    private readonly fetcher: ScriptFetcher,
  ) {}

  async analyze(content: string): Promise<AnalysisResult> {
    const risks: string[] = [];
    const warnings: string[] = [];
    const safePatterns: string[] = [];
    let penalty = 0;
    let bonus = 0;

    for (const rule of RISKS) {
      if (rule.pattern.test(content)) {
        risks.push(rule.message);
        penalty += rule.weight;
      }
    }

    for (const rule of WARNINGS) {
      if (rule.pattern.test(content)) {
        warnings.push(rule.message);
        penalty += rule.weight;
      }
    }

    for (const rule of SAFE_PATTERNS) {
      if (rule.pattern.test(content)) {
        safePatterns.push(rule.message);
        bonus += rule.bonus;
      }
    }

    const trustScore = Math.max(0, Math.min(100, 100 - penalty + Math.min(bonus, 20)));
    const { summary, lines } = await this.explainer.explain(content);

    // Per-line severity tagging. The explainer's `content` for each line
    // (and for block units) is the raw source span, so we just re-run the
    // rule patterns against it. Risks take precedence over warnings; we
    // keep the first matching rule's message as the severityReason so
    // the UI can surface it on hover.
    const annotatedLines = lines.map((line) => {
      const raw = line.content;
      const risk = RISKS.find((r) => r.pattern.test(raw));
      if (risk) {
        return { ...line, severity: 'risk' as const, severityReason: risk.message };
      }
      const warning = WARNINGS.find((w) => w.pattern.test(raw));
      if (warning) {
        return { ...line, severity: 'warning' as const, severityReason: warning.message };
      }
      return line;
    });

    return {
      trustScore,
      risks,
      warnings,
      safePatterns,
      analyzedAt: new Date(),
      summary,
      lines: annotatedLines,
    };
  }

  async analyzeFromUrl(url: string): Promise<AnalysisResult & { url: string }> {
    const content = await this.fetcher.fetchText(url);
    return { url, ...(await this.analyze(content)) };
  }
}
