import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getScript } from '../services/api';
import { Layout } from '../components/Layout';
import type { Script } from '../types';

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

export default function ScriptViewPage() {
  const { id } = useParams<{ id: string }>();
  const [script, setScript]   = useState<Script | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);

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
                <TrustBadge score={script.latestVersion?.analysis?.trustScore} />
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

          {script.latestVersion?.analysis && (
            <section className="section">
              <h2 className="section-title">analysis</h2>
              <Findings
                title="risks"
                items={script.latestVersion.analysis.risks}
                tone="danger"
              />
              <Findings
                title="warnings"
                items={script.latestVersion.analysis.warnings}
                tone="warn"
              />
              <Findings
                title="safe patterns"
                items={script.latestVersion.analysis.safePatterns}
                tone="good"
              />
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
