import { useState, FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Shield } from 'lucide-react';
import { login as loginApi } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

export default function LoginPage() {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState<string | null>(null);
  const [loading, setLoading]   = useState(false);

  const { login } = useAuth();
  const navigate  = useNavigate();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const data = await loginApi(email, password);
      login(data.accessToken, data.user);
      navigate('/scripts');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <form className="auth-card card" onSubmit={handleSubmit}>
        <div className="auth-brand">
          <span className="brand-mark"><Shield size={14} strokeWidth={2.2} /></span>
          <span style={{ fontSize: 15, fontWeight: 600 }}>SafeBash<span className="brand-suffix"> · audit</span></span>
        </div>
        <h1 className="auth-title">Sign in</h1>

        {error && <div className="auth-error">{error}</div>}

        <div className="field">
          <label className="field-label" htmlFor="email">Email</label>
          <input
            id="email"
            className="field-input"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoFocus
            required
          />
        </div>

        <div className="field">
          <label className="field-label" htmlFor="password">Password</label>
          <input
            id="password"
            className="field-input"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <button className="btn btn--ink" type="submit" disabled={loading} style={{ justifyContent: 'center', marginTop: 4 }}>
          {loading ? 'Authenticating…' : 'Sign in'}
        </button>

        <p className="auth-link">
          No account? <Link to="/signup">Register →</Link>
        </p>
      </form>
    </div>
  );
}
