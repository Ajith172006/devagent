import type { ReactNode } from 'react';

type GutterColor = 'amber' | 'green' | 'red' | 'muted';

const colorMap: Record<GutterColor, string> = {
  amber: 'var(--color-amber)',
  green: 'var(--color-diff-green)',
  red: 'var(--color-diff-red)',
  muted: 'var(--color-text-faint)',
};

export function GutterCard({
  gutter = 'muted',
  className = '',
  children,
}: {
  gutter?: GutterColor;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div
      className={`gutter-card p-4 ${className}`}
      style={{ ['--gutter-color' as string]: colorMap[gutter] }}
    >
      {children}
    </div>
  );
}

export function HashTag({ children }: { children: ReactNode }) {
  return <span className="hash-tag">{children}</span>;
}
