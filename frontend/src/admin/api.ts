// Admin API — all requests include x-admin-secret header
const BASE = '/api/admin';

class AdminApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

async function req<T>(path: string, secret: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      'x-admin-secret': secret,
      ...(init?.headers || {}),
    },
  });
  if (!res.ok) {
    let msg = res.statusText;
    try { const b = await res.json(); msg = b.message || msg; } catch { /* noop */ }
    throw new AdminApiError(res.status, Array.isArray(msg) ? msg.join(', ') : msg);
  }
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

export function makeAdminApi(secret: string) {
  const g = <T>(path: string) => req<T>(path, secret);
  const del = <T>(path: string) => req<T>(path, secret, { method: 'DELETE' });

  return {
    overview: () => g<AdminOverview>('/overview'),

    snippets: {
      list: () => g<AdminSnippet[]>('/snippets'),
      delete: (id: string) => del<void>(`/snippets/${id}`),
      deleteAll: () => del<void>('/snippets'),
    },
    notes: {
      list: () => g<AdminNote[]>('/notes'),
      delete: (id: string) => del<void>(`/notes/${id}`),
      deleteAll: () => del<void>('/notes'),
    },
    goals: {
      list: () => g<AdminGoal[]>('/goals'),
      delete: (date: string) => del<void>(`/goals/${date}`),
      deleteAll: () => del<void>('/goals'),
    },
    leetcode: {
      list: () => g<AdminLeetcode[]>('/leetcode'),
      delete: (id: string) => del<void>(`/leetcode/${id}`),
      deleteAll: () => del<void>('/leetcode'),
    },
  };
}

// ── Types ────────────────────────────────────────────────────────────────────
export interface AdminOverview {
  counts: { snippets: number; notes: number; goals: number; leetcode: number };
  streak: { currentStreak: number; longestStreak: number; totalCompletedDays: number };
  leetcodeStats: {
    totalProblems: number; totalSolved: number;
    easy: { solved: number; attempted: number };
    medium: { solved: number; attempted: number };
    hard: { solved: number; attempted: number };
    topTopics: { topic: string; count: number }[];
  };
}
export interface AdminSnippet {
  id: string; title: string; language: string; tags: string[];
  description: string | null; createdAt: string; updatedAt: string; code: string;
}
export interface AdminNote {
  id: string; title: string; content: string; tags: string[];
  pinned: boolean; createdAt: string; updatedAt: string;
}
export interface AdminGoal {
  id: string; date: string; targetMinutes: number; minutesLogged: number;
  focus: string | null; completed: boolean; createdAt: string;
}
export interface AdminLeetcode {
  id: string; title: string; url: string | null; difficulty: string;
  status: string; topics: string[]; notes: string | null;
  solvedAt: string | null; createdAt: string; updatedAt: string;
}
