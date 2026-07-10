import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import type { UserProfile } from '../context/AuthContext';

const PROFESSIONS = [
  'Frontend Developer', 'Backend Developer', 'Full-Stack Developer',
  'Mobile Developer', 'DevOps / SRE', 'Data Engineer', 'ML / AI Engineer',
  'Student', 'Other',
];

export function ProfileSetup() {
  const { user, saveProfile, logout } = useAuth();
  const [form, setForm] = useState<UserProfile>({
    name: user?.displayName || '',
    profession: '',
    age: '',
    gender: '',
  });
  const [errors, setErrors] = useState<Partial<UserProfile>>({});

  const set = (field: keyof UserProfile, value: string) => {
    setForm((f) => ({ ...f, [field]: value }));
    setErrors((e) => ({ ...e, [field]: '' }));
  };

  const validate = (): boolean => {
    const errs: Partial<UserProfile> = {};
    if (!form.name.trim()) errs.name = 'Name is required';
    if (!form.profession) errs.profession = 'Select your profession';
    if (!form.age || isNaN(Number(form.age)) || Number(form.age) < 10 || Number(form.age) > 100)
      errs.age = 'Enter a valid age (10–100)';
    if (!form.gender) errs.gender = 'Select your gender';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) saveProfile(form);
  };

  return (
    <div 
      className="flex min-h-screen items-center justify-center bg-cover bg-center px-4 py-10 relative overflow-hidden"
      style={{
        backgroundImage: `linear-gradient(to bottom, rgba(14, 16, 23, 0.85), rgba(14, 16, 23, 0.95)), url('/bg-laptop.jpg')`
      }}
    >
      <div className="w-full max-w-md relative z-10">
        {/* Header */}
        <div className="mb-8 flex flex-col items-center gap-2">
          {user?.photoURL && (
            <img src={user.photoURL} alt="avatar" className="mb-2 h-14 w-14 rounded-full ring-2 ring-[var(--color-amber)]" />
          )}
          <h1 className="font-display text-xl font-semibold">Set up your profile</h1>
          <p className="text-sm text-[var(--color-text-muted)]">
            Just a few details so DevAgent can personalise your workspace.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-xl border border-[var(--color-ink-border)] bg-[var(--color-ink-panel)] p-8 space-y-5"
          noValidate
        >
          {/* Name */}
          <Field label="Display name" error={errors.name}>
            <input
              type="text"
              value={form.name}
              onChange={(e) => set('name', e.target.value)}
              placeholder="e.g. Ajith Kumar"
              className={inputCls(!!errors.name)}
            />
          </Field>

          {/* Profession */}
          <Field label="Profession" error={errors.profession}>
            <select
              value={form.profession}
              onChange={(e) => set('profession', e.target.value)}
              className={inputCls(!!errors.profession)}
            >
              <option value="">Select your role…</option>
              {PROFESSIONS.map((p) => <option key={p} value={p}>{p}</option>)}
            </select>
          </Field>

          {/* Age */}
          <Field label="Age" error={errors.age}>
            <input
              type="number"
              value={form.age}
              onChange={(e) => set('age', e.target.value)}
              placeholder="e.g. 22"
              min={10}
              max={100}
              className={inputCls(!!errors.age)}
            />
          </Field>

          {/* Gender */}
          <Field label="Gender" error={errors.gender}>
            <div className="flex gap-3 flex-wrap">
              {['Male', 'Female', 'Non-binary', 'Prefer not to say'].map((g) => (
                <label key={g} className="flex cursor-pointer items-center gap-2 text-sm">
                  <input
                    type="radio"
                    name="gender"
                    value={g}
                    checked={form.gender === g}
                    onChange={() => set('gender', g)}
                    className="accent-[var(--color-amber)]"
                  />
                  {g}
                </label>
              ))}
            </div>
            {errors.gender && <p className="mt-1 text-xs text-[var(--color-diff-red)]">{errors.gender}</p>}
          </Field>

          <button
            type="submit"
            className="mt-2 w-full rounded-lg bg-[var(--color-amber)] px-4 py-2.5 text-sm font-semibold text-[var(--color-ink)] transition-opacity hover:opacity-90"
          >
            Enter workspace →
          </button>
        </form>

        <button
          onClick={logout}
          className="mt-4 w-full text-center text-xs text-[var(--color-text-faint)] hover:text-[var(--color-text-muted)]"
        >
          Sign out and use a different account
        </button>
      </div>
    </div>
  );
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-medium text-[var(--color-text-muted)]">{label}</label>
      {children}
      {error && <p className="text-xs text-[var(--color-diff-red)]">{error}</p>}
    </div>
  );
}

function inputCls(hasError: boolean) {
  return [
    'w-full rounded-lg border bg-[var(--color-ink-panel-raised)] px-3 py-2 text-sm text-[var(--color-text)]',
    'placeholder:text-[var(--color-text-faint)] focus:outline-none focus:ring-2',
    hasError
      ? 'border-[var(--color-diff-red)] focus:ring-[var(--color-diff-red)]'
      : 'border-[var(--color-ink-border)] focus:ring-[var(--color-amber)]',
  ].join(' ');
}
