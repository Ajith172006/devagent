import { useState } from 'react';
import { signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from '../firebase';

export function Login() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleGoogle = async () => {
    if (!auth) return;
    setError(null);
    setLoading(true);
    try {
      await signInWithPopup(auth, googleProvider);
      // AuthContext listener picks up the new user automatically
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Sign-in failed. Please try again.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4 relative overflow-hidden bg-[var(--color-ink)]">
      {/* Animated dynamic background container */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-animate-flow pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(to bottom, rgba(14, 16, 23, 0.72), rgba(14, 16, 23, 0.85)), url('/bg-code-stream.jpg')`,
          backgroundSize: '120% 120%'
        }}
      />
      <div className="w-full max-w-sm relative z-10">
        {/* Logo */}
        <div className="mb-8 flex flex-col items-center gap-3">
          <svg width="48" height="48" viewBox="0 0 32 32" aria-hidden="true">
            <rect width="32" height="32" rx="8" fill="var(--color-ink-panel-raised)" />
            <rect x="4" y="6" width="3" height="20" rx="1.5" fill="var(--color-amber)" />
            <rect x="12" y="10" width="16" height="3" rx="1.5" fill="var(--color-text)" />
            <rect x="12" y="16" width="11" height="3" rx="1.5" fill="var(--color-diff-green)" />
            <rect x="12" y="22" width="7" height="3" rx="1.5" fill="var(--color-text-faint)" />
          </svg>
          <h1 className="font-display text-2xl font-semibold tracking-tight">DevAgent</h1>
          <p className="text-sm text-[var(--color-text-muted)]">Your AI-powered developer workspace</p>
        </div>

        {/* Card */}
        <div className="rounded-xl border border-[var(--color-ink-border)] bg-[var(--color-ink-panel)] p-8">
          <h2 className="font-display mb-1 text-lg font-semibold">Sign in</h2>
          <p className="mb-6 text-sm text-[var(--color-text-muted)]">
            Continue with your Google account to access your workspace.
          </p>

          <button
            onClick={handleGoogle}
            disabled={loading}
            className="flex w-full items-center justify-center gap-3 rounded-lg border border-[var(--color-ink-border)] bg-[var(--color-ink-panel-raised)] px-4 py-3 text-sm font-medium text-[var(--color-text)] transition-colors hover:border-[var(--color-amber)] hover:bg-[var(--color-ink-panel-raised)] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? (
              <span className="h-5 w-5 animate-spin rounded-full border-2 border-[var(--color-text-faint)] border-t-[var(--color-amber)]" />
            ) : (
              /* Google "G" icon */
              <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
            )}
            {loading ? 'Signing in…' : 'Continue with Google'}
          </button>

          {error && (
            <p className="mt-4 rounded-lg border border-[var(--color-diff-red-dim)] bg-[rgba(226,89,107,0.08)] px-3 py-2 text-xs text-[var(--color-diff-red)]">
              {error}
            </p>
          )}
        </div>

        <p className="mt-6 text-center font-mono text-xs text-[var(--color-text-faint)]">
          devagent · local workspace
        </p>
      </div>
    </div>
  );
}
