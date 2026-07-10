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
import { Profile } from './pages/Profile';
import { Admin } from './pages/Admin';
import { useAuth } from './context/AuthContext';

const titled = (title: string, node: React.ReactNode) => <Layout title={title}>{node}</Layout>;

const Spinner = () => (
  <div className="flex h-screen items-center justify-center bg-[var(--color-ink)]">
    <span className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--color-ink-border)] border-t-[var(--color-amber)]" />
  </div>
);

export default function App() {
  const { user, profile, loading, firebaseReady } = useAuth();

  if (loading) return <Spinner />;

  // Firebase not configured → show setup instructions, but still render the app
  // so the developer can see it works. Skip auth entirely.
  if (!firebaseReady) {
    return (
      <Routes>
        <Route path="/*" element={
          <div className="flex h-screen flex-col items-center justify-center gap-4 bg-[var(--color-ink)] px-6 text-center">
            <svg width="48" height="48" viewBox="0 0 32 32">
              <rect width="32" height="32" rx="8" fill="var(--color-ink-panel-raised)" />
              <rect x="4" y="6" width="3" height="20" rx="1.5" fill="var(--color-amber)" />
              <rect x="12" y="10" width="16" height="3" rx="1.5" fill="var(--color-text)" />
              <rect x="12" y="16" width="11" height="3" rx="1.5" fill="var(--color-diff-green)" />
              <rect x="12" y="22" width="7" height="3" rx="1.5" fill="var(--color-text-faint)" />
            </svg>
            <h1 className="font-display text-xl font-semibold">Firebase not configured</h1>
            <p className="max-w-md text-sm text-[var(--color-text-muted)]">
              Create a <code className="text-[var(--color-amber)]">frontend/.env</code> file with
              your Firebase project credentials to enable Google Sign-In.
            </p>
            <div className="w-full max-w-md rounded-lg border border-[var(--color-ink-border)] bg-[var(--color-ink-panel)] p-4 text-left font-mono text-xs text-[var(--color-diff-green)]">
              <p className="text-[var(--color-text-faint)] mb-2"># frontend/.env</p>
              <p>VITE_FIREBASE_API_KEY=your_api_key</p>
              <p>VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com</p>
              <p>VITE_FIREBASE_PROJECT_ID=your_project_id</p>
              <p>VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com</p>
              <p>VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id</p>
              <p>VITE_FIREBASE_APP_ID=your_app_id</p>
            </div>
            <p className="text-xs text-[var(--color-text-faint)]">
              Get these from{' '}
              <a href="https://console.firebase.google.com" target="_blank" rel="noopener" className="underline hover:text-[var(--color-amber)]">
                console.firebase.google.com
              </a>
              {' '}→ Project Settings → Your apps → Web app
            </p>
          </div>
        } />
      </Routes>
    );
  }

  return (
    <Routes>
      {/* Admin — completely standalone, no app auth needed */}
      <Route path="/admin/*" element={<Admin />} />

      {/* Public */}
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

      {/* Protected */}
      <Route path="/*" element={
        !user ? <Navigate to="/login" replace /> :
        !profile ? <Navigate to="/setup" replace /> :
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
          <Route path="/profile" element={titled('Profile', <Profile />)} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      } />
    </Routes>
  );
}
