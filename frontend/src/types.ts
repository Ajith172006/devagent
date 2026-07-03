export interface Snippet {
  id: string;
  title: string;
  code: string;
  language: string;
  tags: string[];
  description: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Note {
  id: string;
  title: string;
  content: string;
  tags: string[];
  pinned: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Goal {
  id: string;
  date: string;
  targetMinutes: number;
  minutesLogged: number;
  focus: string | null;
  completed: boolean;
  createdAt: string;
}

export interface Streak {
  currentStreak: number;
  longestStreak: number;
  totalCompletedDays: number;
}

export type LeetcodeDifficulty = 'Easy' | 'Medium' | 'Hard';
export type LeetcodeStatus = 'Attempted' | 'Solved' | 'Review';

export interface LeetcodeEntry {
  id: string;
  title: string;
  url: string | null;
  difficulty: LeetcodeDifficulty;
  status: LeetcodeStatus;
  topics: string[];
  notes: string | null;
  solvedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface LeetcodeStats {
  totalProblems: number;
  totalSolved: number;
  easy: { solved: number; attempted: number };
  medium: { solved: number; attempted: number };
  hard: { solved: number; attempted: number };
  topTopics: { topic: string; count: number }[];
}

export interface GithubProfile {
  login: string;
  name: string | null;
  bio: string | null;
  avatar_url: string;
  html_url: string;
  followers: number;
  following: number;
  public_repos: number;
  [key: string]: unknown;
}

export interface GithubRepo {
  name: string;
  url: string;
  description: string | null;
  language: string | null;
  stars: number;
  forks: number;
  fork: boolean;
  updatedAt: string;
}

export interface GithubSummary {
  profile: GithubProfile;
  totalRepos: number;
  languages: { language: string; count: number }[];
  topRepos: GithubRepo[];
}

export interface PortfolioData {
  generatedAt: string;
  github: GithubSummary | null;
  leetcode: LeetcodeStats;
  streak: Streak;
  featuredSnippets: Array<{
    title: string;
    language: string;
    description: string | null;
    tags: string[];
  }>;
}

export interface AiResult {
  result: string;
}
