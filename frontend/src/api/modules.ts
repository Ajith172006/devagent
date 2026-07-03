import { api } from './client';
import type {
  Snippet,
  Note,
  Goal,
  Streak,
  LeetcodeEntry,
  LeetcodeStats,
  GithubSummary,
  PortfolioData,
  AiResult,
} from '../types';

// ---- User profile sync ----
export const usersApi = {
  upsert: (data: { name: string; profession: string; age: string; gender: string; email?: string; photoUrl?: string }) =>
    api.put<{ id: string }>('/users/me', data),
  me: () => api.get<{ id: string; name: string; profession: string; age: string; gender: string; createdAt: string }>('/users/me'),
};

// ---- Snippets ----
export const snippetsApi = {
  list: (params: { language?: string; tag?: string; search?: string } = {}) => {
    const qs = new URLSearchParams(
      Object.entries(params).filter(([, v]) => v) as [string, string][],
    ).toString();
    return api.get<Snippet[]>(`/snippets${qs ? `?${qs}` : ''}`);
  },
  create: (data: { title: string; code: string; language: string; tags?: string[]; description?: string }) =>
    api.post<Snippet>('/snippets', data),
  update: (id: string, data: Partial<Snippet>) => api.patch<Snippet>(`/snippets/${id}`, data),
  remove: (id: string) => api.del<void>(`/snippets/${id}`),
};

// ---- Notes ----
export const notesApi = {
  list: (search?: string) => api.get<Note[]>(`/notes${search ? `?search=${encodeURIComponent(search)}` : ''}`),
  create: (data: { title: string; content: string; tags?: string[]; pinned?: boolean }) =>
    api.post<Note>('/notes', data),
  update: (id: string, data: Partial<Note>) => api.patch<Note>(`/notes/${id}`, data),
  remove: (id: string) => api.del<void>(`/notes/${id}`),
};

// ---- Goals ----
export const goalsApi = {
  list: () => api.get<Goal[]>('/goals'),
  streak: () => api.get<Streak>('/goals/streak'),
  setGoal: (data: { date: string; targetMinutes: number; focus?: string }) => api.post<Goal>('/goals', data),
  logProgress: (date: string, minutes: number) => api.put<Goal>(`/goals/${date}/progress`, { minutes }),
  remove: (date: string) => api.del<void>(`/goals/${date}`),
};

// ---- LeetCode ----
export const leetcodeApi = {
  list: (params: { status?: string; difficulty?: string; topic?: string } = {}) => {
    const qs = new URLSearchParams(
      Object.entries(params).filter(([, v]) => v) as [string, string][],
    ).toString();
    return api.get<LeetcodeEntry[]>(`/leetcode${qs ? `?${qs}` : ''}`);
  },
  stats: () => api.get<LeetcodeStats>('/leetcode/stats'),
  create: (data: {
    title: string;
    url?: string;
    difficulty: string;
    status?: string;
    topics?: string[];
    notes?: string;
  }) => api.post<LeetcodeEntry>('/leetcode', data),
  update: (id: string, data: Partial<LeetcodeEntry>) => api.patch<LeetcodeEntry>(`/leetcode/${id}`, data),
  remove: (id: string) => api.del<void>(`/leetcode/${id}`),
};

// ---- GitHub ----
export const githubApi = {
  summary: (username: string) => api.get<GithubSummary>(`/github/${encodeURIComponent(username)}/summary`),
};

// ---- AI ----
export const aiApi = {
  debug: (data: { code: string; language?: string; errorMessage?: string; context?: string }) =>
    api.post<AiResult>('/ai/debug', data),
  explain: (data: { code: string; language?: string; level?: 'beginner' | 'intermediate' | 'expert' }) =>
    api.post<AiResult>('/ai/explain', data),
};

// ---- Portfolio ----
export const portfolioApi = {
  generate: (githubUsername?: string) =>
    api.get<PortfolioData>(`/portfolio${githubUsername ? `?githubUsername=${encodeURIComponent(githubUsername)}` : ''}`),
  exportUrl: (githubUsername?: string, displayName?: string) => {
    const qs = new URLSearchParams();
    if (githubUsername) qs.set('githubUsername', githubUsername);
    if (displayName) qs.set('displayName', displayName);
    const q = qs.toString();
    return `/api/portfolio/export${q ? `?${q}` : ''}`;
  },
};
