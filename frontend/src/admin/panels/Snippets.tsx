import { useEffect, useState } from 'react';
import { useAdmin } from '../AdminContext';
import type { AdminSnippet } from '../api';
import { PageHeader, Table, DangerButton, Spinner, ErrorBox, ConfirmModal, Badge } from '../components/ui';

export function Snippets() {
  const { api } = useAdmin();
  const [rows, setRows] = useState<AdminSnippet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [confirm, setConfirm] = useState<{ msg: string; action: () => Promise<void> } | null>(null);
  const [busy, setBusy] = useState(false);

  const load = () => {
    setLoading(true);
    api.snippets.list()
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
    user: <span style={{ fontFamily: 'monospace', fontSize: 11, color: '#565c72' }}>{r.userId.slice(0, 12)}…</span>,
    language: <Badge text={r.language} color="#e8b339" />,
    tags: r.tags.length ? r.tags.map(t => <Badge key={t} text={t} color="#8b90a3" />).reduce<React.ReactNode[]>((a, c) => [...a, ' ', c], []) : <span style={{ color: '#565c72' }}>—</span>,
    desc: r.description || <span style={{ color: '#565c72' }}>—</span>,
    created: r.createdAt.slice(0, 10),
  }));

  return (
    <div>
      {confirm && <ConfirmModal message={confirm.msg} onConfirm={run} onCancel={() => setConfirm(null)} />}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 20 }}>
        <PageHeader title="Snippets" subtitle={`${rows.length} record${rows.length !== 1 ? 's' : ''}`} />
        <DangerButton label="Delete all snippets" disabled={busy || rows.length === 0}
          onClick={() => ask(`Delete all ${rows.length} snippets? This cannot be undone.`, () => api.snippets.deleteAll())} />
      </div>
      {error && <ErrorBox message={error} />}
      {loading ? <Spinner /> : (
        <Table
          columns={[
            { key: 'title', label: 'Title' },
            { key: 'user', label: 'User ID', width: 120 },
            { key: 'language', label: 'Language', width: 110 },
            { key: 'tags', label: 'Tags' },
            { key: 'desc', label: 'Description' },
            { key: 'created', label: 'Created', width: 100 },
          ]}
          rows={tableRows}
          onDelete={row => ask(`Delete snippet "${row.title}"?`, () => api.snippets.delete(row._id as string))}
        />
      )}
    </div>
  );
}
