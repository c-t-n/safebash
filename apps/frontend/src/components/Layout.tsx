import { ReactNode } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LogOut, Moon, Plus, Shield, Sun } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';

export function Layout({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { mode, toggle } = useTheme();
  const { pathname } = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isLibrary = pathname === '/scripts' || pathname.startsWith('/scripts/');

  return (
    <div className="layout">
      <header className="nav">
        <div className="nav-left">
          <Link to="/scripts" className="brand">
            <span className="brand-mark"><Shield size={14} strokeWidth={2.2} /></span>
            <span>SafeBash<span className="brand-suffix"> · audit</span></span>
          </Link>
          <nav className="nav-tabs">
            <Link to="/scripts" className={`nav-tab${isLibrary ? ' active' : ''}`}>Library</Link>
          </nav>
        </div>
        <div className="nav-right">
          {user && <span className="nav-meta mono">{user.email}</span>}
          <button
            type="button"
            className="btn btn--icon"
            onClick={toggle}
            aria-label={mode === 'dark' ? 'switch to light mode' : 'switch to dark mode'}
            title={mode === 'dark' ? 'switch to light mode' : 'switch to dark mode'}
          >
            {mode === 'dark' ? <Sun size={14} /> : <Moon size={14} />}
          </button>
          <Link to="/scripts/new" className="btn btn--ink">
            <Plus size={13} strokeWidth={2.2} /> New script
          </Link>
          <button
            type="button"
            className="btn btn--icon"
            onClick={handleLogout}
            aria-label="logout"
            title="logout"
          >
            <LogOut size={14} />
          </button>
        </div>
      </header>
      <main className="main">{children}</main>
    </div>
  );
}
