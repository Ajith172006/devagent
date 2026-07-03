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
} from 'lucide-react';

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

export function Sidebar() {
  return (
    <aside className="hidden md:flex w-56 shrink-0 flex-col border-r border-[var(--color-ink-border)] bg-[var(--color-ink-panel)]">
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
            className={({ isActive }) =>
              `flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors ${
                isActive
                  ? 'bg-[var(--color-ink-panel-raised)] text-[var(--color-text)]'
                  : 'text-[var(--color-text-muted)] hover:bg-[var(--color-ink-panel-raised)] hover:text-[var(--color-text)]'
              }`
            }
          >
            <Icon size={16} strokeWidth={1.75} />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="px-5 py-4 hash-tag">devagent · local workspace</div>
    </aside>
  );
}
