import { useEffect, useState } from 'react';
import { useAdmin } from '../AdminContext';
import type { AdminGoal } from '../api';
import { PageHeader, Table, DangerButton, Spinner, ErrorBox, ConfirmModal, Badge } from '../components/ui';

export function Goals() {
  const { api } = useAdmin();
  const [rows, setRows] = useState<AdminGoal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [confirm, setConfirm] = useState<{ msg: string; action: () => Promise<void> } | null>(null);
  const [busy, setBusy] = useState(false);

  const load = () => {
    setLoading(true);
    api.goals.list()
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

  const tableRows = rows.map(r => ({
    _date: r.date,
    date: <span style={{ fontFamily: 'monospace' }}>{r.date}</span>,
    progress: `${r.minutesLogged} / ${r.targetMinutes} min`,
    pct: (
      <div style={{ width: 80, background: '#262b3a', borderRadius: 4, height: 6, overflow: 'hidden' }}>
        <div style={{ height: '100%', borderRadius: 4, background: r.completed ? '#4fae84' : '#e8b339', width: `${Math.min(100, (r.minutesLogged / r.targetMinutes) * 100)}%` }} />
      </div>
    ),
    status: r.completed
      ? <Badge text="✓ done" color="#4fae84" />
      : <Badge text="in progress" color="#e8b339" />,
    focus: r.focus || <span style={{ color: '#565c72' }}>—</span>,
  }));

  return (
    <div>
      {confirm && <ConfirmModal message={confirm.msg} onConfirm={run} onCancel={() => setConfirm(null)} />}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 20 }}>
        <PageHeader title="Daily Goals" subtitle={`${rows.length} record${rows.length !== 1 ? 's' : ''}`} />
        <DangerButton label="Delete all goals" disabled={busy || rows.length === 0}
          onClick={() => ask(`Delete all ${rows.length} goals? This resets your streak history.`, () => api.goals.deleteAll())} />
      </div>
      {error && <ErrorBox message={error} />}
      {loading ? <Spinner /> : (
        <Table
          columns={[
            { key: 'date', label: 'Date', width: 110 },
            { key: 'progress', label: 'Progress', width: 140 },
            { key: 'pct', label: '', width: 100 },
            { key: 'status', label: 'Status', width: 100 },
            { key: 'focus', label: 'Focus' },
          ]}
          rows={tableRows}
          onDelete={row => ask(`Delete goal for ${row._date}?`, () => api.goals.delete(row._date as string))}
        />
      )}
    </div>
  );
}
