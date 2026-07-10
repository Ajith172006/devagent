import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Code2,
  Bug,
  BookOpenText,
  GitBranch,
  Trophy,
  Target,
  Globe,
  StickyNote,
  LogOut,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const links = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/snippets', label: 'Snippets', icon: Code2 },
  { to: '/debug', label: 'AI Debug', icon: Bug },
  { to: '/explain', label: 'Explain Code', icon: BookOpenText },
  { to: '/github', label: 'GitHub', icon: GitBranch },
  { to: '/leetcode', label: 'LeetCode', icon: Trophy },
  { to: '/goals', label: 'Daily Goals', icon: Target },
  { to: '/portfolio', label: 'Portfolio', icon: Globe },
  { to: '/notes', label: 'Notes', icon: StickyNote },
];

export function Sidebar({ isOpen, onClose }: { isOpen?: boolean; onClose?: () => void }) {
  const { user, profile, logout } = useAuth();
  const location = useLocation();

  const getBgImage = (path: string) => {
    switch (path) {
      case '/':
        return '/bg-developers-server.jpg';
      case '/explain':
        return '/bg-hologram-code.jpg';
      case '/debug':
      case '/snippets':
        return '/bg-editor-code.jpg';
      case '/github':
      case '/portfolio':
        return '/bg-cloud-network.jpg';
      case '/leetcode':
      case '/goals':
      case '/notes':
      case '/profile':
        return '/bg-waves.jpg';
      default:
        return '/bg-developers-server.jpg';
    }
  };

  const bgImage = getBgImage(location.pathname);

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-[var(--color-ink)]/50 md:hidden backdrop-blur-sm transition-opacity"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col neon-border-right transition-transform duration-300 md:relative md:translate-x-0 md:w-56 shrink-0 overflow-hidden bg-[var(--color-ink-panel)] ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Animated dynamic sidebar background */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-animate-flow pointer-events-none transition-all duration-700 ease-in-out"
          style={{
            backgroundImage: `linear-gradient(to bottom, rgba(23, 26, 36, 0.78), rgba(14, 16, 23, 0.88)), url('${bgImage}')`,
            backgroundSize: '120% 120%',
            opacity: 0.95
          }}
        />

        <div className="flex items-center gap-2 px-5 py-5 relative z-10">
          <svg width="22" height="22" viewBox="0 0 32 32" aria-hidden="true">
            <rect width="32" height="32" rx="7" fill="rgba(59,130,246,0.15)" stroke="rgba(255,255,255,0.1)" />
            <rect x="4" y="6" width="3" height="20" rx="1.5" fill="#3b82f6" />
            <rect x="12" y="10" width="16" height="3" rx="1.5" fill="#ffffff" />
            <rect x="12" y="16" width="11" height="3" rx="1.5" fill="#ef4444" />
            <rect x="12" y="22" width="7" height="3" rx="1.5" fill="var(--color-text-muted)" />
          </svg>
          <span className="font-display text-[15px] font-bold tracking-tight bg-gradient-to-r from-blue-400 via-white to-red-400 bg-clip-text text-transparent">DevAgent</span>
        </div>

        <nav className="flex-1 space-y-0.5 px-3 relative z-10">
          {links.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-all duration-200 relative overflow-hidden group border-l-2 ${
                  isActive
                    ? 'active-nav-link'
                    : 'text-[var(--color-text-muted)] border-transparent hover:bg-[rgba(59,130,246,0.05)] hover:text-white hover:translate-x-1'
                }`
              }
            >
              <Icon size={16} strokeWidth={1.75} className="transition-transform group-hover:scale-110 group-hover:text-white" />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* User footer */}
        <div className="border-t border-[var(--color-ink-border)] px-4 py-3 relative z-10">
          <div className="flex items-center gap-2.5 mb-2">
            {user?.photoURL
              ? <img src={user.photoURL} alt="avatar" className="h-6 w-6 rounded-full" />
              : <div className="h-6 w-6 rounded-full bg-[var(--color-ink-panel-raised)]" />
            }
            <div className="min-w-0">
              <p className="truncate text-xs font-medium text-[var(--color-text)]">
                {profile?.name || user?.displayName || 'User'}
              </p>
              <p className="truncate text-[10px] text-[var(--color-text-faint)]">
                {profile?.profession || user?.email || ''}
              </p>
            </div>
          </div>
          <button
            onClick={logout}
            className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-xs text-[var(--color-text-faint)] hover:bg-[var(--color-ink-panel-raised)] hover:text-[var(--color-diff-red)] transition-colors"
          >
            <LogOut size={13} />
            Sign out
          </button>
        </div>
      </aside>
    </>
  );
}

