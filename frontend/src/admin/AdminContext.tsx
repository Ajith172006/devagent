import { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';
import { makeAdminApi } from './api';

interface AdminCtx {
  secret: string;
  api: ReturnType<typeof makeAdminApi>;
  logout: () => void;
}

const Ctx = createContext<AdminCtx | null>(null);
const KEY = 'devagent_admin_secret';

export function AdminProvider({ secret, children }: { secret: string; children: ReactNode }) {
  const [api] = useState(() => makeAdminApi(secret));
  const logout = () => {
    sessionStorage.removeItem(KEY);
    window.location.reload();
  };
  return <Ctx.Provider value={{ secret, api, logout }}>{children}</Ctx.Provider>;
}

export function useAdmin() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useAdmin must be inside AdminProvider');
  return ctx;
}

export { KEY as ADMIN_KEY };
