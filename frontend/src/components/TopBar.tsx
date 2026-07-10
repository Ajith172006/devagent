import { useEffect, useState } from 'react';
import { Flame, UserCircle, Menu } from 'lucide-react';
import { goalsApi } from '../api/modules';
import type { Streak, Goal } from '../types';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

export function TopBar({ title, onMenuClick }: { title: string; onMenuClick?: () => void }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [streak, setStreak] = useState<Streak | null>(null);
  const [today, setToday] = useState<Goal | null>(null);

  useEffect(() => {
    goalsApi.streak().then(setStreak).catch(() => setStreak(null));
    goalsApi
      .list()
      .then((goals) => setToday(goals.find((g) => g.date === todayIso()) ?? null))
      .catch(() => setToday(null));
  }, []);

  return (
    <header className="flex items-center justify-between border-b border-[var(--color-ink-border)] px-4 py-4 md:px-6">
      <div className="flex items-center gap-3">
        {onMenuClick && (
          <button
            onClick={onMenuClick}
            className="md:hidden flex h-8 w-8 items-center justify-center rounded-md hover:bg-[var(--color-ink-panel-raised)] text-[var(--color-text-muted)] transition-colors"
            title="Open Menu"
          >
            <Menu size={20} />
          </button>
        )}
        <h1 className="font-display text-lg font-semibold">{title}</h1>
      </div>

      <div className="flex items-center gap-4 text-sm text-[var(--color-text-muted)]">
        {today && (
          <div className="hidden sm:flex items-center gap-2">
            <span className="hash-tag">today</span>
            <div className="h-1.5 w-24 overflow-hidden rounded-full bg-[var(--color-ink-panel-raised)]">
              <div
                className="h-full rounded-full bg-[var(--color-diff-green)]"
                style={{
                  width: `${Math.min(100, (today.minutesLogged / today.targetMinutes) * 100)}%`,
                }}
              />
            </div>
            <span className="font-data text-xs">
              {today.minutesLogged}/{today.targetMinutes}m
            </span>
          </div>
        )}
        {streak && streak.currentStreak > 0 && (
          <div className="flex items-center gap-1.5 rounded-full bg-[var(--color-ink-panel)] px-3 py-1 border border-[var(--color-ink-border)]">
            <Flame size={14} className="text-[var(--color-amber)]" strokeWidth={2} />
            <span className="font-data text-xs font-medium">{streak.currentStreak} day streak</span>
          </div>
        )}
        <button
          onClick={() => navigate('/profile')}
          className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--color-ink-panel-raised)] hover:bg-[var(--color-ink-border)] text-[var(--color-text-muted)] transition-colors overflow-hidden"
          title="View Profile"
        >
          {user?.photoURL ? (
            <img src={user.photoURL} alt="Profile" className="h-full w-full object-cover" />
          ) : (
            <UserCircle size={20} />
          )}
        </button>
      </div>
    </header>
  );
}
