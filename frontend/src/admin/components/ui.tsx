import type { ReactNode } from 'react';

export function PageHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div style={{ marginBottom: 24 }}>
      <h1 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: '#e7e9f0', letterSpacing: '-0.01em' }}>{title}</h1>
      {subtitle && <p style={{ margin: '4px 0 0', fontSize: 13, color: '#8b90a3' }}>{subtitle}</p>}
    </div>
  );
}

export function StatCard({ label, value, color = '#e8b339' }: { label: string; value: number | string; color?: string }) {
  return (
    <div style={{ background: '#171a24', border: '1px solid #262b3a', borderRadius: 10, padding: '16px 20px', borderLeft: `4px solid ${color}` }}>
      <div style={{ fontSize: 11, color: '#8b90a3', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</div>
      <div style={{ fontSize: 28, fontWeight: 700, color, fontFamily: 'monospace', marginTop: 4 }}>{value}</div>
    </div>
  );
}

export function Table({ columns, rows, onDelete, deleteLabel = 'Delete' }: {
  columns: { key: string; label: string; width?: number }[];
  rows: Record<string, ReactNode>[];
  onDelete?: (row: Record<string, ReactNode>) => void;
  deleteLabel?: string;
}) {
  return (
    <div style={{ overflowX: 'auto', borderRadius: 10, border: '1px solid #262b3a' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
        <thead>
          <tr style={{ borderBottom: '1px solid #262b3a', background: '#171a24' }}>
            {columns.map(c => (
              <th key={c.key} style={{ padding: '10px 14px', textAlign: 'left', color: '#8b90a3', fontWeight: 600, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.05em', width: c.width }}>
                {c.label}
              </th>
            ))}
            {onDelete && <th style={{ width: 80 }} />}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 && (
            <tr><td colSpan={columns.length + 1} style={{ padding: '32px', textAlign: 'center', color: '#565c72', fontStyle: 'italic' }}>No records</td></tr>
          )}
          {rows.map((row, i) => (
            <tr key={i} style={{ borderBottom: '1px solid #1a1e2a' }}>
              {columns.map(c => (
                <td key={c.key} style={{ padding: '10px 14px', color: '#e7e9f0', verticalAlign: 'top', maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {row[c.key]}
                </td>
              ))}
              {onDelete && (
                <td style={{ padding: '8px 14px' }}>
                  <button onClick={() => onDelete(row)} style={{ background: 'rgba(226,89,107,.1)', border: '1px solid rgba(226,89,107,.3)', color: '#e2596b', borderRadius: 6, padding: '4px 10px', fontSize: 12, cursor: 'pointer' }}>
                    {deleteLabel}
                  </button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function DangerButton({ label, onClick, disabled }: { label: string; onClick: () => void; disabled?: boolean }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{ background: 'rgba(226,89,107,.12)', border: '1px solid rgba(226,89,107,.4)', color: '#e2596b', borderRadius: 8, padding: '7px 16px', fontSize: 13, fontWeight: 600, cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? .5 : 1 }}
    >
      {label}
    </button>
  );
}

export function Badge({ text, color = '#8b90a3' }: { text: string; color?: string }) {
  return (
    <span style={{ display: 'inline-block', padding: '2px 7px', borderRadius: 4, fontSize: 11, fontWeight: 600, background: color + '22', color, border: `1px solid ${color}44`, fontFamily: 'monospace' }}>
      {text}
    </span>
  );
}

export function Spinner() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 48 }}>
      <div style={{ width: 28, height: 28, borderRadius: '50%', border: '3px solid #262b3a', borderTopColor: '#e8b339', animation: 'spin .7s linear infinite' }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}

export function ErrorBox({ message }: { message: string }) {
  return (
    <div style={{ background: 'rgba(226,89,107,.08)', border: '1px solid rgba(226,89,107,.3)', borderRadius: 8, padding: '12px 16px', color: '#e2596b', fontSize: 13 }}>
      {message}
    </div>
  );
}

export function ConfirmModal({ message, onConfirm, onCancel }: { message: string; onConfirm: () => void; onCancel: () => void }) {
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
      <div style={{ background: '#171a24', border: '1px solid #262b3a', borderRadius: 12, padding: '28px 32px', maxWidth: 420, width: '90%' }}>
        <p style={{ color: '#e7e9f0', fontSize: 15, margin: '0 0 20px', lineHeight: 1.5 }}>{message}</p>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <button onClick={onCancel} style={{ background: 'transparent', border: '1px solid #262b3a', color: '#8b90a3', borderRadius: 7, padding: '7px 16px', cursor: 'pointer', fontSize: 13 }}>Cancel</button>
          <button onClick={onConfirm} style={{ background: '#e2596b', border: 'none', color: '#fff', borderRadius: 7, padding: '7px 16px', fontWeight: 700, cursor: 'pointer', fontSize: 13 }}>Delete</button>
        </div>
      </div>
    </div>
  );
}
