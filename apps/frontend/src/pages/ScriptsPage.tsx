import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getScripts } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { Layout } from '../components/Layout';
import type { Script } from '../types';

function TrustBadge({ score }: { score?: number }) {
  if (score === undefined) return <span className="badge badge-unknown">—</span>;
  const cls = score >= 80 ? 'badge-good' : score >= 50 ? 'badge-warn' : 'badge-bad';
  return <span className={`badge ${cls}`}>{score}</span>;
}

export default function ScriptsPage() {
  const { user } = useAuth();
  const [scripts, setScripts] = useState<Script[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);

  useEffect(() => {
    getScripts()
      .then((all) => setScripts(all.filter((s) => s.ownerId === user?.id)))
      .catch((err: unknown) => setError(err instanceof Error ? err.message : 'Failed to load'))
      .finally(() => setLoading(false));
  }, [user?.id]);

  return (
    <Layout>
      <div className="page-header">
        <h1 className="page-title">scripts</h1>
        <Link to="/scripts/new" className="btn-primary">+ new</Link>
      </div>

      {loading && <p className="text-muted">loading...</p>}
      {error   && <p className="text-danger">{error}</p>}

      {!loading && !error && scripts.length === 0 && (
        <div className="empty-state">
          <p>no scripts yet.</p>
          <Link to="/scripts/new">create your first one →</Link>
        </div>
      )}

      {scripts.length > 0 && (
        <table className="scripts-table">
          <thead>
            <tr>
              <th>name</th>
              <th>version</th>
              <th>trust</th>
              <th>created</th>
            </tr>
          </thead>
          <tbody>
            {scripts.map((s) => (
              <tr key={s.id}>
                <td className="td-name">
                  <Link to={`/scripts/${s.id}`}>{s.name}</Link>
                  {s.description && (
                    <span className="td-desc">{s.description}</span>
                  )}
                </td>
                <td className="td-mono">v{s.currentVersionNumber}</td>
                <td>
                  <TrustBadge score={s.latestVersion?.analysis?.trustScore} />
                </td>
                <td className="td-mono">
                  {new Date(s.createdAt).toLocaleDateString('en-CA')}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </Layout>
  );
}
