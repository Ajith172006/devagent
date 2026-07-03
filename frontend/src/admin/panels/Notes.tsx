import { useEffect, useState } from 'react';
import { useAdmin } from '../AdminContext';
import type { AdminNote } from '../api';
import { PageHeader, Table, DangerButton, Spinner, ErrorBox, ConfirmModal, Badge } from '../components/ui';

export function Notes() {
  const { api } = useAdmin();
  const [rows, setRows] = useState<AdminNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [confirm, setConfirm] = useState<{ msg: string; action: () => Promise<void> } | null>(null);
  const [busy, setBusy] = useState(false);

  const load = () => {
    setLoading(true);
    api.notes.list()
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
    _id: r.id,
    title: r.title,
    pinned: r.pinned ? <Badge text="pinned" color="#4fae84" /> : <span style={{ color: '#565c72' }}>—</span>,
    tags: r.tags.length ? r.tags.map(t => <Badge key={t} text={t} color="#8b90a3" />).reduce<React.ReactNode[]>((a, c) => [...a, ' ', c], []) : <span style={{ color: '#565c72' }}>—</span>,
    preview: r.content.slice(0, 80) + (r.content.length > 80 ? '…' : ''),
    updated: r.updatedAt.slice(0, 10),
  }));

  return (
    <div>
      {confirm && <ConfirmModal message={confirm.msg} onConfirm={run} onCancel={() => setConfirm(null)} />}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 20 }}>
        <PageHeader title="Notes" subtitle={`${rows.length} record${rows.length !== 1 ? 's' : ''}`} />
        <DangerButton label="Delete all notes" disabled={busy || rows.length === 0}
          onClick={() => ask(`Delete all ${rows.length} notes? This cannot be undone.`, () => api.notes.deleteAll())} />
      </div>
      {error && <ErrorBox message={error} />}
      {loading ? <Spinner /> : (
        <Table
          columns={[
            { key: 'title', label: 'Title' },
            { key: 'pinned', label: 'Pinned', width: 80 },
            { key: 'tags', label: 'Tags' },
            { key: 'preview', label: 'Content preview' },
            { key: 'updated', label: 'Updated', width: 100 },
          ]}
          rows={tableRows}
          onDelete={row => ask(`Delete note "${row.title}"?`, () => api.notes.delete(row._id as string))}
        />
      )}
    </div>
  );
}
