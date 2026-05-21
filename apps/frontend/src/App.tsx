import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import ScriptsPage from './pages/ScriptsPage';
import ScriptCreatePage from './pages/ScriptCreatePage';
import ScriptViewPage from './pages/ScriptViewPage';

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Routes>
        <Route path="/login"  element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />

        <Route
          path="/scripts"
          element={<ProtectedRoute><ScriptsPage /></ProtectedRoute>}
        />
        <Route
          path="/scripts/new"
          element={<ProtectedRoute><ScriptCreatePage /></ProtectedRoute>}
        />
        <Route
          path="/scripts/:id"
          element={<ProtectedRoute><ScriptViewPage /></ProtectedRoute>}
        />

          {/* Catch-all: send unauthenticated users to login */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </AuthProvider>
    </ThemeProvider>
  );
}
