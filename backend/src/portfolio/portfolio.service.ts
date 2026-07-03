import { Injectable } from '@nestjs/common';
import { SnippetsService } from '../snippets/snippets.service';
import { LeetcodeService } from '../leetcode/leetcode.service';
import { GithubService } from '../github/github.service';
import { GoalsService } from '../goals/goals.service';

export interface PortfolioData {
  generatedAt: string;
  github: Awaited<ReturnType<GithubService['getSummary']>> | null;
  leetcode: Awaited<ReturnType<LeetcodeService['stats']>>;
  streak: Awaited<ReturnType<GoalsService['getStreak']>>;
  featuredSnippets: Array<{ title: string; language: string; description: string | null; tags: string[] }>;
}

@Injectable()
export class PortfolioService {
  constructor(
    private readonly snippetsService: SnippetsService,
    private readonly leetcodeService: LeetcodeService,
    private readonly githubService: GithubService,
    private readonly goalsService: GoalsService,
  ) {}

  async generate(userId: string, options: { githubUsername?: string } = {}): Promise<PortfolioData> {
    const [snippets, leetcode, streak, github] = await Promise.all([
      this.snippetsService.findAll(userId, {}),
      this.leetcodeService.stats(userId),
      this.goalsService.getStreak(userId),
      options.githubUsername ? this.githubService.getSummary(options.githubUsername) : Promise.resolve(null),
    ]);

    const featuredSnippets = snippets.slice(0, 8).map((s) => ({
      title: s.title,
      language: s.language,
      description: s.description,
      tags: s.tags,
    }));

    return {
      generatedAt: new Date().toISOString(),
      github,
      leetcode,
      streak,
      featuredSnippets,
    };
  }

  async generateHtml(userId: string, options: { githubUsername?: string; displayName?: string } = {}): Promise<string> {
    const data = await this.generate(userId, options);
    const name = options.displayName || data.github?.profile?.['name'] || data.github?.profile?.['login'] || 'Developer';
    const bio = data.github?.profile?.['bio'] || '';
    const avatar = data.github?.profile?.['avatar_url'] || '';

    const repoCards = (data.github?.topRepos || [])
      .map(
        (r) => `
      <a class="card" href="${r.url}" target="_blank" rel="noopener">
        <h3>${escapeHtml(r.name)}</h3>
        <p>${escapeHtml(r.description || '')}</p>
        <div class="meta">${r.language ? escapeHtml(r.language) + ' · ' : ''}★ ${r.stars}</div>
      </a>`,
      )
      .join('');

    const snippetCards = data.featuredSnippets
      .map(
        (s) => `
      <div class="card">
        <h3>${escapeHtml(s.title)}</h3>
        <p>${escapeHtml(s.description || '')}</p>
        <div class="meta">${escapeHtml(s.language)}${s.tags.length ? ' · ' + s.tags.map(escapeHtml).join(', ') : ''}</div>
      </div>`,
      )
      .join('');

    return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>${escapeHtml(name)} — Portfolio</title>
<style>
  :root { --bg:#0f1115; --panel:#161923; --text:#e8e9ed; --muted:#9298a8; --accent:#5eead4; }
  * { box-sizing: border-box; }
  body { margin:0; background:var(--bg); color:var(--text); font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif; }
  header { padding:64px 24px 32px; text-align:center; }
  header img { width:96px; height:96px; border-radius:50%; margin-bottom:16px; }
  h1 { margin:0 0 8px; font-size:2rem; }
  .bio { color:var(--muted); max-width:560px; margin:0 auto; }
  section { max-width:960px; margin:0 auto; padding:32px 24px; }
  h2 { font-size:1.25rem; border-bottom:1px solid #262a36; padding-bottom:8px; }
  .stats { display:flex; gap:16px; flex-wrap:wrap; }
  .stat { background:var(--panel); border-radius:12px; padding:16px 20px; flex:1; min-width:140px; }
  .stat .n { font-size:1.75rem; font-weight:700; color:var(--accent); }
  .stat .l { color:var(--muted); font-size:0.85rem; }
  .grid { display:grid; grid-template-columns:repeat(auto-fill, minmax(220px, 1fr)); gap:16px; }
  .card { display:block; background:var(--panel); border-radius:12px; padding:16px; text-decoration:none; color:inherit; border:1px solid #232735; }
  .card h3 { margin:0 0 6px; font-size:1rem; }
  .card p { margin:0 0 10px; color:var(--muted); font-size:0.875rem; min-height:1.2em; }
  .card .meta { font-size:0.75rem; color:var(--accent); }
  footer { text-align:center; padding:32px; color:var(--muted); font-size:0.8rem; }
</style>
</head>
<body>
  <header>
    ${avatar ? `<img src="${avatar}" alt="${escapeHtml(name)}" />` : ''}
    <h1>${escapeHtml(name)}</h1>
    <p class="bio">${escapeHtml(bio)}</p>
  </header>

  <section>
    <h2>Stats</h2>
    <div class="stats">
      <div class="stat"><div class="n">${data.leetcode.totalSolved}</div><div class="l">LeetCode solved</div></div>
      <div class="stat"><div class="n">${data.streak.currentStreak}</div><div class="l">Day streak</div></div>
      <div class="stat"><div class="n">${data.github?.totalRepos ?? 0}</div><div class="l">GitHub repos</div></div>
      <div class="stat"><div class="n">${data.featuredSnippets.length}</div><div class="l">Saved snippets</div></div>
    </div>
  </section>

  ${data.github ? `<section><h2>Top Repositories</h2><div class="grid">${repoCards}</div></section>` : ''}

  ${data.featuredSnippets.length ? `<section><h2>Featured Snippets</h2><div class="grid">${snippetCards}</div></section>` : ''}

  <footer>Generated by DevAgent on ${new Date(data.generatedAt).toLocaleDateString()}</footer>
</body>
</html>`;
  }
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
