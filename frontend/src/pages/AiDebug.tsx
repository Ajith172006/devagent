import { useState } from 'react';
import { Bug, Sparkles } from 'lucide-react';
import { aiApi } from '../api/modules';
import { GutterCard } from '../components/GutterCard';
import { Button, EmptyState, ErrorNote, Input, Loader, Textarea } from '../components/ui';

export function AiDebug() {
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const { result } = await aiApi.debug({
        code,
        language: language || undefined,
        errorMessage: errorMessage || undefined,
      });
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
          placeholder="Paste the code that's misbehaving…"
          value={code}
          onChange={(e) => setCode(e.target.value)}
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Input
            placeholder="Language (optional)"
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
          />
          <Input
            placeholder="Error message, if you have one (optional)"
            value={errorMessage}
            onChange={(e) => setErrorMessage(e.target.value)}
          />
        </div>
        <Button type="submit" disabled={loading || !code.trim()}>
          <Bug size={15} />
          {loading ? 'Debugging…' : 'Find the bug'}
        </Button>
      </form>

      {error && <ErrorNote message={error} />}

      {loading && <Loader label="Reading through the code…" />}

      {result && (
        <GutterCard gutter="green">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles size={14} className="text-[var(--color-diff-green)]" />
            <h2 className="font-display text-sm font-semibold">Diagnosis</h2>
          </div>
          <div className="whitespace-pre-wrap text-sm leading-relaxed text-[var(--color-text)]">
            {result}
          </div>
        </GutterCard>
      )}

      {!loading && !result && !error && (
        <EmptyState
          title="Paste code to get a diagnosis"
          hint="DevAgent will find the root cause, propose a fix, explain why it works, and give you a tip to avoid it next time."
          icon={<Bug size={22} />}
        />
      )}
    </div>
  );
}
