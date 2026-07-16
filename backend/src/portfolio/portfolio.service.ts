import { Injectable } from '@nestjs/common';
import { SnippetsService } from '../snippets/snippets.service';
import { LeetcodeService } from '../leetcode/leetcode.service';
import { GithubService } from '../github/github.service';
import { GoalsService } from '../goals/goals.service';
import { UsersService } from '../users/users.service';
import { renderPortfolioHtml } from './portfolio-template';

export interface PortfolioData {
  generatedAt: string;
  github: Awaited<ReturnType<GithubService['getSummary']>> | null;
  leetcode: Awaited<ReturnType<LeetcodeService['stats']>>;
  streak: Awaited<ReturnType<GoalsService['getStreak']>>;
  featuredSnippets: Array<{ title: string; language: string; description: string | null; tags: string[] }>;
  user: Awaited<ReturnType<UsersService['findOne']>> | null;
}

@Injectable()
export class PortfolioService {
  constructor(
    private readonly snippetsService: SnippetsService,
    private readonly leetcodeService: LeetcodeService,
    private readonly githubService: GithubService,
    private readonly goalsService: GoalsService,
    private readonly usersService: UsersService,
  ) {}

  async generate(userId: string, options: { githubUsername?: string } = {}): Promise<PortfolioData> {
    const [snippets, leetcode, streak, github, user] = await Promise.all([
      this.snippetsService.findAll(userId, {}),
      this.leetcodeService.stats(userId),
      this.goalsService.getStreak(userId),
      options.githubUsername ? this.githubService.getSummary(options.githubUsername) : Promise.resolve(null),
      this.usersService.findOne(userId).catch(() => null),
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
      user,
    };
  }

  async generateHtml(userId: string, options: { githubUsername?: string; displayName?: string; includeLeetcode?: boolean } = {}): Promise<string> {
    const data = await this.generate(userId, options);
    return renderPortfolioHtml(data, options);
  }
}
