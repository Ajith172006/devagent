import { useState } from 'react';
import { BookOpenText, Sparkles } from 'lucide-react';
import { aiApi } from '../api/modules';
import { GutterCard } from '../components/GutterCard';
import { Button, EmptyState, ErrorNote, Input, Loader, Select, Textarea } from '../components/ui';

export function ExplainCode() {
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('');
  const [level, setLevel] = useState<'beginner' | 'intermediate' | 'expert'>('intermediate');
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const { result } = await aiApi.explain({ code, language: language || undefined, level });
      setResult(result);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-3xl space-y-5">
      <form onSubmit={handleSubmit} className="space-y-3">
        <Textarea
          required
          rows={10}
          placeholder="Paste the code you want explained…"
          value={code}
          onChange={(e) => setCode(e.target.value)}
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Input
            placeholder="Language (optional)"
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
          />
          <Select value={level} onChange={(e) => setLevel(e.target.value as typeof level)}>
            <option value="beginner">Explain like I'm a beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="expert">Expert — get to the point</option>
          </Select>
        </div>
        <Button type="submit" disabled={loading || !code.trim()}>
          <BookOpenText size={15} />
          {loading ? 'Explaining…' : 'Explain this code'}
        </Button>
      </form>

      {error && <ErrorNote message={error} />}

      {loading && <Loader label="Reading it line by line…" />}

      {result && (
        <GutterCard gutter="amber">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles size={14} className="text-[var(--color-amber)]" />
            <h2 className="font-display text-sm font-semibold">Explanation</h2>
          </div>
          <div className="whitespace-pre-wrap text-sm leading-relaxed text-[var(--color-text)]">
            {result}
          </div>
        </GutterCard>
      )}

      {!loading && !result && !error && (
        <EmptyState
          title="Paste code to get a walkthrough"
          hint="Good for learning algorithms, understanding someone else's PR, or refreshing on something you wrote months ago."
          icon={<BookOpenText size={22} />}
        />
      )}
    </div>
  );
}
