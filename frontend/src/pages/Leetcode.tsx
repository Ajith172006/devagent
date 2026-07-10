import { useEffect, useState } from 'react';
import { Plus, Trash2, X } from 'lucide-react';
import { leetcodeApi } from '../api/modules';
import type { LeetcodeEntry, LeetcodeStats, LeetcodeDifficulty, LeetcodeStatus } from '../types';
import { GutterCard } from '../components/GutterCard';
import { Button, EmptyState, ErrorNote, Input, Loader, Select } from '../components/ui';

const difficultyGutter: Record<LeetcodeDifficulty, 'green' | 'amber' | 'red'> = {
  Easy: 'green',
  Medium: 'amber',
  Hard: 'red',
};

const emptyForm = { title: '', url: '', difficulty: 'Easy' as LeetcodeDifficulty, status: 'Solved' as LeetcodeStatus, topics: '' };

export function Leetcode() {
  const [entries, setEntries] = useState<LeetcodeEntry[]>([]);
  const [stats, setStats] = useState<LeetcodeStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [filter, setFilter] = useState<LeetcodeDifficulty | ''>('');

  const load = () => {
    setLoading(true);
    Promise.all([leetcodeApi.list(filter ? { difficulty: filter } : {}), leetcodeApi.stats()])
      .then(([e, s]) => {
        setEntries(e);
        setStats(s);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(load, [filter]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await leetcodeApi.create({
        title: form.title,
        url: form.url || undefined,
        difficulty: form.difficulty,
        status: form.status,
        topics: form.topics ? form.topics.split(',').map((t) => t.trim()).filter(Boolean) : [],
      });
      setForm(emptyForm);
      setShowForm(false);
      load();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    await leetcodeApi.remove(id);
    setEntries((prev) => prev.filter((e) => e.id !== id));
  }

  return (
    <div className="max-w-4xl space-y-5">
      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {(['easy', 'medium', 'hard'] as const).map((d) => (
            <GutterCard key={d} gutter={difficultyGutter[(d[0].toUpperCase() + d.slice(1)) as LeetcodeDifficulty]}>
              <p className="text-xs capitalize text-[var(--color-text-muted)]">{d}</p>
              <p className="font-data text-xl font-semibold">
                {stats[d].solved}
                <span className="text-sm text-[var(--color-text-faint)]"> / {stats[d].attempted}</span>
              </p>
            </GutterCard>
          ))}
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
        <Select value={filter} onChange={(e) => setFilter(e.target.value as LeetcodeDifficulty | '')} className="max-w-[160px]">
          <option value="">All difficulties</option>
          <option value="Easy">Easy</option>
          <option value="Medium">Medium</option>
          <option value="Hard">Hard</option>
        </Select>
        <Button onClick={() => setShowForm((v) => !v)}>
          {showForm ? <X size={15} /> : <Plus size={15} />}
          {showForm ? 'Cancel' : 'Log a problem'}
        </Button>
      </div>

      {error && <ErrorNote message={error} />}

      {showForm && (
        <GutterCard gutter="amber">
          <form onSubmit={handleCreate} className="space-y-3">
            <Input
              required
              placeholder="Problem title (e.g. Two Sum)"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />
            <Input
              placeholder="LeetCode URL (optional)"
              value={form.url}
              onChange={(e) => setForm({ ...form, url: e.target.value })}
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Select
                value={form.difficulty}
                onChange={(e) => setForm({ ...form, difficulty: e.target.value as LeetcodeDifficulty })}
              >
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </Select>
              <Select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as LeetcodeStatus })}>
                <option value="Solved">Solved</option>
                <option value="Attempted">Attempted</option>
                <option value="Review">Review</option>
              </Select>
            </div>
            <Input
              placeholder="Topics, comma separated (e.g. Array, Hash Table)"
              value={form.topics}
              onChange={(e) => setForm({ ...form, topics: e.target.value })}
            />
            <Button type="submit" disabled={saving}>
              {saving ? 'Saving…' : 'Save entry'}
            </Button>
          </form>
        </GutterCard>
      )}

      {loading ? (
        <Loader />
      ) : entries.length === 0 ? (
        <EmptyState
          title="No problems logged yet"
          hint="Track what you've solved, what needs review, and watch your difficulty distribution shift over time."
          icon={<Plus size={22} />}
        />
      ) : (
        <div className="space-y-2">
          {entries.map((e) => (
            <GutterCard key={e.id} gutter={difficultyGutter[e.difficulty]} className="flex items-center justify-between py-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  {e.url ? (
                    <a href={e.url} target="_blank" rel="noopener noreferrer" className="font-medium text-sm hover:text-[var(--color-amber)]">
                      {e.title}
                    </a>
                  ) : (
                    <span className="font-medium text-sm">{e.title}</span>
                  )}
                  <span className="hash-tag">{e.difficulty}</span>
                  <span className="hash-tag">{e.status}</span>
                </div>
                {e.topics.length > 0 && (
                  <p className="text-xs text-[var(--color-text-muted)] mt-0.5">{e.topics.join(' · ')}</p>
                )}
              </div>
              <button
                onClick={() => handleDelete(e.id)}
                aria-label={`Delete ${e.title}`}
                className="shrink-0 text-[var(--color-text-faint)] hover:text-[var(--color-diff-red)]"
              >
                <Trash2 size={15} />
              </button>
            </GutterCard>
          ))}
        </div>
      )}
    </div>
  );
}
