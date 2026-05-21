import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ChevronRight, Plus } from 'lucide-react';
import { getScripts } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { Layout } from '../components/Layout';
import type { Script } from '../types';

type Verdict = 'trusted' | 'caution' | 'danger' | 'unknown';

function verdictOf(score?: number): Verdict {
  if (score === undefined) return 'unknown';
  if (score >= 80) return 'trusted';
  if (score >= 50) return 'caution';
  return 'danger';
}

function VerdictPill({ score }: { score?: number }) {
  const v = verdictOf(score);
  if (v === 'unknown') return <span className="pill"><span className="mono">—</span> unscored</span>;
  const tone = v === 'trusted' ? 'good' : v === 'caution' ? 'warn' : 'bad';
  return (
    <span className={`pill pill--${tone}`}>
      <span className="mono" style={{ fontWeight: 600 }}>{score}</span>
      <span>{v}</span>
    </span>
  );
}

export default function ScriptsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [scripts, setScripts] = useState<Script[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);

  useEffect(() => {
    getScripts()
      .then((all) => setScripts(all.filter((s) => s.ownerId === user?.id)))
      .catch((err: unknown) => setError(err instanceof Error ? err.message : 'Failed to load'))
      .finally(() => setLoading(false));
  }, [user?.id]);

  const stats = useMemo(() => {
    const trusted = scripts.filter((s) => (s.latestVersion?.analysis?.trustScore ?? 0) >= 80).length;
    const caution = scripts.filter((s) => {
      const sc = s.latestVersion?.analysis?.trustScore;
      return sc !== undefined && sc >= 50 && sc < 80;
    }).length;
    const danger  = scripts.filter((s) => (s.latestVersion?.analysis?.trustScore ?? 100) < 50).length;
    return [
      { k: 'Total scripts', v: String(scripts.length) },
      { k: 'Trusted',       v: String(trusted), c: 'var(--good)' },
      { k: 'Caution',       v: String(caution), c: caution ? 'var(--warn)' : undefined },
      { k: 'Danger',        v: String(danger),  c: danger  ? 'var(--bad)'  : undefined },
    ];
  }, [scripts]);

  return (
    <Layout>
      <div className="page-head">
        <div>
          <h1 className="page-title">Library</h1>
          <p className="page-subtitle">
            Your audited install scripts. Each entry has a stable{' '}
            <span className="mono" style={{ color: 'var(--ink-2)' }}>safebash.dev/&lt;name&gt;</span>{' '}
            URL that serves the audit page to browsers and the raw script to curl.
          </p>
        </div>
        <div className="page-actions">
          <Link to="/scripts/new" className="btn btn--ink">
            <Plus size={13} strokeWidth={2.2} /> Publish a script
          </Link>
        </div>
      </div>

      <div className="stat-row">
        {stats.map((s) => (
          <div key={s.k} className="card stat-card">
            <div className="cap" style={{ marginBottom: 8 }}>{s.k}</div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
              <div className="stat-value" style={s.c ? { color: s.c } : undefined}>{s.v}</div>
            </div>
          </div>
        ))}
      </div>

      {loading && <p className="text-muted">loading…</p>}
      {error   && <p className="text-danger">{error}</p>}

      {!loading && !error && scripts.length === 0 && (
        <div className="card">
          <div className="empty-state">
            <div className="empty-state-title">No scripts yet</div>
            <p>The library is empty. Publish your first audited install script.</p>
            <Link to="/scripts/new" className="btn btn--ink">
              <Plus size={13} strokeWidth={2.2} /> Publish a script
            </Link>
          </div>
        </div>
      )}

      {scripts.length > 0 && (
        <div className="card">
          <div className="list-head">
            <div className="cap">Script &amp; URL</div>
            <div className="cap">Verdict</div>
            <div className="cap">Version</div>
            <div className="cap">Audited</div>
            <div />
          </div>
          {scripts.map((s) => (
            <div
              key={s.id}
              className="list-row"
              onClick={() => navigate(`/scripts/${s.id}`)}
            >
              <div className="list-name">
                <div className="list-name-top">
                  <span className="list-name-title">{s.name}</span>
                  {s.description && (
                    <span className="list-name-sub" style={{ marginLeft: 4 }}>
                      {s.description}
                    </span>
                  )}
                </div>
                <div className="mono list-name-sub">
                  safebash.dev/{s.id.slice(-8)}
                </div>
              </div>
              <div>
                <VerdictPill score={s.latestVersion?.analysis?.trustScore} />
              </div>
              <div className="mono" style={{ color: 'var(--ink-2)', fontSize: 11.5 }}>
                v{s.currentVersionNumber}
              </div>
              <div style={{ color: 'var(--ink-3)', fontSize: 11.5 }}>
                {new Date(s.updatedAt).toLocaleDateString('en-CA')}
              </div>
              <ChevronRight size={14} strokeWidth={1.8} style={{ color: 'var(--ink-3)' }} />
            </div>
          ))}
        </div>
      )}
    </Layout>
  );
}
