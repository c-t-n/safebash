import { ReactNode } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export function Layout({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="layout">
      <nav className="nav">
        <Link to="/scripts" className="nav-logo">safebash</Link>
        <div className="nav-right">
          {user && <span className="nav-email">{user.email}</span>}
          <Link to="/scripts/new" className="nav-link">new script</Link>
          <button className="nav-logout" onClick={handleLogout}>logout</button>
        </div>
      </nav>
      <main className="main">{children}</main>
    </div>
  );
}
