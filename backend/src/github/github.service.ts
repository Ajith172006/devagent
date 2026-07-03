import { HttpException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

interface GithubRepo {
  name: string;
  html_url: string;
  description: string | null;
  language: string | null;
  stargazers_count: number;
  forks_count: number;
  fork: boolean;
  updated_at: string;
}

@Injectable()
export class GithubService {
  private readonly baseUrl = 'https://api.github.com';

  constructor(private readonly config: ConfigService) {}

  private authHeaders(): Record<string, string> {
    const token = this.config.get<string>('GITHUB_TOKEN');
    const headers: Record<string, string> = {
      Accept: 'application/vnd.github+json',
      'User-Agent': 'DevAgent',
    };
    if (token) headers.Authorization = `Bearer ${token}`;
    return headers;
  }

  private async request<T>(path: string): Promise<T> {
    const res = await fetch(`${this.baseUrl}${path}`, { headers: this.authHeaders() });
    if (!res.ok) {
      const body = await res.text();
      throw new HttpException(
        `GitHub API request failed (${res.status}): ${body}`,
        res.status >= 400 && res.status < 500 ? res.status : 502,
      );
    }
    return res.json() as Promise<T>;
  }

  async getProfile(username: string) {
    return this.request(`/users/${encodeURIComponent(username)}`);
  }

  async getRepos(username: string, limit = 100) {
    const repos = await this.request<GithubRepo[]>(
      `/users/${encodeURIComponent(username)}/repos?per_page=${limit}&sort=updated`,
    );
    return repos.map((r) => ({
      name: r.name,
      url: r.html_url,
      description: r.description,
      language: r.language,
      stars: r.stargazers_count,
      forks: r.forks_count,
      fork: r.fork,
      updatedAt: r.updated_at,
    }));
  }

  /** Combined profile + language breakdown + top repos, used by the portfolio generator too. */
  async getSummary(username: string) {
    const [profile, repos] = await Promise.all([
      this.getProfile(username),
      this.getRepos(username),
    ]);

    const languageCounts: Record<string, number> = {};
    for (const r of repos) {
      if (r.language) languageCounts[r.language] = (languageCounts[r.language] || 0) + 1;
    }

    const topRepos = [...repos]
      .filter((r) => !r.fork)
      .sort((a, b) => b.stars - a.stars)
      .slice(0, 6);

    return {
      profile,
      totalRepos: repos.length,
      languages: Object.entries(languageCounts)
        .sort((a, b) => b[1] - a[1])
        .map(([language, count]) => ({ language, count })),
      topRepos,
    };
  }
}
