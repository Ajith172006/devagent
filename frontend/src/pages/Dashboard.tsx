import { useEffect, useState } from 'react';
import { Code2, Trophy, Flame, StickyNote, Copy, Check } from 'lucide-react';
import { snippetsApi, leetcodeApi, goalsApi, notesApi } from '../api/modules';
import { GutterCard } from '../components/GutterCard';
import { Loader } from '../components/ui';
import { useAuth } from '../context/AuthContext';
import type { LeetcodeStats, Streak } from '../types';

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

function CopyId({ id }: { id: string }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(id).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };
  return (
    <button
      onClick={copy}
      title="Copy your User ID"
      className="flex items-center gap-1.5 rounded-md border border-[var(--color-ink-border)] bg-[var(--color-ink-panel-raised)] px-2 py-1 font-mono text-[10px] text-[var(--color-text-faint)] hover:border-[var(--color-amber)] hover:text-[var(--color-text)] transition-colors"
    >
      <span className="max-w-[120px] truncate">{id}</span>
      {copied ? <Check size={11} className="text-[var(--color-diff-green)]" /> : <Copy size={11} />}
    </button>
  );
}

export function Dashboard() {
  const { profile, user } = useAuth();
  const displayName = profile?.name || user?.displayName || 'Developer';

  const [loading, setLoading] = useState(true);
  const [snippetCount, setSnippetCount] = useState(0);
  const [noteCount, setNoteCount] = useState(0);
  const [leetcode, setLeetcode] = useState<LeetcodeStats | null>(null);
  const [streak, setStreak] = useState<Streak | null>(null);

  useEffect(() => {
    Promise.all([snippetsApi.list(), notesApi.list(), leetcodeApi.stats(), goalsApi.streak()])
      .then(([snippets, notes, stats, s]) => {
        setSnippetCount(snippets.length);
        setNoteCount(notes.length);
        setLeetcode(stats);
        setStreak(s);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Loader label="Pulling your stats together…" />;

  const stat = (
    label: string,
    value: number | string,
    icon: React.ReactNode,
    gutter: 'amber' | 'green' | 'red' | 'muted',
  ) => (
    <GutterCard gutter={gutter} className="flex items-center justify-between">
      <div>
        <p className="text-xs text-[var(--color-text-muted)]">{label}</p>
        <p className="font-data text-2xl font-semibold mt-1">{value}</p>
      </div>
      <div className="text-[var(--color-text-faint)]">{icon}</div>
    </GutterCard>
  );

  return (
    <div className="space-y-6">
      {/* Greeting */}
      <div className="rounded-xl border border-[var(--color-ink-border)] bg-[var(--color-ink-panel)] px-6 py-5 flex items-center gap-4">
        {user?.photoURL && (
          <img src={user.photoURL} alt="avatar" className="h-12 w-12 rounded-full ring-2 ring-[var(--color-amber)]" />
        )}
        <div className="flex-1 min-w-0">
          <p className="text-xs text-[var(--color-text-muted)]">{getGreeting()}</p>
          <h2 className="font-display text-xl font-semibold">Welcome, {displayName} 👋</h2>
          {profile && (
            <p className="text-xs text-[var(--color-text-faint)] mt-0.5">
              {profile.profession} · {profile.age} yrs
            </p>
          )}
        </div>
        {user?.uid && (
          <div className="flex flex-col items-end gap-1 shrink-0">
            <p className="text-[10px] text-[var(--color-text-faint)]">Your User ID</p>
            <CopyId id={user.uid} />
          </div>
        )}
      </div>
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stat('Snippets saved', snippetCount, <Code2 size={20} />, 'amber')}
        {stat('LeetCode solved', leetcode?.totalSolved ?? 0, <Trophy size={20} />, 'green')}
        {stat('Current streak', `${streak?.currentStreak ?? 0}d`, <Flame size={20} />, 'red')}
        {stat('Notes', noteCount, <StickyNote size={20} />, 'muted')}
      </div>

      {leetcode && (
        <GutterCard gutter="green">
          <h2 className="font-display text-sm font-semibold mb-3">Difficulty breakdown</h2>
          <div className="grid grid-cols-3 gap-4">
            {(['easy', 'medium', 'hard'] as const).map((d) => (
              <div key={d}>
                <p className="text-xs capitalize text-[var(--color-text-muted)]">{d}</p>
                <p className="font-data text-lg">
                  {leetcode[d].solved}
                  <span className="text-[var(--color-text-faint)]"> / {leetcode[d].attempted}</span>
                </p>
              </div>
            ))}
          </div>
        </GutterCard>
      )}

      <p className="hash-tag">
        Pick a workspace tool from the sidebar to keep going.
      </p>
    </div>
  );
}
