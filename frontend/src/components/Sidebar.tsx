import { NavLink } from 'react-router-dom';
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
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-[var(--color-ink-border)] bg-[var(--color-ink-panel)] transition-transform duration-300 md:static md:translate-x-0 md:w-56 shrink-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
      <div className="flex items-center gap-2 px-5 py-5">
        <svg width="22" height="22" viewBox="0 0 32 32" aria-hidden="true">
          <rect width="32" height="32" rx="7" fill="var(--color-ink-panel-raised)" />
          <rect x="4" y="6" width="3" height="20" rx="1.5" fill="var(--color-amber)" />
          <rect x="12" y="10" width="16" height="3" rx="1.5" fill="var(--color-text)" />
          <rect x="12" y="16" width="11" height="3" rx="1.5" fill="var(--color-diff-green)" />
          <rect x="12" y="22" width="7" height="3" rx="1.5" fill="var(--color-text-faint)" />
        </svg>
        <span className="font-display text-[15px] font-semibold tracking-tight">DevAgent</span>
      </div>

      <nav className="flex-1 space-y-0.5 px-3">
        {links.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            onClick={onClose}
            className={({ isActive }) =>
              `flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-all duration-200 relative overflow-hidden group border-l-2 ${
                isActive
                  ? 'bg-[var(--color-ink-panel-raised)] text-[var(--color-text)] border-[var(--color-amber)]'
                  : 'text-[var(--color-text-muted)] border-transparent hover:bg-[rgba(232,179,57,0.04)] hover:text-[var(--color-text)] hover:translate-x-1'
              }`
            }
          >
            <Icon size={16} strokeWidth={1.75} className="transition-transform group-hover:scale-110" />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* User footer */}
      <div className="border-t border-[var(--color-ink-border)] px-4 py-3">
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
