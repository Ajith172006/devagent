import { useEffect, useState } from 'react';
import { Code2, Trophy, Flame, StickyNote } from 'lucide-react';
import { snippetsApi, leetcodeApi, goalsApi, notesApi } from '../api/modules';
import { GutterCard } from '../components/GutterCard';
import { Loader } from '../components/ui';
import type { LeetcodeStats, Streak } from '../types';

export function Dashboard() {
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
        Welcome back — pick a workspace tool from the sidebar to keep going.
      </p>
    </div>
  );
}
