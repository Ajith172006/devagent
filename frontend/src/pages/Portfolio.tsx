import { useState } from 'react';
import { Globe, Download } from 'lucide-react';
import { portfolioApi } from '../api/modules';
import type { PortfolioData } from '../types';
import { GutterCard } from '../components/GutterCard';
import { Button, EmptyState, ErrorNote, Input, Loader } from '../components/ui';

export function Portfolio() {
  const [githubUsername, setGithubUsername] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [data, setData] = useState<PortfolioData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleGenerate(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const result = await portfolioApi.generate(githubUsername || undefined);
      setData(result);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-3xl space-y-5">
      <form onSubmit={handleGenerate} className="flex flex-wrap gap-3 items-end">
        <div>
          <label className="text-xs text-[var(--color-text-muted)]">Display name</label>
          <Input
            placeholder="Ada Lovelace"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            className="w-52"
          />
        </div>
        <div>
          <label className="text-xs text-[var(--color-text-muted)]">GitHub username (optional)</label>
          <Input
            placeholder="octocat"
            value={githubUsername}
            onChange={(e) => setGithubUsername(e.target.value)}
            className="w-52"
          />
        </div>
        <Button type="submit" disabled={loading}>
          <Globe size={15} />
          {loading ? 'Generating…' : 'Generate preview'}
        </Button>
        <a href={portfolioApi.exportUrl(githubUsername || undefined, displayName || undefined)} target="_blank" rel="noopener noreferrer">
          <Button type="button" variant="ghost">
            <Download size={15} />
            Download HTML
          </Button>
        </a>
      </form>

      {error && <ErrorNote message={error} />}
      {loading && <Loader label="Aggregating your work…" />}

      {!loading && !data && !error && (
        <EmptyState
          title="No portfolio generated yet"
          hint="Pulls your GitHub repos, LeetCode stats, streak, and featured snippets into a single shareable page."
          icon={<Globe size={22} />}
        />
      )}

      {data && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <GutterCard gutter="green">
              <p className="text-xs text-[var(--color-text-muted)]">LeetCode solved</p>
              <p className="font-data text-xl font-semibold">{data.leetcode.totalSolved}</p>
            </GutterCard>
            <GutterCard gutter="red">
              <p className="text-xs text-[var(--color-text-muted)]">Day streak</p>
              <p className="font-data text-xl font-semibold">{data.streak.currentStreak}</p>
            </GutterCard>
            <GutterCard gutter="amber">
              <p className="text-xs text-[var(--color-text-muted)]">GitHub repos</p>
              <p className="font-data text-xl font-semibold">{data.github?.totalRepos ?? 0}</p>
            </GutterCard>
            <GutterCard gutter="muted">
              <p className="text-xs text-[var(--color-text-muted)]">Snippets</p>
              <p className="font-data text-xl font-semibold">{data.featuredSnippets.length}</p>
            </GutterCard>
          </div>

          {data.featuredSnippets.length > 0 && (
            <GutterCard gutter="amber">
              <h3 className="font-display text-sm font-semibold mb-3">Featured snippets</h3>
              <div className="flex flex-wrap gap-2">
                {data.featuredSnippets.map((s) => (
                  <span
                    key={s.title}
                    className="rounded-full bg-[var(--color-ink-panel-raised)] px-3 py-1 text-xs"
                  >
                    {s.title} <span className="text-[var(--color-text-faint)]">· {s.language}</span>
                  </span>
                ))}
              </div>
            </GutterCard>
          )}

          <p className="hash-tag">
            Use "Download HTML" above for a self-contained page you can host anywhere.
          </p>
        </div>
      )}
    </div>
  );
}
