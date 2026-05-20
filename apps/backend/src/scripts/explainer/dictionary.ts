// Bash line patterns mapped to developer (`tech`) and layperson (`plain`) phrasing.
// Order matters: more specific patterns must come before more general ones.
// `category` lets the templated summary group categories (e.g. "installs packages").

export type DictCategory =
  | 'shebang'
  | 'strictness'
  | 'control-flow'
  | 'variable'
  | 'export'
  | 'source'
  | 'navigation'
  | 'filesystem'
  | 'network'
  | 'package-install'
  | 'permissions'
  | 'privilege'
  | 'output'
  | 'process'
  | 'redirect';

export interface ExplainRule {
  pattern: RegExp;
  category: DictCategory;
  tech: string;
  plain: string;
}

const rules: ExplainRule[] = [
  // ── Shebang ─────────────────────────────────────────────────────────────────
  {
    pattern: /^#!\s*\/(?:usr\/)?(?:local\/)?bin\/(?:env\s+)?(?:ba)?sh/,
    category: 'shebang',
    tech: 'Shebang line — tells the OS to run this file under the bash/sh interpreter.',
    plain: 'Tells your computer to run the rest of this file as a shell script.',
  },

  // ── Strictness flags ────────────────────────────────────────────────────────
  {
    pattern: /^\s*set\s+-euo\s+pipefail\b/,
    category: 'strictness',
    tech: 'Enables strict mode: abort on error, on undefined variables, and on failed pipe stages.',
    plain: 'Tells the script to stop right away if anything unexpected happens.',
  },
  {
    pattern: /^\s*set\s+-e\b/,
    category: 'strictness',
    tech: 'Aborts the script if any command returns a non-zero exit code (`set -e`).',
    plain: 'Stops the script the moment any step fails.',
  },
  {
    pattern: /^\s*set\s+-u\b/,
    category: 'strictness',
    tech: 'Treats use of unset variables as an error (`set -u`).',
    plain: 'Treats missing settings as a mistake instead of silently ignoring them.',
  },
  {
    pattern: /^\s*set\s+-o\s+pipefail\b/,
    category: 'strictness',
    tech: 'Makes the script fail if any command in a pipeline fails (`set -o pipefail`).',
    plain: 'Catches failures even when commands are chained together.',
  },
  {
    pattern: /^\s*set\s+-x\b/,
    category: 'strictness',
    tech: 'Enables command tracing — every executed command is printed before it runs.',
    plain: 'Turns on a verbose mode that prints each step as it happens.',
  },

  // ── Package installs (specific before generic) ──────────────────────────────
  {
    pattern: /\bapt(?:-get)?\s+install\b\s+(?:-y\s+)?([^\s;&|]+)/,
    category: 'package-install',
    tech: 'Installs Debian/Ubuntu package(s) via apt: `$1`.',
    plain: 'Downloads and installs `$1` as a system program.',
  },
  {
    pattern: /\byum\s+install\b\s+(?:-y\s+)?([^\s;&|]+)/,
    category: 'package-install',
    tech: 'Installs RHEL/CentOS package(s) via yum: `$1`.',
    plain: 'Downloads and installs `$1` as a system program.',
  },
  {
    pattern: /\bdnf\s+install\b\s+(?:-y\s+)?([^\s;&|]+)/,
    category: 'package-install',
    tech: 'Installs Fedora package(s) via dnf: `$1`.',
    plain: 'Downloads and installs `$1` as a system program.',
  },
  {
    pattern: /\bbrew\s+install\b\s+([^\s;&|]+)/,
    category: 'package-install',
    tech: 'Installs package(s) via Homebrew: `$1`.',
    plain: 'Installs `$1` using the Homebrew package manager (macOS/Linux).',
  },
  {
    pattern: /\bpip3?\s+install\b\s+(?:-U\s+|--upgrade\s+)?([^\s;&|]+)/,
    category: 'package-install',
    tech: 'Installs Python package(s) via pip: `$1`.',
    plain: 'Installs the Python library `$1`.',
  },
  {
    pattern: /\bnpm\s+(?:install|i)\b(?:\s+-g)?\s+([^\s;&|]+)/,
    category: 'package-install',
    tech: 'Installs npm package(s): `$1`.',
    plain: 'Installs the JavaScript package `$1`.',
  },

  // ── Network ─────────────────────────────────────────────────────────────────
  {
    pattern: /\bcurl\b[^|]*\|\s*(?:ba)?sh/,
    category: 'network',
    tech: 'Pipes the response from `curl` straight into a shell — executes remote code unverified.',
    plain: 'Downloads code from the internet and runs it immediately, without checking it first.',
  },
  {
    pattern: /\bwget\b[^|]*\|\s*(?:ba)?sh/,
    category: 'network',
    tech: 'Pipes the response from `wget` straight into a shell — executes remote code unverified.',
    plain: 'Downloads code from the internet and runs it immediately, without checking it first.',
  },
  {
    pattern: /\bcurl\b\s+[^#\n]*?(https?:\/\/\S+)/,
    category: 'network',
    tech: 'Downloads data from `$1` via curl.',
    plain: 'Downloads something from the internet (`$1`).',
  },
  {
    pattern: /\bwget\b\s+[^#\n]*?(https?:\/\/\S+)/,
    category: 'network',
    tech: 'Downloads data from `$1` via wget.',
    plain: 'Downloads something from the internet (`$1`).',
  },

  // ── Privilege ───────────────────────────────────────────────────────────────
  {
    pattern: /^\s*sudo\s+(.+)$/,
    category: 'privilege',
    tech: 'Runs `$1` with elevated (root) privileges via sudo.',
    plain: 'Runs `$1` as an administrator — it can change important system files.',
  },
  {
    pattern: /^\s*su\s+(?:-|root)/,
    category: 'privilege',
    tech: 'Switches the current shell to the root user.',
    plain: 'Switches to the administrator account for the rest of the session.',
  },

  // ── Permissions ─────────────────────────────────────────────────────────────
  {
    pattern: /^\s*chmod\s+(?:-R\s+)?([0-7]{3,4}|\+x|u\+x)\s+(\S+)/,
    category: 'permissions',
    tech: 'Changes permissions of `$2` to `$1` (chmod).',
    plain: 'Changes who can read, write, or run `$2`.',
  },
  {
    pattern: /^\s*chown\s+(?:-R\s+)?(\S+)\s+(\S+)/,
    category: 'permissions',
    tech: 'Changes ownership of `$2` to `$1` (chown).',
    plain: 'Reassigns who owns `$2`.',
  },

  // ── Filesystem ──────────────────────────────────────────────────────────────
  {
    pattern: /^\s*rm\s+-[rf]{1,2}\s+(\S+)/,
    category: 'filesystem',
    tech: 'Recursively force-removes `$1`.',
    plain: 'Permanently deletes `$1` and everything inside it.',
  },
  {
    pattern: /^\s*rm\s+(\S+)/,
    category: 'filesystem',
    tech: 'Removes `$1`.',
    plain: 'Deletes the file `$1`.',
  },
  {
    pattern: /^\s*mkdir\s+(?:-p\s+)?(\S+)/,
    category: 'filesystem',
    tech: 'Creates directory `$1` (mkdir -p creates parents too).',
    plain: 'Creates a folder called `$1`.',
  },
  {
    pattern: /^\s*mv\s+(\S+)\s+(\S+)/,
    category: 'filesystem',
    tech: 'Moves/renames `$1` to `$2`.',
    plain: 'Moves or renames `$1` to `$2`.',
  },
  {
    pattern: /^\s*cp\s+(?:-r\s+)?(\S+)\s+(\S+)/,
    category: 'filesystem',
    tech: 'Copies `$1` to `$2`.',
    plain: 'Makes a copy of `$1` at `$2`.',
  },
  {
    pattern: /^\s*touch\s+(\S+)/,
    category: 'filesystem',
    tech: 'Creates an empty file at `$1` (or updates its timestamp).',
    plain: 'Creates an empty file called `$1`.',
  },
  {
    pattern: /^\s*ln\s+-s\s+(\S+)\s+(\S+)/,
    category: 'filesystem',
    tech: 'Creates a symbolic link `$2` pointing to `$1`.',
    plain: 'Creates a shortcut named `$2` that points to `$1`.',
  },

  // ── Navigation ──────────────────────────────────────────────────────────────
  {
    pattern: /^\s*cd\s+(\S+)/,
    category: 'navigation',
    tech: 'Changes the working directory to `$1`.',
    plain: 'Moves into the folder `$1`.',
  },
  {
    pattern: /^\s*pwd\b/,
    category: 'navigation',
    tech: 'Prints the current working directory.',
    plain: 'Shows which folder the script is currently in.',
  },

  // ── Variables / env ─────────────────────────────────────────────────────────
  {
    pattern: /^\s*export\s+([A-Z_][A-Z0-9_]*)\s*=/,
    category: 'export',
    tech: 'Exports environment variable `$1` to child processes.',
    plain: 'Saves the value `$1` so other commands can read it.',
  },
  {
    pattern: /^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*\S/,
    category: 'variable',
    tech: 'Assigns to local variable `$1`.',
    plain: 'Stores a value in `$1` so it can be reused later.',
  },
  {
    pattern: /^\s*(?:source|\.)\s+(\S+)/,
    category: 'source',
    tech: 'Sources `$1` — runs it in the current shell so variables/functions persist.',
    plain: 'Loads another script (`$1`) into this one.',
  },

  // ── Output ──────────────────────────────────────────────────────────────────
  {
    pattern: /^\s*echo\s+(.+)$/,
    category: 'output',
    tech: 'Prints text to stdout: `$1`.',
    plain: 'Prints a message to the screen.',
  },
  {
    pattern: /^\s*printf\s+/,
    category: 'output',
    tech: 'Prints formatted text to stdout (`printf`).',
    plain: 'Prints a formatted message to the screen.',
  },

  // ── Control flow ────────────────────────────────────────────────────────────
  {
    pattern: /^\s*if\s+/,
    category: 'control-flow',
    tech: 'Begins a conditional branch (`if`).',
    plain: 'Checks a condition and only continues if it is true.',
  },
  { pattern: /^\s*then\b\s*$/, category: 'control-flow',
    tech: 'Marks the start of the `if` body.',
    plain: 'Starts the actions to take when the check passed.' },
  { pattern: /^\s*elif\b/, category: 'control-flow',
    tech: 'Adds another conditional branch (`elif`).', plain: 'Checks another possibility.' },
  { pattern: /^\s*else\b\s*$/, category: 'control-flow',
    tech: 'Begins the fallback branch (`else`).', plain: 'Defines what to do otherwise.' },
  { pattern: /^\s*fi\b\s*$/, category: 'control-flow',
    tech: 'Closes the `if` block.', plain: 'Ends the if/else block.' },
  {
    pattern: /^\s*for\s+(\w+)\s+in\s+/,
    category: 'control-flow',
    tech: 'Loops, binding each value to `$1`.',
    plain: 'Repeats the next steps for each item in a list.',
  },
  { pattern: /^\s*while\s+/, category: 'control-flow',
    tech: 'Loops as long as the condition holds.',
    plain: 'Keeps repeating steps as long as a condition is true.' },
  { pattern: /^\s*do\b\s*$/, category: 'control-flow',
    tech: 'Marks the start of a loop body.', plain: 'Starts the repeated section.' },
  { pattern: /^\s*done\b\s*$/, category: 'control-flow',
    tech: 'Ends a loop block.', plain: 'Ends the repeated section.' },
  { pattern: /^\s*case\s+/, category: 'control-flow',
    tech: 'Begins a `case` switch.', plain: 'Picks one of several branches based on a value.' },
  { pattern: /^\s*esac\b/, category: 'control-flow',
    tech: 'Ends a `case` switch.', plain: 'Ends the multi-way branch.' },
  {
    pattern: /^\s*(?:function\s+)?([A-Za-z_][A-Za-z0-9_]*)\s*\(\)\s*\{?/,
    category: 'control-flow',
    tech: 'Defines function `$1`.',
    plain: 'Creates a reusable command called `$1`.',
  },

  // ── Process control ─────────────────────────────────────────────────────────
  { pattern: /^\s*exit\s+(\d+)/, category: 'process',
    tech: 'Exits the script with status `$1`.', plain: 'Stops the script with status `$1`.' },
  { pattern: /^\s*exit\b\s*$/, category: 'process',
    tech: 'Exits the script with status 0.', plain: 'Stops the script successfully.' },
  { pattern: /^\s*return\b/, category: 'process',
    tech: 'Returns from the current function.', plain: 'Ends the current sub-task.' },
  { pattern: /^\s*sleep\s+(\d+)/, category: 'process',
    tech: 'Pauses execution for `$1` seconds.', plain: 'Waits for `$1` seconds before continuing.' },
];

export const EXPLAIN_RULES = rules;

const CATEGORY_LABELS: Record<DictCategory, { tech: string; plain: string }> = {
  shebang:           { tech: 'declares a bash entrypoint',          plain: 'runs as a shell script' },
  strictness:        { tech: 'enables shell strict mode',           plain: 'is careful to stop on errors' },
  'control-flow':    { tech: 'uses conditional / loop control flow', plain: 'makes decisions and repeats steps' },
  variable:          { tech: 'defines local variables',             plain: 'remembers values for later' },
  export:            { tech: 'exports environment variables',       plain: 'sets values other programs can read' },
  source:            { tech: 'sources other scripts',               plain: 'loads other scripts into this one' },
  navigation:        { tech: 'changes the working directory',       plain: 'moves between folders' },
  filesystem:        { tech: 'creates/moves/deletes files',         plain: 'creates, moves, or deletes files' },
  network:           { tech: 'fetches data from the network',       plain: 'downloads things from the internet' },
  'package-install': { tech: 'installs system packages',            plain: 'installs new software on your computer' },
  permissions:       { tech: 'changes file permissions or ownership', plain: 'changes who can read or run files' },
  privilege:         { tech: 'requests root privileges',            plain: 'asks for administrator access' },
  output:            { tech: 'prints output',                       plain: 'prints messages to the screen' },
  process:           { tech: 'controls process flow',               plain: 'starts, stops, or waits' },
  redirect:          { tech: 'redirects input/output streams',      plain: 'sends output somewhere specific' },
};

// Build a templated summary from the set of categories that matched at least once
// in the script. Used when the LLM client is unavailable.
export function templatedSummary(
  categories: Set<DictCategory>,
): { tech: string; plain: string } {
  if (categories.size === 0) {
    return {
      tech: 'No recognised commands. The script content is unfamiliar to our local heuristics.',
      plain: 'We could not work out what this script does without help from the AI assistant.',
    };
  }
  const items = Array.from(categories).map((c) => CATEGORY_LABELS[c]);
  const join = (arr: string[]) =>
    arr.length <= 1
      ? arr.join('')
      : arr.length === 2
        ? `${arr[0]} and ${arr[1]}`
        : `${arr.slice(0, -1).join(', ')}, and ${arr[arr.length - 1]}`;

  return {
    tech: `This script ${join(items.map((i) => i.tech))}.`,
    plain: `This script ${join(items.map((i) => i.plain))}.`,
  };
}
