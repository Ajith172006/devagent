import { useEffect, useState } from 'react';
import { Plus, Trash2, Search, X } from 'lucide-react';
import { snippetsApi } from '../api/modules';
import type { Snippet } from '../types';
import { GutterCard, HashTag } from '../components/GutterCard';
import { Button, EmptyState, ErrorNote, Input, Loader, Textarea } from '../components/ui';

const emptyForm = { title: '', code: '', language: 'javascript', tags: '', description: '' };

export function Snippets() {
  const [snippets, setSnippets] = useState<Snippet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const load = () => {
    setLoading(true);
    snippetsApi
      .list({ search: search || undefined })
      .then(setSnippets)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    const t = setTimeout(load, 250);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await snippetsApi.create({
        title: form.title,
        code: form.code,
        language: form.language,
        description: form.description || undefined,
        tags: form.tags ? form.tags.split(',').map((t) => t.trim()).filter(Boolean) : [],
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
    await snippetsApi.remove(id);
    setSnippets((prev) => prev.filter((s) => s.id !== id));
  }

  return (
    <div className="space-y-5 max-w-4xl">
      <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-faint)]" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search snippets…"
            className="pl-9"
          />
        </div>
        <Button onClick={() => setShowForm((v) => !v)}>
          {showForm ? <X size={15} /> : <Plus size={15} />}
          {showForm ? 'Cancel' : 'New snippet'}
        </Button>
      </div>

      {error && <ErrorNote message={error} />}

      {showForm && (
        <GutterCard gutter="amber">
          <form onSubmit={handleCreate} className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input
                required
                placeholder="Title (e.g. Debounce helper)"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
              />
              <Input
                required
                placeholder="Language (e.g. javascript)"
                value={form.language}
                onChange={(e) => setForm({ ...form, language: e.target.value })}
              />
            </div>
            <Textarea
              required
              rows={6}
              placeholder="Paste your code…"
              value={form.code}
              onChange={(e) => setForm({ ...form, code: e.target.value })}
            />
            <Input
              placeholder="Description (optional)"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
            <Input
              placeholder="Tags, comma separated (e.g. utils, performance)"
              value={form.tags}
              onChange={(e) => setForm({ ...form, tags: e.target.value })}
            />
            <Button type="submit" disabled={saving}>
              {saving ? 'Saving…' : 'Save snippet'}
            </Button>
          </form>
        </GutterCard>
      )}

      {loading ? (
        <Loader />
      ) : snippets.length === 0 ? (
        <EmptyState
          title="No snippets yet"
          hint="Save the pieces of code you reach for again and again — sorts, API calls, DB connections."
          icon={<Plus size={22} />}
        />
      ) : (
        <div className="space-y-3">
          {snippets.map((s) => (
            <GutterCard key={s.id} gutter="amber">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-display text-sm font-semibold">{s.title}</h3>
                    <HashTag>#{s.id.slice(0, 7)}</HashTag>
                  </div>
                  {s.description && (
                    <p className="text-sm text-[var(--color-text-muted)] mt-0.5">{s.description}</p>
                  )}
                </div>
                <button
                  onClick={() => handleDelete(s.id)}
                  aria-label={`Delete ${s.title}`}
                  className="shrink-0 text-[var(--color-text-faint)] hover:text-[var(--color-diff-red)]"
                >
                  <Trash2 size={15} />
                </button>
              </div>
              <pre className="scrollbar-thin mt-3 overflow-x-auto rounded-lg bg-[var(--color-ink)] p-3 text-xs leading-relaxed text-[var(--color-text)]">
                <code>{s.code}</code>
              </pre>
              <div className="mt-2 flex items-center gap-2 flex-wrap">
                <span className="hash-tag">{s.language}</span>
                {s.tags.map((t) => (
                  <span
                    key={t}
                    className="rounded-full bg-[var(--color-ink-panel-raised)] px-2 py-0.5 text-xs text-[var(--color-text-muted)]"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </GutterCard>
          ))}
        </div>
      )}
    </div>
  );
}
