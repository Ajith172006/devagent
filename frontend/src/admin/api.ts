// Admin API — all requests include x-admin-secret header
const BASE = '/api/admin';

class AdminApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
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

    users: {
      list: () => g<AdminUser[]>('/users'),
      get: (uid: string) => g<AdminUser>(`/users/${uid}`),
      getData: (uid: string) => g<AdminUserData>(`/users/${uid}/data`),
      delete: (uid: string) => del<void>(`/users/${uid}`),
    },
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
      delete: (id: string) => del<void>(`/goals/${id}`),
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
  counts: { users: number; snippets: number; notes: number; goals: number; leetcode: number };
}
export interface AdminUser {
  id: string; name: string; profession: string; age: string; gender: string;
  email: string | null; photoUrl: string | null; createdAt: string; updatedAt: string;
}
export interface AdminUserData {
  counts: { snippets: number; notes: number; goals: number; leetcode: number };
  streak: { currentStreak: number; longestStreak: number; totalCompletedDays: number };
  snippets: AdminSnippet[];
  notes: AdminNote[];
  goals: AdminGoal[];
  leetcode: AdminLeetcode[];
}
export interface AdminSnippet {
  id: string; userId: string; title: string; language: string; tags: string[];
  description: string | null; createdAt: string; updatedAt: string; code: string;
}
export interface AdminNote {
  id: string; userId: string; title: string; content: string; tags: string[];
  pinned: boolean; createdAt: string; updatedAt: string;
}
export interface AdminGoal {
  id: string; userId: string; date: string; targetMinutes: number; minutesLogged: number;
  focus: string | null; completed: boolean; createdAt: string;
}
export interface AdminLeetcode {
  id: string; userId: string; title: string; url: string | null; difficulty: string;
  status: string; topics: string[]; notes: string | null;
  solvedAt: string | null; createdAt: string; updatedAt: string;
}
