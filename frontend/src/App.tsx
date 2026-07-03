import { Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { Snippets } from './pages/Snippets';
import { AiDebug } from './pages/AiDebug';
import { ExplainCode } from './pages/ExplainCode';
import { Github } from './pages/Github';
import { Leetcode } from './pages/Leetcode';
import { Goals } from './pages/Goals';
import { Portfolio } from './pages/Portfolio';
import { Notes } from './pages/Notes';
import { Login } from './pages/Login';
import { ProfileSetup } from './pages/ProfileSetup';
import { useAuth } from './context/AuthContext';

const titled = (title: string, node: React.ReactNode) => <Layout title={title}>{node}</Layout>;

function ProtectedRoutes() {
  const { user, profile, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[var(--color-ink)]">
        <span className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--color-ink-border)] border-t-[var(--color-amber)]" />
      </div>
    );
  }

  // Not logged in → Login
  if (!user) return <Navigate to="/login" replace />;

  // Logged in but no profile → Profile setup
  if (!profile) return <Navigate to="/setup" replace />;

  // Fully authenticated → app
  return (
    <Routes>
      <Route path="/" element={titled('Dashboard', <Dashboard />)} />
      <Route path="/snippets" element={titled('Code Snippets', <Snippets />)} />
      <Route path="/debug" element={titled('AI Debugging', <AiDebug />)} />
      <Route path="/explain" element={titled('Explain Code', <ExplainCode />)} />
      <Route path="/github" element={titled('GitHub', <Github />)} />
      <Route path="/leetcode" element={titled('LeetCode Tracker', <Leetcode />)} />
      <Route path="/goals" element={titled('Daily Coding Goals', <Goals />)} />
      <Route path="/portfolio" element={titled('Portfolio Generator', <Portfolio />)} />
      <Route path="/notes" element={titled('Notes', <Notes />)} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  const { user, profile, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[var(--color-ink)]">
        <span className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--color-ink-border)] border-t-[var(--color-amber)]" />
      </div>
    );
  }

  return (
    <Routes>
      {/* Public routes */}
      <Route
        path="/login"
        element={
          user && profile ? <Navigate to="/" replace /> :
          user && !profile ? <Navigate to="/setup" replace /> :
          <Login />
        }
      />
      <Route
        path="/setup"
        element={
          !user ? <Navigate to="/login" replace /> :
          profile ? <Navigate to="/" replace /> :
          <ProfileSetup />
        }
      />
      {/* Protected — everything else */}
      <Route path="/*" element={<ProtectedRoutes />} />
    </Routes>
  );
}
