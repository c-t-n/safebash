import { useState, FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { register as registerApi } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

export default function SignupPage() {
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
      const data = await registerApi(email, password);
      login(data.accessToken, data.user);
      navigate('/scripts');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <form className="auth-card" onSubmit={handleSubmit}>
        <div className="auth-logo">safebash</div>
        <h1 className="auth-title">create account</h1>

        {error && <div className="auth-error">{error}</div>}

        <div>
          <label className="field-label" htmlFor="email">email</label>
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

        <div>
          <label className="field-label" htmlFor="password">
            password <span className="field-hint">min 8 characters</span>
          </label>
          <input
            id="password"
            className="field-input"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            minLength={8}
            required
          />
        </div>

        <button className="btn-primary" type="submit" disabled={loading} style={{ marginTop: '0.5rem' }}>
          {loading ? 'creating account...' : 'register'}
        </button>

        <p className="auth-link">
          already have an account? <Link to="/login">sign in →</Link>
        </p>
      </form>
    </div>
  );
}
