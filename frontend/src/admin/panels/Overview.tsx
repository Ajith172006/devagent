import { useEffect, useState } from 'react';
import { useAdmin } from '../AdminContext';
import type { AdminOverview } from '../api';
import { PageHeader, StatCard, Spinner, ErrorBox, Badge } from '../components/ui';

export function Overview() {
  const { api } = useAdmin();
  const [data, setData] = useState<AdminOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.overview()
      .then(setData)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [api]);

  if (loading) return <Spinner />;
  if (error) return <ErrorBox message={error} />;
  if (!data) return null;

  const { counts, streak, leetcodeStats } = data;

  return (
    <div>
      <PageHeader title="Overview" subtitle="Live snapshot of all workspace data." />

      {/* Count stats */}
      <div style={grid4}>
        <StatCard label="Snippets" value={counts.snippets} color="#e8b339" />
        <StatCard label="Notes" value={counts.notes} color="#4fae84" />
        <StatCard label="Goals" value={counts.goals} color="#60a5fa" />
        <StatCard label="LeetCode" value={counts.leetcode} color="#a78bfa" />
      </div>

      {/* Streak */}
      <Section title="Coding Streak">
        <div style={grid3}>
          <StatCard label="Current streak" value={`${streak.currentStreak}d`} color="#e8b339" />
          <StatCard label="Longest streak" value={`${streak.longestStreak}d`} color="#4fae84" />
          <StatCard label="Total completed days" value={streak.totalCompletedDays} color="#60a5fa" />
        </div>
      </Section>

      {/* LeetCode */}
      <Section title="LeetCode Stats">
        <div style={grid3}>
          <StatCard label="Total solved" value={`${leetcodeStats.totalSolved} / ${leetcodeStats.totalProblems}`} color="#4fae84" />
          <StatCard label="Easy solved" value={`${leetcodeStats.easy.solved} / ${leetcodeStats.easy.attempted}`} color="#4fae84" />
          <StatCard label="Medium solved" value={`${leetcodeStats.medium.solved} / ${leetcodeStats.medium.attempted}`} color="#e8b339" />
        </div>
        {leetcodeStats.topTopics.length > 0 && (
          <div style={{ marginTop: 16 }}>
            <div style={sectionLabel}>Top topics</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 8 }}>
              {leetcodeStats.topTopics.map(t => (
                <Badge key={t.topic} text={`${t.topic} ×${t.count}`} color="#a78bfa" />
              ))}
            </div>
          </div>
        )}
      </Section>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginTop: 28 }}>
      <div style={sectionLabel}>{title}</div>
      <div style={{ marginTop: 12 }}>{children}</div>
    </div>
  );
}

const grid4: React.CSSProperties = { display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(160px,1fr))', gap: 12 };
const grid3: React.CSSProperties = { display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(180px,1fr))', gap: 12 };
const sectionLabel: React.CSSProperties = { fontSize: 11, fontWeight: 700, color: '#565c72', textTransform: 'uppercase', letterSpacing: '0.07em' };
