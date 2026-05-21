// shared.jsx — sample data + tiny atoms shared across variants
// Exposed via window.* at bottom.

const SAMPLE_URL = "https://install.nodefoundry.dev/install.sh";
const PUBLIC_HOST = "safebash.dev";
const SAMPLE_SLUG = "nodefoundry";

// Annotated lines — each is { n, code, risk?: 'low'|'med'|'high', note?: string }
const SAMPLE_BASH = [
  { n: 1,  code: "#!/usr/bin/env bash" },
  { n: 2,  code: "# nodefoundry-install · v2.4.1  ·  sha256:e7c3…91af" },
  { n: 3,  code: "set -euo pipefail" },
  { n: 4,  code: "" },
  { n: 5,  code: 'NF_VERSION="${NF_VERSION:-2.4.1}"' },
  { n: 6,  code: 'NF_HOME="${NF_HOME:-$HOME/.nodefoundry}"' },
  { n: 7,  code: 'NF_MIRROR="https://dist.nodefoundry.dev"' },
  { n: 8,  code: "" },
  { n: 9,  code: 'mkdir -p "$NF_HOME/bin" "$NF_HOME/cache"', risk: "low", note: "Creates ~/.nodefoundry — user-scope, no sudo." },
  { n: 10, code: 'echo "→ fetching nodefoundry $NF_VERSION"' },
  { n: 11, code: "" },
  { n: 12, code: 'archive="$NF_MIRROR/release/$NF_VERSION/nf-$(uname -s)-$(uname -m).tar.gz"', risk: "low" },
  { n: 13, code: 'curl -fsSL --proto "=https" --tlsv1.2 -o "$NF_HOME/cache/nf.tgz" "$archive"', risk: "med", note: "Network egress to dist.nodefoundry.dev · TLS pinned, signature verified below." },
  { n: 14, code: "" },
  { n: 15, code: '# verify signature against pinned cosign key', risk: "low" },
  { n: 16, code: 'cosign verify-blob \\' },
  { n: 17, code: '  --key "$NF_MIRROR/keys/release.pub" \\' },
  { n: 18, code: '  --signature "$archive.sig" \\' },
  { n: 19, code: '  "$NF_HOME/cache/nf.tgz" >/dev/null', risk: "low", note: "Cosign verification — fail-closed if signature mismatch." },
  { n: 20, code: "" },
  { n: 21, code: 'tar -xzf "$NF_HOME/cache/nf.tgz" -C "$NF_HOME/bin" --strip-components=1' },
  { n: 22, code: 'chmod +x "$NF_HOME/bin/nf"', risk: "low" },
  { n: 23, code: "" },
  { n: 24, code: '# add to PATH if missing', risk: "med", note: "Modifies ~/.bashrc and ~/.zshrc — non-destructive append, idempotent." },
  { n: 25, code: 'for rc in "$HOME/.bashrc" "$HOME/.zshrc"; do' },
  { n: 26, code: '  [ -f "$rc" ] || continue' },
  { n: 27, code: '  grep -q "NF_HOME" "$rc" || cat >> "$rc" <<EOF' },
  { n: 28, code: 'export NF_HOME="$HOME/.nodefoundry"' },
  { n: 29, code: 'export PATH="$NF_HOME/bin:$PATH"' },
  { n: 30, code: "EOF" },
  { n: 31, code: "done" },
  { n: 32, code: "" },
  { n: 33, code: 'echo "✓ nodefoundry $NF_VERSION installed at $NF_HOME"' },
  { n: 34, code: 'echo "  run: nf doctor"' },
];

const SIGNALS = {
  score: 86,
  verdict: "trusted",          // trusted | caution | danger
  hash: "sha256:e7c3a91f902b…91af0c",
  signed: true,
  signedBy: "nodefoundry-release  ·  cosign  ·  pinned key",
  firstSeen: "2024-03-11",
  lastReviewed: "2 days ago",
  publisher: "nodefoundry.dev",
  publisherVerified: true,
  size: "3.1 KB",
  lines: 34,
  vouches: 1247,
  reviewers: 6,
  diff: { added: 2, removed: 1, prevVersion: "2.4.0" },
};

const ACTIONS = [
  { kind: "fs",   level: "med",  label: "Creates ~/.nodefoundry",            detail: "User-scope · no sudo" },
  { kind: "fs",   level: "med",  label: "Appends to ~/.bashrc, ~/.zshrc",     detail: "Idempotent · no overwrite" },
  { kind: "net",  level: "med",  label: "curl → dist.nodefoundry.dev",         detail: "TLS 1.2+ pinned · 1 destination" },
  { kind: "sig",  level: "low",  label: "cosign signature verification",       detail: "Fail-closed if mismatch" },
  { kind: "exec", level: "low",  label: "Extracts tarball, chmod +x",          detail: "No nested curl|sh · no eval" },
  { kind: "priv", level: "low",  label: "Runs as $USER",                       detail: "No sudo, no setuid" },
];

const NETWORK = [
  { host: "dist.nodefoundry.dev", ip: "104.21.34.18", port: 443, proto: "HTTPS", reputation: "verified", note: "Cloudflare · Cert valid 187d" },
];

const FILES_TOUCHED = [
  { path: "~/.nodefoundry/bin/nf",      op: "create",  perms: "0755" },
  { path: "~/.nodefoundry/cache/nf.tgz", op: "create",  perms: "0644" },
  { path: "~/.bashrc",                  op: "append",  perms: "—" },
  { path: "~/.zshrc",                   op: "append",  perms: "—" },
];

const DIFF_LINES = [
  { n: 5,  kind: "ctx", code: 'NF_VERSION="${NF_VERSION:-2.4.1}"' },
  { n: 6,  kind: "ctx", code: 'NF_HOME="${NF_HOME:-$HOME/.nodefoundry}"' },
  { n: 12, kind: "del", code: 'curl -fsSL -o "$NF_HOME/cache/nf.tgz" "$archive"' },
  { n: 12, kind: "add", code: 'curl -fsSL --proto "=https" --tlsv1.2 -o "$NF_HOME/cache/nf.tgz" "$archive"' },
  { n: 19, kind: "add", code: 'cosign verify-blob --key … "$NF_HOME/cache/nf.tgz"' },
];

const COMMUNITY = [
  { who: "@charliehoover", role: "verified reviewer", when: "2d", vote: "trust", body: "Cosign verification is pinned correctly. TLS proto flag is a nice touch." },
  { who: "@maintainerd",    role: "verified reviewer", when: "5d", vote: "trust", body: "Diff against 2.4.0 is small — just hardening. No new network egress." },
  { who: "@runa-sec",       role: "community",          when: "1w", vote: "trust", body: "Read the tarball contents, matches manifest. Looks clean." },
];

const LIBRARY = [
  { name: "nodefoundry",  slug:"nodefoundry",  v: "2.4.1",  verdict: "trusted",  score: 86, who: "nodefoundry.dev",     when: "today",   vouches: "1.2k", saved: true,  current: true,  host:"github",   repo:"nodefoundry-dev/installer",        installs: "34k" },
  { name: "rustup",       slug:"rustup",       v: "1.27.1", verdict: "trusted",  score: 94, who: "rust-lang.org",       when: "3d ago",  vouches: "48k",  saved: true,                  host:"github",   repo:"rust-lang/rustup",                 installs: "2.4M" },
  { name: "homebrew",     slug:"brew",         v: "4.3.0",  verdict: "trusted",  score: 91, who: "brew.sh",             when: "5d ago",  vouches: "112k", saved: true,                  host:"github",   repo:"Homebrew/install",                 installs: "8.1M" },
  { name: "deno",         slug:"deno",         v: "1.44.4", verdict: "trusted",  score: 88, who: "deno.com",            when: "1w ago",  vouches: "9.4k", saved: false,                 host:"github",   repo:"denoland/deno_install",            installs: "612k" },
  { name: "ollama",       slug:"ollama",       v: "0.1.39", verdict: "caution",  score: 64, who: "ollama.ai",           when: "1w ago",  vouches: "8.1k", saved: true,                  host:"github",   repo:"ollama/ollama",                    installs: "480k" },
  { name: "starship",     slug:"starship",     v: "1.20.1", verdict: "trusted",  score: 90, who: "starship.rs",         when: "2w ago",  vouches: "22k",  saved: false,                 host:"safebash",                                          installs: "210k" },
  { name: "pixi",         slug:"pixi",         v: "0.24.2", verdict: "trusted",  score: 82, who: "prefix.dev",          when: "2w ago",  vouches: "3.2k", saved: false,                 host:"github",   repo:"prefix-dev/pixi",                  installs: "54k" },
  { name: "atuin",        slug:"atuin",        v: "18.3.0", verdict: "caution",  score: 71, who: "atuin.sh",            when: "3w ago",  vouches: "5.6k", saved: false,                 host:"safebash",                                          installs: "38k" },
  { name: "fly-cli-rc",   slug:"fly-cli-rc",   v: "—",      verdict: "danger",   score: 22, who: "unknown · typosquat",  when: "3w ago",  vouches: "0",    saved: false,                 host:"github",   repo:"unknown-user/fly-cli", flagged:true, installs: "—" },
  { name: "zoxide",       slug:"zoxide",       v: "0.9.4",  verdict: "trusted",  score: 89, who: "ajeetdsouza",         when: "1mo ago", vouches: "11k",  saved: false,                 host:"github",   repo:"ajeetdsouza/zoxide",               installs: "87k" },
];

// ─── Helpers ────────────────────────────────────────────────────────────────

function classNames(...parts) {
  return parts.filter(Boolean).join(" ");
}

// Inline SVG icon system — generic glyphs only (no logos, no faces).
function Icon({ name, size = 14, stroke = 1.6, ...rest }) {
  const paths = {
    shield:   <><path d="M12 3l8 3v6c0 5-3.5 8.5-8 9-4.5-.5-8-4-8-9V6l8-3z"/></>,
    check:    <><path d="M4 12l5 5 11-11"/></>,
    alert:    <><path d="M12 9v4"/><path d="M12 17h.01"/><path d="M10.3 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.7 3.86a2 2 0 0 0-3.4 0z"/></>,
    x:        <><path d="M18 6L6 18"/><path d="M6 6l12 12"/></>,
    lock:     <><rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/></>,
    key:      <><circle cx="8" cy="15" r="3"/><path d="M10.5 12.5L21 2"/><path d="M17 6l3 3"/><path d="M14 9l3 3"/></>,
    eye:      <><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8S1 12 1 12z"/><circle cx="12" cy="12" r="3"/></>,
    upload:   <><path d="M12 17V3"/><path d="M5 10l7-7 7 7"/><path d="M3 21h18"/></>,
    file:     <><path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/><path d="M14 3v6h6"/></>,
    link:     <><path d="M10 14a5 5 0 0 0 7.07 0l3-3a5 5 0 1 0-7.07-7.07L11 5.93"/><path d="M14 10a5 5 0 0 0-7.07 0l-3 3a5 5 0 1 0 7.07 7.07L13 18.07"/></>,
    terminal: <><path d="M4 17l6-6-6-6"/><path d="M12 19h8"/></>,
    user:     <><circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/></>,
    git:      <><circle cx="6" cy="6" r="2"/><circle cx="6" cy="18" r="2"/><circle cx="18" cy="12" r="2"/><path d="M6 8v8"/><path d="M6 12h8a4 4 0 0 0 4-4"/></>,
    network:  <><circle cx="12" cy="12" r="9"/><path d="M3 12h18"/><path d="M12 3a14 14 0 0 1 0 18"/><path d="M12 3a14 14 0 0 0 0 18"/></>,
    folder:   <><path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></>,
    diff:     <><path d="M12 3v18"/><path d="M8 7h8"/><path d="M8 17h8"/><path d="M8 12h2"/><path d="M14 12h2"/></>,
    clock:    <><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></>,
    star:     <><path d="M12 2l3 6.9 7.5.7-5.6 5 1.7 7.4L12 18.3 5.4 22l1.7-7.4L1.5 9.6 9 8.9z"/></>,
    chevron:  <><path d="M9 6l6 6-6 6"/></>,
    search:   <><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></>,
    sliders:  <><path d="M4 21V14M4 10V3M12 21v-9M12 8V3M20 21v-5M20 12V3M1 14h6M9 8h6M17 16h6"/></>,
    play:     <><path d="M6 4l14 8-14 8z"/></>,
    sparkle:  <><path d="M12 3l1.7 5.3L19 10l-5.3 1.7L12 17l-1.7-5.3L5 10l5.3-1.7z"/><path d="M19 17l.7 1.6L21 19l-1.3.4-.7 1.6-.7-1.6L17 19l1.3-.4z"/></>,
    info:     <><circle cx="12" cy="12" r="9"/><path d="M12 8h.01"/><path d="M11 12h1v5h1"/></>,
    plus:     <><path d="M12 5v14M5 12h14"/></>,
    pin:      <><path d="M12 17v5"/><path d="M9 9V4h6v5l3 4H6z"/></>,
    arrowDown:<><path d="M12 5v14M5 12l7 7 7-7"/></>,
    bolt:     <><path d="M13 2L4 14h7l-1 8 9-12h-7z"/></>,
    hash:     <><path d="M4 9h16M4 15h16M10 3L8 21M16 3l-2 18"/></>,
  };
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor"
         strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round" {...rest}>
      {paths[name] || null}
    </svg>
  );
}

Object.assign(window, {
  SAMPLE_URL, PUBLIC_HOST, SAMPLE_SLUG, SAMPLE_BASH, SIGNALS, ACTIONS, NETWORK,
  FILES_TOUCHED, DIFF_LINES, COMMUNITY, LIBRARY, classNames, Icon,
});
