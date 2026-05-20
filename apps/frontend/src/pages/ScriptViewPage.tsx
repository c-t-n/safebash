import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getScript } from '../services/api';
import { Layout } from '../components/Layout';
import type { LineExplanation, Script } from '../types';

type Vocab = 'plain' | 'tech';

function TrustBadge({ score }: { score?: number }) {
  if (score === undefined) return <span className="badge badge-unknown">—</span>;
  const cls = score >= 80 ? 'badge-good' : score >= 50 ? 'badge-warn' : 'badge-bad';
  return <span className={`badge ${cls}`}>{score}</span>;
}

function Findings({
  title,
  items,
  tone,
}: {
  title: string;
  items: string[];
  tone: 'danger' | 'warn' | 'good';
}) {
  if (items.length === 0) return null;
  return (
    <section className="findings">
      <h3 className={`findings-title findings-${tone}`}>{title}</h3>
      <ul className="findings-list">
        {items.map((item, i) => (
          <li key={i}>{item}</li>
        ))}
      </ul>
    </section>
  );
}

function VocabTabs({ value, onChange }: { value: Vocab; onChange: (v: Vocab) => void }) {
  return (
    <div className="mode-tabs">
      <button
        type="button"
        className={`mode-tab${value === 'plain' ? ' active' : ''}`}
        onClick={() => onChange('plain')}
      >
        plain
      </button>
      <button
        type="button"
        className={`mode-tab${value === 'tech' ? ' active' : ''}`}
        onClick={() => onChange('tech')}
      >
        tech
      </button>
    </div>
  );
}

function LineRows({ lines, vocab }: { lines: LineExplanation[]; vocab: Vocab }) {
  return (
    <div className="line-table">
      {lines.map((l) => (
        <div
          key={l.lineNumber}
          className={`line-row${l.source === 'unknown' ? ' line-unknown' : ''}`}
        >
          <span className="line-number">{l.lineNumber}</span>
          <code className="line-content">{l.content || ' '}</code>
          <span className="line-explanation">{l[vocab]}</span>
        </div>
      ))}
    </div>
  );
}

export default function ScriptViewPage() {
  const { id } = useParams<{ id: string }>();
  const [script, setScript]   = useState<Script | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);
  const [vocab, setVocab]     = useState<Vocab>('plain');

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

  const installUrl = `${window.location.origin}/api/scripts/${id}/raw`;
  const installCmd = `curl -fsSL ${installUrl} | sh`;

  const copyInstall = () => navigator.clipboard.writeText(installCmd);

  const analysis = script?.latestVersion?.analysis;
  const summary  = analysis?.summary;
  const lines    = analysis?.lines;

  return (
    <Layout>
      {loading && <p className="text-muted">loading...</p>}
      {error   && <p className="text-danger">{error}</p>}

      {script && (
        <>
          <div className="page-header">
            <div>
              <h1 className="page-title">{script.name}</h1>
              {script.description && (
                <p className="page-subtitle">{script.description}</p>
              )}
            </div>
            <Link to="/scripts" className="btn-ghost">← back</Link>
          </div>

          <div className="meta-grid">
            <div className="meta-cell">
              <span className="meta-label">version</span>
              <span className="meta-value">v{script.currentVersionNumber}</span>
            </div>
            <div className="meta-cell">
              <span className="meta-label">trust</span>
              <span className="meta-value">
                <TrustBadge score={analysis?.trustScore} />
              </span>
            </div>
            <div className="meta-cell">
              <span className="meta-label">created</span>
              <span className="meta-value td-mono">
                {new Date(script.createdAt).toLocaleDateString('en-CA')}
              </span>
            </div>
            <div className="meta-cell">
              <span className="meta-label">updated</span>
              <span className="meta-value td-mono">
                {new Date(script.updatedAt).toLocaleDateString('en-CA')}
              </span>
            </div>
            {script.url && (
              <div className="meta-cell meta-cell-wide">
                <span className="meta-label">source</span>
                <a className="meta-value" href={script.url} target="_blank" rel="noreferrer">
                  {script.url}
                </a>
              </div>
            )}
          </div>

          <section className="section">
            <h2 className="section-title">install</h2>
            <div className="install-box">
              <code className="install-cmd">{installCmd}</code>
              <button type="button" className="btn-ghost btn-small" onClick={copyInstall}>
                copy
              </button>
            </div>
          </section>

          {(summary || lines) && (
            <div className="vocab-bar">
              <span className="vocab-label">explain in</span>
              <VocabTabs value={vocab} onChange={setVocab} />
            </div>
          )}

          {summary && (
            <section className="section">
              <h2 className="section-title">summary</h2>
              <p className="summary-text">{summary[vocab]}</p>
            </section>
          )}

          {lines && lines.length > 0 && (
            <section className="section">
              <h2 className="section-title">line by line</h2>
              <LineRows lines={lines} vocab={vocab} />
            </section>
          )}

          {analysis && (
            <section className="section">
              <h2 className="section-title">analysis</h2>
              <Findings title="risks"        items={analysis.risks}        tone="danger" />
              <Findings title="warnings"     items={analysis.warnings}     tone="warn" />
              <Findings title="safe patterns" items={analysis.safePatterns} tone="good" />
            </section>
          )}

          <section className="section">
            <h2 className="section-title">content</h2>
            <pre className="code-block">{script.latestVersion?.content ?? ''}</pre>
          </section>
        </>
      )}
    </Layout>
  );
}
