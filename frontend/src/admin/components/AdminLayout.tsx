import { useState } from 'react';
import type { ReactNode } from 'react';
import { useAdmin } from '../AdminContext';

const NAV = [
  { id: 'overview', label: '⬡ Overview' },
  { id: 'users',    label: '👤 Users' },
  { id: 'snippets', label: '{ } Snippets' },
  { id: 'notes',    label: '✎ Notes' },
  { id: 'goals',    label: '◎ Goals' },
  { id: 'leetcode', label: '⚡ LeetCode' },
];

export function AdminLayout({
  children,
  active,
  onNav,
}: {
  children: ReactNode;
  active: string;
  onNav: (id: string) => void;
}) {
  const { logout } = useAdmin();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div style={s.shell}>
      {/* Sidebar */}
      <aside style={{ ...s.sidebar, width: collapsed ? 56 : 220 }}>
        <div style={s.sideTop}>
          <button onClick={() => setCollapsed(c => !c)} style={s.collapseBtn} title="Toggle sidebar">
            {collapsed ? '→' : '←'}
          </button>
          {!collapsed && (
            <div style={s.brand}>
              <svg width="20" height="20" viewBox="0 0 32 32">
                <rect width="32" height="32" rx="6" fill="#1e2230" />
                <rect x="4" y="6" width="3" height="20" rx="1.5" fill="#e8b339" />
                <rect x="12" y="10" width="16" height="3" rx="1.5" fill="#e7e9f0" />
                <rect x="12" y="16" width="11" height="3" rx="1.5" fill="#4fae84" />
              </svg>
              <span style={s.brandText}>Admin</span>
            </div>
          )}
        </div>
        <nav style={s.nav}>
          {NAV.map(n => (
            <button
              key={n.id}
              onClick={() => onNav(n.id)}
              style={{
                ...s.navItem,
                background: active === n.id ? '#1e2230' : 'transparent',
                color: active === n.id ? '#e7e9f0' : '#8b90a3',
                justifyContent: collapsed ? 'center' : 'flex-start',
              }}
              title={collapsed ? n.label : undefined}
            >
              {collapsed ? n.label.split(' ')[0] : n.label}
            </button>
          ))}
        </nav>
        <button onClick={logout} style={{ ...s.navItem, color: '#e2596b', marginTop: 'auto', justifyContent: collapsed ? 'center' : 'flex-start' }}>
          {collapsed ? '⏏' : '⏏ Sign out'}
        </button>
      </aside>

      {/* Main */}
      <main style={s.main}>{children}</main>
    </div>
  );
}

const s: Record<string, React.CSSProperties> = {
  shell: { display: 'flex', height: '100vh', background: '#0e1017', overflow: 'hidden', fontFamily: 'system-ui,sans-serif' },
  sidebar: { background: '#171a24', borderRight: '1px solid #262b3a', display: 'flex', flexDirection: 'column', transition: 'width .15s', overflow: 'hidden', flexShrink: 0 },
  sideTop: { display: 'flex', alignItems: 'center', gap: 8, padding: '16px 12px', borderBottom: '1px solid #262b3a' },
  brand: { display: 'flex', alignItems: 'center', gap: 8 },
  brandText: { color: '#e7e9f0', fontWeight: 700, fontSize: 14, whiteSpace: 'nowrap' },
  collapseBtn: { background: 'transparent', border: 'none', color: '#565c72', cursor: 'pointer', fontSize: 16, flexShrink: 0, width: 28 },
  nav: { display: 'flex', flexDirection: 'column', gap: 2, padding: '12px 8px', flex: 1 },
  navItem: { border: 'none', cursor: 'pointer', borderRadius: 7, padding: '8px 10px', fontSize: 13, fontWeight: 500, display: 'flex', alignItems: 'center', gap: 8, whiteSpace: 'nowrap', transition: 'background .1s' },
  main: { flex: 1, overflowY: 'auto', padding: '28px 32px' },
};
