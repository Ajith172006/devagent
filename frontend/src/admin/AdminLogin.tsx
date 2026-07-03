import { useState } from 'react';
import { ADMIN_KEY } from './AdminContext';

export function AdminLogin({ onAuth }: { onAuth: (s: string) => void }) {
  const [val, setVal] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!val.trim()) { setError('Enter the admin secret.'); return; }
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/admin/overview', {
        headers: { 'x-admin-secret': val.trim() },
      });
      if (res.ok) {
        sessionStorage.setItem(ADMIN_KEY, val.trim());
        onAuth(val.trim());
      } else {
        setError(res.status === 401 ? 'Wrong secret. Try again.' : `Error ${res.status}`);
      }
    } catch {
      setError('Could not reach the backend. Is it running?');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={s.page}>
      <div style={s.card}>
        <div style={s.logo}>
          <svg width="36" height="36" viewBox="0 0 32 32">
            <rect width="32" height="32" rx="7" fill="#1e2230" />
            <rect x="4" y="6" width="3" height="20" rx="1.5" fill="#e8b339" />
            <rect x="12" y="10" width="16" height="3" rx="1.5" fill="#e7e9f0" />
            <rect x="12" y="16" width="11" height="3" rx="1.5" fill="#4fae84" />
            <rect x="12" y="22" width="7" height="3" rx="1.5" fill="#565c72" />
          </svg>
          <span style={s.logoText}>DevAgent Admin</span>
        </div>
        <p style={s.sub}>Enter your admin secret to continue</p>
        <form onSubmit={submit} style={s.form}>
          <input
            type="password"
            placeholder="Admin secret…"
            value={val}
            onChange={e => setVal(e.target.value)}
            style={s.input}
            autoFocus
          />
          {error && <p style={s.err}>{error}</p>}
          <button type="submit" disabled={loading} style={s.btn}>
            {loading ? 'Verifying…' : 'Enter admin panel →'}
          </button>
        </form>
        <p style={s.hint}>Set ADMIN_SECRET in backend/.env</p>
      </div>
    </div>
  );
}

const s: Record<string, React.CSSProperties> = {
  page: { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0e1017', padding: '16px' },
  card: { width: '100%', maxWidth: 400, background: '#171a24', border: '1px solid #262b3a', borderRadius: 14, padding: '36px 32px' },
  logo: { display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 },
  logoText: { fontFamily: 'system-ui,sans-serif', fontSize: 18, fontWeight: 700, color: '#e7e9f0', letterSpacing: '-0.01em' },
  sub: { fontFamily: 'system-ui,sans-serif', fontSize: 13, color: '#8b90a3', marginBottom: 24, marginTop: 2 },
  form: { display: 'flex', flexDirection: 'column', gap: 10 },
  input: { background: '#1e2230', border: '1px solid #262b3a', borderRadius: 8, padding: '10px 12px', color: '#e7e9f0', fontFamily: 'monospace', fontSize: 14, outline: 'none' },
  err: { color: '#e2596b', fontSize: 12, margin: 0, fontFamily: 'system-ui,sans-serif' },
  btn: { background: '#e8b339', color: '#0e1017', border: 'none', borderRadius: 8, padding: '10px 16px', fontWeight: 700, fontSize: 14, cursor: 'pointer', fontFamily: 'system-ui,sans-serif' },
  hint: { fontFamily: 'monospace', fontSize: 11, color: '#565c72', marginTop: 20, textAlign: 'center' },
};
