import { useEffect, useState } from 'react';
import { Flame, Target } from 'lucide-react';
import { goalsApi } from '../api/modules';
import type { Goal, Streak } from '../types';
import { GutterCard } from '../components/GutterCard';
import { Button, ErrorNote, Input, Loader } from '../components/ui';

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

/** last N days, oldest first */
function lastNDays(n: number): string[] {
  const days: string[] = [];
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push(d.toISOString().slice(0, 10));
  }
  return days;
}

export function Goals() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [streak, setStreak] = useState<Streak | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [targetMinutes, setTargetMinutes] = useState(60);
  const [focus, setFocus] = useState('');
  const [minutesToLog, setMinutesToLog] = useState(15);
  const [saving, setSaving] = useState(false);

  const load = () => {
    setLoading(true);
    Promise.all([goalsApi.list(), goalsApi.streak()])
      .then(([g, s]) => {
        setGoals(g);
        setStreak(s);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const today = goals.find((g) => g.date === todayIso());

  async function handleSetGoal(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await goalsApi.setGoal({ date: todayIso(), targetMinutes, focus: focus || undefined });
      load();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setSaving(false);
    }
  }

  async function handleLogProgress() {
    if (!today) return;
    setSaving(true);
    try {
      await goalsApi.logProgress(today.date, minutesToLog);
      load();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <Loader />;

  const days = lastNDays(84); // 12 weeks, github-style
  const goalByDate = new Map(goals.map((g) => [g.date, g]));

  return (
    <div className="max-w-3xl space-y-5">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <GutterCard gutter="red" className="flex items-center gap-3">
          <Flame size={24} className="text-[var(--color-diff-red)]" />
          <div>
            <p className="text-xs text-[var(--color-text-muted)]">Current streak</p>
            <p className="font-data text-xl font-semibold">{streak?.currentStreak ?? 0} days</p>
          </div>
        </GutterCard>
        <GutterCard gutter="amber" className="flex items-center gap-3">
          <Target size={24} className="text-[var(--color-amber)]" />
          <div>
            <p className="text-xs text-[var(--color-text-muted)]">Longest streak</p>
            <p className="font-data text-xl font-semibold">{streak?.longestStreak ?? 0} days</p>
          </div>
        </GutterCard>
      </div>

      {error && <ErrorNote message={error} />}

      <GutterCard gutter="green">
        <h2 className="font-display text-sm font-semibold mb-3">Today</h2>
        {!today ? (
          <form onSubmit={handleSetGoal} className="flex flex-wrap gap-3 items-end">
            <div>
              <label className="text-xs text-[var(--color-text-muted)]">Target minutes</label>
              <Input
                type="number"
                min={1}
                value={targetMinutes}
                onChange={(e) => setTargetMinutes(Number(e.target.value))}
                className="w-28"
              />
            </div>
            <div className="flex-1 min-w-[160px]">
              <label className="text-xs text-[var(--color-text-muted)]">Focus (optional)</label>
              <Input placeholder="e.g. Dynamic programming" value={focus} onChange={(e) => setFocus(e.target.value)} />
            </div>
            <Button type="submit" disabled={saving}>
              {saving ? 'Setting…' : 'Set today\u2019s goal'}
            </Button>
          </form>
        ) : (
          <div className="space-y-3">
            <div>
              <div className="flex items-center justify-between text-sm mb-1">
                <span>{today.focus || 'No focus set'}</span>
                <span className="font-data">
                  {today.minutesLogged}/{today.targetMinutes}m {today.completed && '✓'}
                </span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-[var(--color-ink-panel-raised)]">
                <div
                  className="h-full rounded-full bg-[var(--color-diff-green)] transition-all"
                  style={{ width: `${Math.min(100, (today.minutesLogged / today.targetMinutes) * 100)}%` }}
                />
              </div>
            </div>
            <div className="flex items-end gap-3">
              <div>
                <label className="text-xs text-[var(--color-text-muted)]">Log minutes</label>
                <Input
                  type="number"
                  min={1}
                  value={minutesToLog}
                  onChange={(e) => setMinutesToLog(Number(e.target.value))}
                  className="w-28"
                />
              </div>
              <Button onClick={handleLogProgress} disabled={saving}>
                {saving ? 'Logging…' : 'Log progress'}
              </Button>
            </div>
          </div>
        )}
      </GutterCard>

      <GutterCard gutter="muted">
        <h2 className="font-display text-sm font-semibold mb-3">Last 12 weeks</h2>
        <div className="grid grid-flow-col grid-rows-7 gap-1 w-fit">
          {days.map((date) => {
            const g = goalByDate.get(date);
            const bg = g?.completed
              ? 'var(--color-diff-green)'
              : g
                ? 'var(--color-amber-dim)'
                : 'var(--color-ink-panel-raised)';
            return (
              <div
                key={date}
                title={`${date}${g ? ` — ${g.minutesLogged}/${g.targetMinutes}m` : ''}`}
                className="h-3 w-3 rounded-[2px]"
                style={{ background: bg }}
              />
            );
          })}
        </div>
        <div className="mt-3 flex items-center gap-3 text-xs text-[var(--color-text-faint)]">
          <span className="flex items-center gap-1">
            <span className="h-2.5 w-2.5 rounded-[2px]" style={{ background: 'var(--color-ink-panel-raised)' }} /> no goal
          </span>
          <span className="flex items-center gap-1">
            <span className="h-2.5 w-2.5 rounded-[2px]" style={{ background: 'var(--color-amber-dim)' }} /> in progress
          </span>
          <span className="flex items-center gap-1">
            <span className="h-2.5 w-2.5 rounded-[2px]" style={{ background: 'var(--color-diff-green)' }} /> completed
          </span>
        </div>
      </GutterCard>
    </div>
  );
}
