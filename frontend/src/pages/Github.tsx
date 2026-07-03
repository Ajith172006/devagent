import { useState } from 'react';
import { GitBranch, Star, GitFork } from 'lucide-react';
import { githubApi } from '../api/modules';
import type { GithubSummary } from '../types';
import { GutterCard } from '../components/GutterCard';
import { Button, EmptyState, ErrorNote, Input, Loader } from '../components/ui';

export function Github() {
  const [username, setUsername] = useState('');
  const [summary, setSummary] = useState<GithubSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!username.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const data = await githubApi.summary(username.trim());
      setSummary(data);
    } catch (e) {
      setError((e as Error).message);
      setSummary(null);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-3xl space-y-5">
      <form onSubmit={handleSubmit} className="flex gap-2">
        <Input
          placeholder="GitHub username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="max-w-xs"
        />
        <Button type="submit" disabled={loading}>
          <GitBranch size={15} />
          {loading ? 'Looking up…' : 'Connect'}
        </Button>
      </form>

      {error && <ErrorNote message={error} />}
      {loading && <Loader label="Pulling repos and profile…" />}

      {!loading && !summary && !error && (
        <EmptyState
          title="No GitHub account connected"
          hint="Enter a username to pull a public profile summary, top languages, and starred repos."
          icon={<GitBranch size={22} />}
        />
      )}

      {summary && (
        <div className="space-y-4">
          <GutterCard gutter="muted" className="flex items-center gap-4">
            <img
              src={summary.profile.avatar_url}
              alt={summary.profile.login}
              className="h-14 w-14 rounded-full border border-[var(--color-ink-border)]"
            />
            <div>
              <h2 className="font-display text-base font-semibold">
                {summary.profile.name || summary.profile.login}
              </h2>
              <p className="text-sm text-[var(--color-text-muted)]">{summary.profile.bio}</p>
              <p className="hash-tag mt-1">
                {summary.totalRepos} repos · {summary.profile.followers} followers
              </p>
            </div>
          </GutterCard>

          {summary.languages.length > 0 && (
            <GutterCard gutter="amber">
              <h3 className="font-display text-sm font-semibold mb-3">Top languages</h3>
              <div className="flex flex-wrap gap-2">
                {summary.languages.slice(0, 8).map((l) => (
                  <span
                    key={l.language}
                    className="rounded-full bg-[var(--color-ink-panel-raised)] px-3 py-1 text-xs font-data"
                  >
                    {l.language} <span className="text-[var(--color-text-faint)]">×{l.count}</span>
                  </span>
                ))}
              </div>
            </GutterCard>
          )}

          {summary.topRepos.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-display text-sm font-semibold">Top repositories</h3>
              {summary.topRepos.map((r) => (
                <GutterCard key={r.name} gutter="green">
                  <a
                    href={r.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-display text-sm font-semibold hover:text-[var(--color-amber)]"
                  >
                    {r.name}
                  </a>
                  {r.description && (
                    <p className="text-sm text-[var(--color-text-muted)] mt-0.5">{r.description}</p>
                  )}
                  <div className="mt-2 flex items-center gap-4 text-xs text-[var(--color-text-faint)] font-data">
                    {r.language && <span>{r.language}</span>}
                    <span className="flex items-center gap-1">
                      <Star size={12} /> {r.stars}
                    </span>
                    <span className="flex items-center gap-1">
                      <GitFork size={12} /> {r.forks}
                    </span>
                  </div>
                </GutterCard>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
