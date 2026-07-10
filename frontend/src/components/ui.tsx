import type { ReactNode } from 'react';
import { Loader2 } from 'lucide-react';

export function EmptyState({ title, hint, icon }: { title: string; hint: string; icon?: ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-[var(--color-ink-border)] py-16 text-center">
      {icon && <div className="mb-1 text-[var(--color-text-faint)]">{icon}</div>}
      <p className="font-display text-sm font-medium text-[var(--color-text)]">{title}</p>
      <p className="max-w-xs text-sm text-[var(--color-text-muted)]">{hint}</p>
    </div>
  );
}

export function Loader({ label = 'Loading…' }: { label?: string }) {
  return (
    <div className="flex items-center gap-2 py-10 justify-center text-sm text-[var(--color-text-muted)]">
      <Loader2 size={16} className="animate-spin" />
      {label}
    </div>
  );
}

export function ErrorNote({ message }: { message: string }) {
  return (
    <div className="gutter-card p-3 text-sm text-[var(--color-diff-red)]" style={{ ['--gutter-color' as string]: 'var(--color-diff-red)' }}>
      {message}
    </div>
  );
}

export function Button({
  children,
  variant = 'primary',
  className = '',
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'ghost' }) {
  const base = 'inline-flex items-center gap-2.5 rounded-lg px-4.5 py-2.5 text-base font-bold transition-all disabled:cursor-not-allowed active:scale-95 duration-150';
  const styles =
    variant === 'primary'
      ? 'btn-dynamic-gradient text-[var(--color-ink)]'
      : 'border border-white/30 bg-[rgba(255,255,255,0.06)] text-white hover:bg-[rgba(255,255,255,0.12)] hover:border-white/50 shadow-sm';
  return (
    <button className={`${base} ${styles} ${className}`} {...props}>
      {children}
    </button>
  );
}

export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={`w-full rounded-lg border border-white/20 bg-black/45 px-4 py-2.5 text-base text-[var(--color-text)] placeholder:text-white/40 outline-none focus:border-[#3b82f6] focus:ring-1 focus:ring-[#3b82f6] ${props.className ?? ''}`}
    />
  );
}

export function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className={`w-full rounded-lg border border-white/20 bg-black/45 px-4 py-2.5 text-base text-[var(--color-text)] placeholder:text-white/40 outline-none focus:border-[#3b82f6] focus:ring-1 focus:ring-[#3b82f6] font-mono ${props.className ?? ''}`}
    />
  );
}

export function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      className={`rounded-lg border border-white/20 bg-black/45 px-4 py-2.5 text-base text-[var(--color-text)] outline-none focus:border-[#3b82f6] focus:ring-1 focus:ring-[#3b82f6] ${props.className ?? ''}`}
    />
  );
}
