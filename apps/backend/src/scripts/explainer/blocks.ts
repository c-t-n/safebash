// Detects multi-line bash control-flow blocks (if/case/for/while/until/function)
// and produces a single explanation for the whole block instead of line-by-line.
//
// Input: an array of "logical lines" (continuations already folded).
// Output: an array of units — each is either a single logical line or a block
// that spans several lines.

import { DictCategory } from './dictionary';

export type BlockKind = 'if' | 'case' | 'for' | 'while' | 'until' | 'function';

export interface LogicalLine {
  startLine: number;
  endLine: number;
  raw: string;
  joined: string;
}

export interface Block {
  kind: BlockKind;
  startLine: number;
  endLine: number;
  /** Raw content of every line in the block, joined by newlines. */
  raw: string;
  /** The opening line as folded — used to interpolate names/conditions. */
  opener: string;
}

export type Unit =
  | { type: 'line'; line: LogicalLine }
  | { type: 'block'; block: Block };

interface OpenBlock {
  kind: BlockKind;
  startLine: number;
  opener: string;
  rawLines: string[];
}

/** Returns the kind of block this line opens, or null. Single-line blocks
 *  (e.g. `if x; then y; fi`) are intentionally NOT detected as openers — the
 *  per-line dictionary already handles them well. */
function detectOpener(joined: string): BlockKind | null {
  const t = joined.trim();
  if (/^if\b/.test(t)        && !/\bfi\b\s*$/.test(t))   return 'if';
  if (/^case\b/.test(t)      && !/\besac\b\s*$/.test(t)) return 'case';
  if (/^for\b/.test(t)       && !/\bdone\b\s*$/.test(t)) return 'for';
  if (/^while\b/.test(t)     && !/\bdone\b\s*$/.test(t)) return 'while';
  if (/^until\b/.test(t)     && !/\bdone\b\s*$/.test(t)) return 'until';
  if (/^(?:function\s+)?[A-Za-z_]\w*\s*\(\)\s*\{?\s*$/.test(t)) {
    // Only treat as function block if there's no `}` on the same line.
    if (!/\}\s*$/.test(t)) return 'function';
  }
  return null;
}

/** Returns true when this line closes a block of the given kind. */
function isCloser(kind: BlockKind, joined: string): boolean {
  const t = joined.trim();
  switch (kind) {
    case 'if':       return /^fi\b\s*$/.test(t);
    case 'case':     return /^esac\b\s*$/.test(t);
    case 'for':
    case 'while':
    case 'until':    return /^done\b\s*$/.test(t);
    case 'function': return /^\}\s*$/.test(t);
  }
}

export function detectUnits(logical: LogicalLine[]): Unit[] {
  const units: Unit[] = [];
  const stack: OpenBlock[] = [];
  const rootStarts: number[] = []; // indices in `units` where each root-level open block will land

  for (const l of logical) {
    if (stack.length > 0) {
      // Inside an open block — collect raw, and watch for nested open/close.
      for (const b of stack) b.rawLines.push(l.raw);

      // Check close against the innermost block first.
      const top = stack[stack.length - 1];
      if (isCloser(top.kind, l.joined)) {
        const closed = stack.pop()!;
        if (stack.length === 0) {
          // Root-level block closed — emit the block unit now.
          units.push({
            type: 'block',
            block: {
              kind: closed.kind,
              startLine: closed.startLine,
              endLine: l.endLine,
              raw: closed.rawLines.join('\n'),
              opener: closed.opener,
            },
          });
          rootStarts.pop();
        }
        continue;
      }

      // Otherwise: maybe this line opens a nested block.
      const nested = detectOpener(l.joined);
      if (nested) {
        stack.push({
          kind: nested,
          startLine: l.startLine,
          opener: l.joined.trim(),
          rawLines: [l.raw],
        });
      }
      continue;
    }

    // Stack empty — see if this line opens a new block.
    const opener = detectOpener(l.joined);
    if (opener) {
      stack.push({
        kind: opener,
        startLine: l.startLine,
        opener: l.joined.trim(),
        rawLines: [l.raw],
      });
      rootStarts.push(units.length);
      continue;
    }

    // Plain line.
    units.push({ type: 'line', line: l });
  }

  // Any block left open at EOF is malformed; degrade gracefully by emitting
  // each of its lines individually so the user still gets per-line context.
  while (stack.length > 0) {
    const unfinished = stack.shift()!;
    // We need the original LogicalLine objects, but we only stored `raw`.
    // Reconstruct stub LogicalLines from the raw content so the caller can
    // still match them through the per-line dictionary.
    let cursor = unfinished.startLine;
    for (const raw of unfinished.rawLines) {
      const endLine = cursor + raw.split('\n').length - 1;
      units.push({
        type: 'line',
        line: { startLine: cursor, endLine, raw, joined: raw.replace(/\\\n\s*/g, ' ').trim() },
      });
      cursor = endLine + 1;
    }
  }

  return units;
}

/** For function blocks, returns the function name (without parens). Other
 *  kinds return undefined. */
export function blockSymbolName(block: Block): string | undefined {
  if (block.kind !== 'function') return undefined;
  const m = block.opener.match(/^(?:function\s+)?([A-Za-z_]\w*)\s*\(\)/);
  return m?.[1];
}

/** Builds the tech/plain explanation for a detected block. */
export function explainBlock(block: Block): { tech: string; plain: string; category: DictCategory } {
  switch (block.kind) {
    case 'if': {
      const cond = block.opener.replace(/^if\s+/, '').replace(/;?\s*then\s*$/, '').trim();
      return {
        tech: `Conditional block: runs the body when \`${cond}\` succeeds (and any \`else\`/\`elif\` branches otherwise).`,
        plain: `Checks whether ${cond || 'a condition holds'}, and runs different steps depending on the answer.`,
        category: 'control-flow',
      };
    }
    case 'case': {
      const m = block.opener.match(/^case\s+(\S+)/);
      const expr = m?.[1] ?? 'a value';
      return {
        tech: `Multi-way branch on \`${expr}\` (\`case\`/\`esac\`).`,
        plain: `Picks one of several sets of steps depending on the value of ${expr}.`,
        category: 'control-flow',
      };
    }
    case 'for': {
      const m = block.opener.match(/^for\s+(\w+)\s+in\s+(.+?)(?:;\s*do\s*)?\s*$/);
      const v = m?.[1] ?? 'item';
      const list = (m?.[2] ?? 'a list').trim();
      return {
        tech: `Iterates: binds \`${v}\` to each value in \`${list}\` and runs the loop body.`,
        plain: `Repeats the inner steps for every item in ${list} (each one called ${v}).`,
        category: 'control-flow',
      };
    }
    case 'while': {
      const cond = block.opener.replace(/^while\s+/, '').replace(/;?\s*do\s*$/, '').trim();
      return {
        tech: `Loops while \`${cond}\` succeeds.`,
        plain: `Keeps repeating the inner steps as long as ${cond || 'a condition holds'}.`,
        category: 'control-flow',
      };
    }
    case 'until': {
      const cond = block.opener.replace(/^until\s+/, '').replace(/;?\s*do\s*$/, '').trim();
      return {
        tech: `Loops until \`${cond}\` succeeds.`,
        plain: `Keeps repeating the inner steps until ${cond || 'a condition holds'}.`,
        category: 'control-flow',
      };
    }
    case 'function': {
      const m = block.opener.match(/^(?:function\s+)?([A-Za-z_]\w*)\s*\(\)/);
      const name = m?.[1] ?? 'a function';
      return {
        tech: `Defines function \`${name}\` — wraps the body so it can be invoked by name later.`,
        plain: `Creates a reusable command called \`${name}\` that runs the steps inside whenever it is called.`,
        category: 'control-flow',
      };
    }
  }
}
