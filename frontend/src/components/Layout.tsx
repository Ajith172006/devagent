import type { ReactNode } from 'react';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';

export function Layout({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="flex h-screen bg-[var(--color-ink)] text-[var(--color-text)]">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar title={title} />
        <main className="scrollbar-thin flex-1 overflow-y-auto px-6 py-6">{children}</main>
      </div>
    </div>
  );
}
