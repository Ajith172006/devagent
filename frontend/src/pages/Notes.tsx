import { useEffect, useState } from 'react';
import { Plus, Trash2, Search, X, Pin, PinOff } from 'lucide-react';
import { notesApi } from '../api/modules';
import type { Note } from '../types';
import { GutterCard } from '../components/GutterCard';
import { Button, EmptyState, ErrorNote, Input, Loader, Textarea } from '../components/ui';

const emptyForm = { title: '', content: '', tags: '' };

export function Notes() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const load = () => {
    setLoading(true);
    notesApi
      .list(search || undefined)
      .then(setNotes)
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
      await notesApi.create({
        title: form.title,
        content: form.content,
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

  async function togglePin(note: Note) {
    await notesApi.update(note.id, { pinned: !note.pinned });
    load();
  }

  async function handleDelete(id: string) {
    await notesApi.remove(id);
    setNotes((prev) => prev.filter((n) => n.id !== id));
  }

  return (
    <div className="space-y-5 max-w-3xl">
      <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-faint)]" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search notes…"
            className="pl-9"
          />
        </div>
        <Button onClick={() => setShowForm((v) => !v)}>
          {showForm ? <X size={15} /> : <Plus size={15} />}
          {showForm ? 'Cancel' : 'New note'}
        </Button>
      </div>

      {error && <ErrorNote message={error} />}

      {showForm && (
        <GutterCard gutter="amber">
          <form onSubmit={handleCreate} className="space-y-3">
            <Input
              required
              placeholder="Title (e.g. Graph traversal cheatsheet)"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />
            <Textarea
              required
              rows={6}
              placeholder="Write your note…"
              value={form.content}
              onChange={(e) => setForm({ ...form, content: e.target.value })}
            />
            <Input
              placeholder="Tags, comma separated"
              value={form.tags}
              onChange={(e) => setForm({ ...form, tags: e.target.value })}
            />
            <Button type="submit" disabled={saving}>
              {saving ? 'Saving…' : 'Save note'}
            </Button>
          </form>
        </GutterCard>
      )}

      {loading ? (
        <Loader />
      ) : notes.length === 0 ? (
        <EmptyState
          title="No notes yet"
          hint="Keep interview questions, algorithm explanations, and revision material in one place."
          icon={<Plus size={22} />}
        />
      ) : (
        <div className="space-y-3">
          {notes.map((n) => (
            <GutterCard key={n.id} gutter={n.pinned ? 'amber' : 'muted'}>
              <div className="flex items-start justify-between gap-3">
                <h3 className="font-display text-sm font-semibold">{n.title}</h3>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => togglePin(n)}
                    aria-label={n.pinned ? `Unpin ${n.title}` : `Pin ${n.title}`}
                    className="text-[var(--color-text-faint)] hover:text-[var(--color-amber)]"
                  >
                    {n.pinned ? <Pin size={15} /> : <PinOff size={15} />}
                  </button>
                  <button
                    onClick={() => handleDelete(n.id)}
                    aria-label={`Delete ${n.title}`}
                    className="text-[var(--color-text-faint)] hover:text-[var(--color-diff-red)]"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
              <p className="mt-2 whitespace-pre-wrap text-sm text-[var(--color-text-muted)]">{n.content}</p>
              {n.tags.length > 0 && (
                <div className="mt-3 flex gap-2 flex-wrap">
                  {n.tags.map((t) => (
                    <span key={t} className="rounded-full bg-[var(--color-ink-panel-raised)] px-2 py-0.5 text-xs text-[var(--color-text-muted)]">
                      {t}
                    </span>
                  ))}
                </div>
              )}
            </GutterCard>
          ))}
        </div>
      )}
    </div>
  );
}
