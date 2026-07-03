import { useEffect, useState } from 'react';
import { useAdmin } from '../AdminContext';
import type { AdminLeetcode } from '../api';
import { PageHeader, Table, DangerButton, Spinner, ErrorBox, ConfirmModal, Badge } from '../components/ui';

const DIFF_COLORS: Record<string, string> = { Easy: '#4fae84', Medium: '#e8b339', Hard: '#e2596b' };
const STATUS_COLORS: Record<string, string> = { Solved: '#4fae84', Attempted: '#60a5fa', Review: '#e8b339' };

export function Leetcode() {
  const { api } = useAdmin();
  const [rows, setRows] = useState<AdminLeetcode[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [confirm, setConfirm] = useState<{ msg: string; action: () => Promise<void> } | null>(null);
  const [busy, setBusy] = useState(false);
  const [filter, setFilter] = useState('');

  const load = () => {
    setLoading(true);
    api.leetcode.list()
      .then(setRows)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(load, [api]);

  const ask = (msg: string, action: () => Promise<void>) => setConfirm({ msg, action });
  const run = async () => {
    if (!confirm) return;
    setBusy(true);
    try { await confirm.action(); load(); }
    catch (e: unknown) { setError(e instanceof Error ? e.message : 'Failed'); }
    finally { setBusy(false); setConfirm(null); }
  };

  const filtered = filter ? rows.filter(r => r.difficulty === filter) : rows;

  const tableRows = filtered.map(r => ({
    _id: r.id,
    title: r.url
      ? <a href={r.url} target="_blank" rel="noopener" style={{ color: '#60a5fa', textDecoration: 'none' }}>{r.title}</a>
      : r.title,
    user: <span style={{ fontFamily: 'monospace', fontSize: 11, color: '#565c72' }}>{r.userId.slice(0, 12)}…</span>,
    difficulty: <Badge text={r.difficulty} color={DIFF_COLORS[r.difficulty] || '#8b90a3'} />,
    status: <Badge text={r.status} color={STATUS_COLORS[r.status] || '#8b90a3'} />,
    topics: r.topics.length
      ? r.topics.slice(0, 3).map(t => <Badge key={t} text={t} color="#a78bfa" />).reduce<React.ReactNode[]>((a, c) => [...a, ' ', c], [])
      : <span style={{ color: '#565c72' }}>—</span>,
    solved: r.solvedAt ? <span style={{ fontFamily: 'monospace', fontSize: 12 }}>{r.solvedAt}</span> : <span style={{ color: '#565c72' }}>—</span>,
  }));

  return (
    <div>
      {confirm && <ConfirmModal message={confirm.msg} onConfirm={run} onCancel={() => setConfirm(null)} />}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 20 }}>
        <PageHeader title="LeetCode Entries" subtitle={`${rows.length} total · ${filtered.length} shown`} />
        <DangerButton label="Delete all entries" disabled={busy || rows.length === 0}
          onClick={() => ask(`Delete all ${rows.length} LeetCode entries?`, () => api.leetcode.deleteAll())} />
      </div>

      {/* Filter pills */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 16 }}>
        {['', 'Easy', 'Medium', 'Hard'].map(d => (
          <button key={d} onClick={() => setFilter(d)}
            style={{ padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 600, cursor: 'pointer', border: '1px solid', borderColor: filter === d ? (DIFF_COLORS[d] || '#e8b339') : '#262b3a', background: filter === d ? (DIFF_COLORS[d] || '#e8b339') + '22' : 'transparent', color: filter === d ? (DIFF_COLORS[d] || '#e8b339') : '#8b90a3' }}>
            {d || 'All'}
          </button>
        ))}
      </div>

      {error && <ErrorBox message={error} />}
      {loading ? <Spinner /> : (
        <Table
          columns={[
            { key: 'title', label: 'Title' },
            { key: 'user', label: 'User ID', width: 120 },
            { key: 'difficulty', label: 'Difficulty', width: 100 },
            { key: 'status', label: 'Status', width: 100 },
            { key: 'topics', label: 'Topics' },
            { key: 'solved', label: 'Solved at', width: 100 },
          ]}
          rows={tableRows}
          onDelete={row => ask(`Delete "${row.title}" entry?`, () => api.leetcode.delete(row._id as string))}
        />
      )}
    </div>
  );
}
