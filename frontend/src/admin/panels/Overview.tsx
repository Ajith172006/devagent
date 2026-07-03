import { useEffect, useState } from 'react';
import { useAdmin } from '../AdminContext';
import type { AdminOverview } from '../api';
import { PageHeader, StatCard, Spinner, ErrorBox } from '../components/ui';

export function Overview() {
  const { api } = useAdmin();
  const [data, setData] = useState<AdminOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.overview().then(setData).catch(e => setError(e.message)).finally(() => setLoading(false));
  }, [api]);

  if (loading) return <Spinner />;
  if (error) return <ErrorBox message={error} />;
  if (!data) return null;

  const { counts } = data;

  return (
    <div>
      <PageHeader title="Overview" subtitle="Live counts across all users and collections." />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(160px,1fr))', gap: 12 }}>
        <StatCard label="Users" value={counts.users} color="#22d3ee" />
        <StatCard label="Snippets" value={counts.snippets} color="#e8b339" />
        <StatCard label="Notes" value={counts.notes} color="#4fae84" />
        <StatCard label="Goals" value={counts.goals} color="#60a5fa" />
        <StatCard label="LeetCode" value={counts.leetcode} color="#a78bfa" />
      </div>
      <p style={{ marginTop: 24, fontSize: 12, color: '#565c72', fontFamily: 'monospace' }}>
        Select "Users" to inspect and manage individual user data.
      </p>
    </div>
  );
}
