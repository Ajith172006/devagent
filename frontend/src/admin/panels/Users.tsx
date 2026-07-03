import { useEffect, useState } from 'react';
import { useAdmin } from '../AdminContext';
import type { AdminUser, AdminUserData } from '../api';
import {
  PageHeader, Table, DangerButton, Spinner, ErrorBox,
  ConfirmModal, Badge, StatCard,
} from '../components/ui';

export function Users() {
  const { api } = useAdmin();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selected, setSelected] = useState<AdminUser | null>(null);
  const [userData, setUserData] = useState<AdminUserData | null>(null);
  const [userDataLoading, setUserDataLoading] = useState(false);
  const [confirm, setConfirm] = useState<{ msg: string; action: () => Promise<void> } | null>(null);
  const [busy, setBusy] = useState(false);
  const [activeTab, setActiveTab] = useState<'snippets' | 'notes' | 'goals' | 'leetcode'>('snippets');

  const load = () => {
    setLoading(true);
    api.users.list()
      .then(setUsers)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(load, [api]);

  const selectUser = (u: AdminUser) => {
    setSelected(u);
    setUserData(null);
    setActiveTab('snippets');
    setUserDataLoading(true);
    api.users.getData(u.id)
      .then(setUserData)
      .catch(e => setError(e.message))
      .finally(() => setUserDataLoading(false));
  };

  const ask = (msg: string, action: () => Promise<void>) => setConfirm({ msg, action });
  const run = async () => {
    if (!confirm) return;
    setBusy(true);
    try { await confirm.action(); load(); setSelected(null); setUserData(null); }
    catch (e: unknown) { setError(e instanceof Error ? e.message : 'Failed'); }
    finally { setBusy(false); setConfirm(null); }
  };

  const userRows = users.map(u => ({
    _id: u.id,
    avatar: u.photoUrl
      ? <img src={u.photoUrl} alt={u.name} style={{ width: 28, height: 28, borderRadius: '50%' }} />
      : <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#1e2230', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, color: '#8b90a3' }}>{u.name[0]?.toUpperCase()}</div>,
    name: <button onClick={() => selectUser(u)} style={{ background: 'none', border: 'none', color: '#60a5fa', cursor: 'pointer', fontSize: 13, textAlign: 'left' as const }}>{u.name}</button>,
    profession: u.profession,
    age: u.age,
    gender: u.gender,
    email: u.email || <span style={{ color: '#565c72' }}>—</span>,
    joined: u.createdAt.slice(0, 10),
    uid: <span style={{ fontFamily: 'monospace', fontSize: 11, color: '#565c72' }}>{u.id.slice(0, 16)}…</span>,
  }));

  return (
    <div>
      {confirm && <ConfirmModal message={confirm.msg} onConfirm={run} onCancel={() => setConfirm(null)} />}

      {/* User list */}
      {!selected ? (
        <>
          <PageHeader title="Users" subtitle={`${users.length} registered user${users.length !== 1 ? 's' : ''}`} />
          {error && <ErrorBox message={error} />}
          {loading ? <Spinner /> : (
            <Table
              columns={[
                { key: 'avatar', label: '', width: 40 },
                { key: 'name', label: 'Name' },
                { key: 'profession', label: 'Profession' },
                { key: 'age', label: 'Age', width: 60 },
                { key: 'gender', label: 'Gender', width: 100 },
                { key: 'email', label: 'Email' },
                { key: 'joined', label: 'Joined', width: 100 },
                { key: 'uid', label: 'Firebase UID' },
              ]}
              rows={userRows}
              onDelete={row => ask(
                `Delete user "${row.name}" and ALL their data (snippets, notes, goals, LeetCode)? This cannot be undone.`,
                () => api.users.delete(row._id as string),
              )}
              deleteLabel="Delete user"
            />
          )}
        </>
      ) : (
        /* User detail view */
        <UserDetail
          user={selected}
          data={userData}
          loading={userDataLoading}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          onBack={() => { setSelected(null); setUserData(null); load(); }}
          onDelete={() => ask(
            `Delete user "${selected.name}" and ALL their data? This cannot be undone.`,
            () => api.users.delete(selected.id),
          )}
          busy={busy}
        />
      )}
    </div>
  );
}

function UserDetail({
  user, data, loading, activeTab, onTabChange, onBack, onDelete, busy,
}: {
  user: AdminUser;
  data: AdminUserData | null;
  loading: boolean;
  activeTab: string;
  onTabChange: (t: 'snippets' | 'notes' | 'goals' | 'leetcode') => void;
  onBack: () => void;
  onDelete: () => void;
  busy: boolean;
}) {
  const TABS = ['snippets', 'notes', 'goals', 'leetcode'] as const;
  const DIFF_COLORS: Record<string, string> = { Easy: '#4fae84', Medium: '#e8b339', Hard: '#e2596b' };
  const STATUS_COLORS: Record<string, string> = { Solved: '#4fae84', Attempted: '#60a5fa', Review: '#e8b339' };

  return (
    <div>
      {/* Back + header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
        <button onClick={onBack} style={{ background: 'transparent', border: '1px solid #262b3a', color: '#8b90a3', borderRadius: 7, padding: '6px 12px', cursor: 'pointer', fontSize: 12 }}>
          ← Back
        </button>
        <div style={{ flex: 1 }}>
          <PageHeader
            title={user.name}
            subtitle={`${user.profession} · ${user.age} yrs · ${user.gender}`}
          />
        </div>
        <DangerButton label="Delete user & data" onClick={onDelete} disabled={busy} />
      </div>

      {/* User info card */}
      <div style={{ background: '#171a24', border: '1px solid #262b3a', borderRadius: 10, padding: '16px 20px', marginBottom: 20, display: 'flex', gap: 20, flexWrap: 'wrap', alignItems: 'center' }}>
        {user.photoUrl && <img src={user.photoUrl} alt={user.name} style={{ width: 48, height: 48, borderRadius: '50%' }} />}
        <div style={{ flex: 1, minWidth: 200 }}>
          <div style={{ fontSize: 12, color: '#8b90a3', marginBottom: 4 }}>Firebase UID</div>
          <div style={{ fontFamily: 'monospace', fontSize: 12, color: '#e8b339', wordBreak: 'break-all' }}>{user.id}</div>
        </div>
        {user.email && <div style={{ fontSize: 13, color: '#8b90a3' }}>{user.email}</div>}
        <div style={{ fontSize: 12, color: '#565c72' }}>Joined {user.createdAt.slice(0, 10)}</div>
      </div>

      {/* Stats */}
      {data && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(130px,1fr))', gap: 10, marginBottom: 20 }}>
          <StatCard label="Snippets" value={data.counts.snippets} color="#e8b339" />
          <StatCard label="Notes" value={data.counts.notes} color="#4fae84" />
          <StatCard label="Goals" value={data.counts.goals} color="#60a5fa" />
          <StatCard label="LeetCode" value={data.counts.leetcode} color="#a78bfa" />
          <StatCard label="Streak" value={`${data.streak.currentStreak}d`} color="#e8b339" />
        </div>
      )}

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 16 }}>
        {TABS.map(t => (
          <button key={t} onClick={() => onTabChange(t)}
            style={{ padding: '5px 14px', borderRadius: 20, fontSize: 12, fontWeight: 600, cursor: 'pointer', border: '1px solid', borderColor: activeTab === t ? '#60a5fa' : '#262b3a', background: activeTab === t ? 'rgba(96,165,250,.15)' : 'transparent', color: activeTab === t ? '#60a5fa' : '#8b90a3', textTransform: 'capitalize' }}>
            {t}
          </button>
        ))}
      </div>

      {loading ? <Spinner /> : !data ? null : (
        <>
          {activeTab === 'snippets' && (
            <Table
              columns={[
                { key: 'title', label: 'Title' },
                { key: 'lang', label: 'Language', width: 110 },
                { key: 'tags', label: 'Tags' },
                { key: 'created', label: 'Created', width: 100 },
              ]}
              rows={data.snippets.map(s => ({
                title: s.title,
                lang: <Badge text={s.language} color="#e8b339" />,
                tags: s.tags.length ? s.tags.map(t => <Badge key={t} text={t} color="#8b90a3" />) : '—',
                created: s.createdAt.slice(0, 10),
              }))}
            />
          )}
          {activeTab === 'notes' && (
            <Table
              columns={[
                { key: 'title', label: 'Title' },
                { key: 'pinned', label: 'Pinned', width: 70 },
                { key: 'preview', label: 'Content' },
                { key: 'updated', label: 'Updated', width: 100 },
              ]}
              rows={data.notes.map(n => ({
                title: n.title,
                pinned: n.pinned ? <Badge text="pin" color="#4fae84" /> : '—',
                preview: n.content.slice(0, 80) + (n.content.length > 80 ? '…' : ''),
                updated: n.updatedAt.slice(0, 10),
              }))}
            />
          )}
          {activeTab === 'goals' && (
            <Table
              columns={[
                { key: 'date', label: 'Date', width: 110 },
                { key: 'progress', label: 'Progress', width: 140 },
                { key: 'status', label: 'Status', width: 100 },
                { key: 'focus', label: 'Focus' },
              ]}
              rows={data.goals.map(g => ({
                date: <span style={{ fontFamily: 'monospace' }}>{g.date}</span>,
                progress: `${g.minutesLogged} / ${g.targetMinutes} min`,
                status: g.completed ? <Badge text="✓ done" color="#4fae84" /> : <Badge text="in progress" color="#e8b339" />,
                focus: g.focus || '—',
              }))}
            />
          )}
          {activeTab === 'leetcode' && (
            <Table
              columns={[
                { key: 'title', label: 'Title' },
                { key: 'diff', label: 'Difficulty', width: 100 },
                { key: 'status', label: 'Status', width: 100 },
                { key: 'topics', label: 'Topics' },
                { key: 'solved', label: 'Solved', width: 100 },
              ]}
              rows={data.leetcode.map(e => ({
                title: e.url ? <a href={e.url} target="_blank" rel="noopener" style={{ color: '#60a5fa' }}>{e.title}</a> : e.title,
                diff: <Badge text={e.difficulty} color={DIFF_COLORS[e.difficulty] || '#8b90a3'} />,
                status: <Badge text={e.status} color={STATUS_COLORS[e.status] || '#8b90a3'} />,
                topics: e.topics.slice(0, 3).map(t => <Badge key={t} text={t} color="#a78bfa" />) || '—',
                solved: e.solvedAt || '—',
              }))}
            />
          )}
        </>
      )}
    </div>
  );
}
