import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  AlertTriangle, Braces, Check, ChevronDown, ChevronLeft, ChevronRight,
  Clipboard, FileCode, Pencil, RefreshCw, X,
} from 'lucide-react';
import { getScript, reanalyzeScript, updateScript } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { Layout } from '../components/Layout';
import type { LineExplanation, Script } from '../types';

type Vocab = 'plain' | 'tech';
type Verdict = 'trusted' | 'caution' | 'danger';

function verdictOf(score: number): Verdict {
  if (score >= 80) return 'trusted';
  if (score >= 50) return 'caution';
  return 'danger';
}
function verdictColor(v: Verdict): string {
  return v === 'trusted' ? 'var(--good)' : v === 'caution' ? 'var(--warn)' : 'var(--bad)';
}

function VerdictRing({ score }: { score: number }) {
  const v = verdictOf(score);
  const c = verdictColor(v);
  const r = 44;
  const C = 2 * Math.PI * r;
  const off = C * (1 - score / 100);
  return (
    <div className="verdict-ring">
      <svg width="120" height="120" viewBox="0 0 120 120">
        <circle cx="60" cy="60" r={r} fill="none" stroke="var(--line)" strokeWidth="8" />
        <circle
          cx="60" cy="60" r={r} fill="none" stroke={c} strokeWidth="8"
          strokeLinecap="round" strokeDasharray={C} strokeDashoffset={off}
          transform="rotate(-90 60 60)"
        />
      </svg>
      <div className="verdict-ring-text">
        <div>
          <div className="verdict-ring-score" style={{ color: c }}>{score}</div>
          <div className="verdict-ring-label" style={{ color: c }}>{v}</div>
        </div>
      </div>
    </div>
  );
}

function SubScore({ label, value, max = 100 }: { label: string; value: number; max?: number }) {
  const pct = Math.round((value / max) * 100);
  const c = pct >= 80 ? 'var(--good)' : pct >= 60 ? 'var(--warn)' : 'var(--bad)';
  return (
    <div className="subscore">
      <div className="subscore-head">
        <span className="subscore-label">{label}</span>
        <span className="subscore-value">{value}/{max}</span>
      </div>
      <div className="subscore-bar"><div className="subscore-fill" style={{ width: `${pct}%`, background: c }} /></div>
    </div>
  );
}

function Findings({
  title, items, tone,
}: {
  title: string;
  items: string[];
  tone: 'danger' | 'warn' | 'good';
}) {
  if (items.length === 0) return null;
  return (
    <div className="findings">
      <div className={`findings-title findings-title--${tone}`}>{title}</div>
      <ul className="findings-list">
        {items.map((it, i) => <li key={i}>{it}</li>)}
      </ul>
    </div>
  );
}

function VocabToggle({ value, onChange }: { value: Vocab; onChange: (v: Vocab) => void }) {
  return (
    <div className="seg">
      <button type="button" className={`seg-btn${value === 'plain' ? ' active' : ''}`} onClick={() => onChange('plain')}>plain</button>
      <button type="button" className={`seg-btn${value === 'tech'  ? ' active' : ''}`} onClick={() => onChange('tech')}>tech</button>
    </div>
  );
}

const isExplanationVisible = (l: LineExplanation): boolean =>
  l.source !== 'empty' && l.source !== 'comment';

const isFunction = (l: LineExplanation): boolean =>
  l.source === 'block' && l.blockKind === 'function';

function lineLabel(l: LineExplanation): string {
  return l.endLineNumber && l.endLineNumber !== l.lineNumber
    ? `${l.lineNumber}–${l.endLineNumber}`
    : String(l.lineNumber);
}

function rowToneFor(source: LineExplanation['source']): string {
  if (source === 'unknown') return 'code-row--med';
  if (source === 'block')   return 'code-row--block';
  return '';
}

function ExplanationCode({
  lines, vocab, expandedFns, onToggleFn,
}: {
  lines: LineExplanation[];
  vocab: Vocab;
  expandedFns: Set<number>;
  onToggleFn: (lineNumber: number) => void;
}) {
  const visible = lines.filter(isExplanationVisible);
  return (
    <div className="code-grid">
      {visible.map((l) => {
        const icon = l.source === 'unknown'
          ? <AlertTriangle size={11} strokeWidth={2.2} />
          : <Check size={11} strokeWidth={2.5} />;
        const explanationColor = l.source === 'unknown' ? 'var(--warn)' : 'var(--good)';

        if (isFunction(l)) {
          const expanded = expandedFns.has(l.lineNumber);
          const firstLine = l.content.split('\n')[0];
          const hiddenLines = (l.endLineNumber ?? l.lineNumber) - l.lineNumber;
          return (
            <div
              key={l.lineNumber}
              id={`symbol-${l.lineNumber}`}
              className={`code-line code-row--block code-row--fn${expanded ? ' code-row--fn-open' : ''}`}
            >
              <div className="code-num">{lineLabel(l)}</div>
              <div className="code-body">
                <div className="fn-header">
                  <button
                    type="button"
                    className="fn-toggle"
                    onClick={() => onToggleFn(l.lineNumber)}
                    aria-label={expanded ? 'collapse function' : 'expand function'}
                    aria-expanded={expanded}
                  >
                    {expanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
                  </button>
                  <code className="fn-signature">
                    {expanded
                      ? l.content
                      : <>{firstLine} <span className="fn-fold-tag">{'{ … }'}</span></>}
                  </code>
                </div>
                {!expanded && hiddenLines > 0 && (
                  <div className="fn-fold-meta">{hiddenLines} {hiddenLines === 1 ? 'line' : 'lines'} folded</div>
                )}
                <div className="code-note" style={{ color: explanationColor }}>
                  {icon}
                  <span>{l[vocab]}</span>
                </div>
              </div>
            </div>
          );
        }

        return (
          <div key={l.lineNumber} className={`code-line ${rowToneFor(l.source)}`}>
            <div className="code-num">{lineLabel(l)}</div>
            <div className="code-body">
              <code>{l.content || ' '}</code>
              <div className="code-note" style={{ color: explanationColor }}>
                {icon}
                <span>{l[vocab]}</span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function SymbolPanel({
  symbols,
  onJump,
}: {
  symbols: LineExplanation[];
  onJump: (lineNumber: number) => void;
}) {
  if (symbols.length === 0) return null;
  return (
    <div className="card">
      <div className="card-body">
        <div className="cap" style={{ marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
          <Braces size={11} strokeWidth={2.2} />
          Functions <span style={{ color: 'var(--ink-3)', fontWeight: 400 }}>· {symbols.length}</span>
        </div>
        <ul className="symbol-list">
          {symbols.map((s) => (
            <li key={s.lineNumber}>
              <button
                type="button"
                className="symbol-item"
                onClick={() => onJump(s.lineNumber)}
              >
                <span className="mono symbol-name">{s.symbolName ?? '(anonymous)'}</span>
                <span className="mono symbol-range">{lineLabel(s)}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default function ScriptViewPage() {
  const { id }            = useParams<{ id: string }>();
  const { user, token }   = useAuth();
  const [script, setScript]   = useState<Script | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);
  const [vocab, setVocab]     = useState<Vocab>('plain');

  // Inline metadata edit
  const [editing, setEditing]               = useState(false);
  const [editName, setEditName]             = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editUrl, setEditUrl]               = useState('');
  const [saving, setSaving]                 = useState(false);
  const [saveError, setSaveError]           = useState<string | null>(null);

  // Re-analyze state
  const [reanalyzing, setReanalyzing]       = useState(false);
  const [reanalyzeError, setReanalyzeError] = useState<string | null>(null);

  // Which function blocks are currently expanded (keyed by start line).
  const [expandedFns, setExpandedFns] = useState<Set<number>>(new Set());

  const toggleFn = (lineNumber: number) =>
    setExpandedFns((prev) => {
      const next = new Set(prev);
      if (next.has(lineNumber)) next.delete(lineNumber);
      else next.add(lineNumber);
      return next;
    });

  const jumpToSymbol = (lineNumber: number) => {
    setExpandedFns((prev) => new Set(prev).add(lineNumber));
    // Defer so React lays out the now-expanded row before we scroll to it.
    requestAnimationFrame(() => {
      document.getElementById(`symbol-${lineNumber}`)?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    });
  };

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    getScript(id)
      .then(setScript)
      .catch((err: unknown) =>
        setError(err instanceof Error ? err.message : 'Failed to load script'),
      )
      .finally(() => setLoading(false));
  }, [id]);

  const startEdit = () => {
    if (!script) return;
    setEditName(script.name);
    setEditDescription(script.description ?? '');
    setEditUrl(script.url ?? '');
    setSaveError(null);
    setEditing(true);
  };

  const cancelEdit = () => {
    setEditing(false);
    setSaveError(null);
  };

  const saveEdit = async () => {
    if (!script || !token) return;
    setSaveError(null);
    setSaving(true);
    try {
      const payload: { name?: string; description?: string; url?: string } = {};
      const trimmedName = editName.trim();
      if (trimmedName && trimmedName !== script.name) payload.name = trimmedName;
      if (editDescription !== (script.description ?? ''))
        payload.description = editDescription;
      const trimmedUrl = editUrl.trim();
      if (trimmedUrl && trimmedUrl !== (script.url ?? ''))
        payload.url = trimmedUrl;

      if (Object.keys(payload).length === 0) {
        setEditing(false);
        return;
      }
      const updated = await updateScript(token, script.id, payload);
      setScript(updated);
      setEditing(false);
    } catch (err: unknown) {
      setSaveError(err instanceof Error ? err.message : 'Failed to save changes');
    } finally {
      setSaving(false);
    }
  };

  const canEdit = script && user?.id === script.ownerId;

  const handleReanalyze = async () => {
    if (!script || !token) return;
    setReanalyzeError(null);
    setReanalyzing(true);
    try {
      const updated = await reanalyzeScript(token, script.id);
      setScript(updated);
    } catch (err: unknown) {
      setReanalyzeError(err instanceof Error ? err.message : 'Failed to re-analyze');
    } finally {
      setReanalyzing(false);
    }
  };

  const installUrl = `${window.location.origin}/api/scripts/${id}/raw`;
  const installCmd = `curl -fsSL ${installUrl} | sh`;
  const copyInstall = () => navigator.clipboard.writeText(installCmd);

  const analysis = script?.latestVersion?.analysis;
  const summary  = analysis?.summary;
  const lines    = analysis?.lines;
  const content  = script?.latestVersion?.content ?? '';
  const lineCount = content ? content.split('\n').length : 0;
  const score    = analysis?.trustScore;
  const verdict  = score !== undefined ? verdictOf(score) : undefined;

  const symbols = useMemo(
    () => (lines ?? []).filter(isFunction),
    [lines],
  );

  return (
    <Layout>
      {loading && <p className="text-muted">loading…</p>}
      {error   && <p className="text-danger">{error}</p>}

      {script && (
        <>
          {/* Breadcrumb + heading */}
          <div className="page-head">
            <div style={{ minWidth: 0, flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: 'var(--ink-3)', marginBottom: 8 }}>
                <Link to="/scripts" style={{ color: 'var(--ink-3)' }}>Library</Link>
                <span>/</span>
                <span style={{ color: 'var(--ink-2)' }}>{script.name}</span>
                <span>/</span>
                <span className="mono" style={{ color: 'var(--ink)' }}>v{script.currentVersionNumber}</span>
              </div>

              {!editing ? (
                <>
                  <h1 className="page-title">
                    {script.name}
                    <span style={{ color: 'var(--ink-3)', fontWeight: 400, fontSize: 20 }}>
                      {' · '}v{script.currentVersionNumber}
                    </span>
                  </h1>
                  {script.description && (
                    <p className="page-subtitle" style={{ marginTop: 6 }}>{script.description}</p>
                  )}
                  <div className="meta-strip" style={{ marginTop: 10 }}>
                    {verdict && (
                      <span className={`pill pill--${verdict === 'trusted' ? 'good' : verdict === 'caution' ? 'warn' : 'bad'}`}>
                        <span className="mono" style={{ fontWeight: 600 }}>{score}</span>
                        <span>{verdict}</span>
                      </span>
                    )}
                    <span>{lineCount} lines</span>
                    <span>·</span>
                    <span>created {new Date(script.createdAt).toLocaleDateString('en-CA')}</span>
                    <span>·</span>
                    <span>updated {new Date(script.updatedAt).toLocaleDateString('en-CA')}</span>
                    {script.url && (
                      <>
                        <span>·</span>
                        <a href={script.url} target="_blank" rel="noreferrer" style={{ color: 'var(--ink-2)' }}>source</a>
                      </>
                    )}
                  </div>
                </>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12, maxWidth: 560 }}>
                  {saveError && <div className="form-error">{saveError}</div>}
                  <div className="field">
                    <label className="field-label" htmlFor="edit-name">Name</label>
                    <input
                      id="edit-name"
                      className="field-input"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      autoFocus
                      required
                    />
                  </div>
                  <div className="field">
                    <label className="field-label" htmlFor="edit-desc">
                      Description <span className="field-hint">— optional</span>
                    </label>
                    <input
                      id="edit-desc"
                      className="field-input"
                      value={editDescription}
                      onChange={(e) => setEditDescription(e.target.value)}
                      placeholder="What does this script do?"
                    />
                  </div>
                  <div className="field">
                    <label className="field-label" htmlFor="edit-url">
                      Source URL <span className="field-hint">— optional</span>
                    </label>
                    <input
                      id="edit-url"
                      type="url"
                      className="field-input"
                      value={editUrl}
                      onChange={(e) => setEditUrl(e.target.value)}
                      placeholder="https://install.example.com/setup.sh"
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="page-actions">
              {editing ? (
                <>
                  <button
                    type="button"
                    className="btn btn--ink"
                    onClick={saveEdit}
                    disabled={saving || editName.trim().length === 0}
                  >
                    <Check size={13} strokeWidth={2.2} /> {saving ? 'Saving…' : 'Save'}
                  </button>
                  <button type="button" className="btn btn--ghost" onClick={cancelEdit} disabled={saving}>
                    <X size={13} /> Cancel
                  </button>
                </>
              ) : (
                <>
                  {canEdit && (
                    <>
                      <button
                        type="button"
                        className="btn"
                        onClick={handleReanalyze}
                        disabled={reanalyzing}
                        title="Re-run the analyzer over the latest version"
                      >
                        <RefreshCw
                          size={13}
                          className={reanalyzing ? 'spin' : undefined}
                        />
                        {reanalyzing ? 'Re-analyzing…' : 'Re-analyze'}
                      </button>
                      <button type="button" className="btn" onClick={startEdit}>
                        <Pencil size={13} /> Edit
                      </button>
                    </>
                  )}
                  <Link to="/scripts" className="btn">
                    <ChevronLeft size={13} /> Back
                  </Link>
                </>
              )}
            </div>
          </div>

          {reanalyzeError && (
            <div className="form-error">{reanalyzeError}</div>
          )}

          {/* Public install card */}
          <div className="card">
            <div className="card-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <FileCode size={14} />
                <span className="mono" style={{ fontSize: 12.5, fontWeight: 500 }}>install</span>
                <span className="pill"><span className="dot" style={{ color: 'var(--good)' }} />curl-ready</span>
              </div>
            </div>
            <div style={{ padding: 16 }}>
              <div className="install-box">
                <span className="install-cmd">{installCmd}</span>
                <button type="button" className="btn btn--sm" onClick={copyInstall}>
                  <Clipboard size={11} /> copy
                </button>
              </div>
              <div className="text-muted" style={{ marginTop: 8 }}>
                Browsers get the audit page · curl receives the raw script content.
              </div>
            </div>
          </div>

          {/* Main two-column grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.55fr 1fr', gap: 18, alignItems: 'start' }}>
            {/* LEFT — code + explanations */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16, minWidth: 0 }}>
              {(summary || (lines && lines.some(isExplanationVisible))) && (
                <div className="card code-panel">
                  <div className="card-header">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <FileCode size={14} />
                      <span className="mono" style={{ fontSize: 12.5, fontWeight: 500 }}>line-by-line</span>
                      <span className="pill" style={{ color: 'var(--ink-3)' }}>{lineCount} lines</span>
                    </div>
                    <VocabToggle value={vocab} onChange={setVocab} />
                  </div>
                  {summary && (
                    <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--line)', background: 'var(--header-tint)' }}>
                      <div className="cap" style={{ marginBottom: 6 }}>Summary</div>
                      <div style={{ fontSize: 13, color: 'var(--ink)' }}>{summary[vocab]}</div>
                    </div>
                  )}
                  {lines && lines.some(isExplanationVisible) && (
                    <ExplanationCode
                      lines={lines}
                      vocab={vocab}
                      expandedFns={expandedFns}
                      onToggleFn={toggleFn}
                    />
                  )}
                </div>
              )}

              <div className="card">
                <div className="card-header">
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <FileCode size={14} />
                    <span className="mono" style={{ fontSize: 12.5, fontWeight: 500 }}>raw</span>
                  </div>
                </div>
                <div style={{ padding: 16 }}>
                  <pre className="code-block">{content}</pre>
                </div>
              </div>
            </div>

            {/* RIGHT — symbols + verdict + findings */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <SymbolPanel symbols={symbols} onJump={jumpToSymbol} />

              {analysis && score !== undefined && (
                <div className="card">
                  <div className="card-body" style={{ padding: 18 }}>
                    <div className="cap" style={{ marginBottom: 10 }}>Verdict</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
                      <VerdictRing score={score} />
                      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 10 }}>
                        <SubScore label="Risks"  value={Math.max(0, 100 - analysis.risks.length * 20)} />
                        <SubScore label="Warnings" value={Math.max(0, 100 - analysis.warnings.length * 8)} />
                        <SubScore label="Safe patterns" value={Math.min(100, analysis.safePatterns.length * 25)} />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {analysis && (
                <div className="card">
                  <div className="card-body">
                    <div className="cap" style={{ marginBottom: 10 }}>Analysis</div>
                    <Findings title="risks"         items={analysis.risks}        tone="danger" />
                    <Findings title="warnings"      items={analysis.warnings}     tone="warn" />
                    <Findings title="safe patterns" items={analysis.safePatterns} tone="good" />
                  </div>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </Layout>
  );
}
