import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { usersApi } from '../api/modules';
import { UserCircle, Upload, RefreshCw, CheckCircle } from 'lucide-react';

const PROFESSIONS = [
  'Frontend Developer', 'Backend Developer', 'Full-Stack Developer',
  'Mobile Developer', 'DevOps / SRE', 'Data Engineer', 'ML / AI Engineer',
  'Student', 'Other',
];

// ── PDF helpers ──────────────────────────────────────────────────────────────

const loadPdfJs = (): Promise<any> => new Promise((resolve, reject) => {
  if ((window as any).pdfjsLib) { resolve((window as any).pdfjsLib); return; }
  const s = document.createElement('script');
  s.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.min.js';
  s.onload = () => {
    const lib = (window as any).pdfjsLib;
    lib.GlobalWorkerOptions.workerSrc =
      'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.worker.min.js';
    resolve(lib);
  };
  s.onerror = () => reject(new Error('Failed to load PDF.js'));
  document.head.appendChild(s);
});

const extractImageFromPdf = async (dataUrl: string): Promise<string> => {
  try {
    const lib = await loadPdfJs();
    const base64 = dataUrl.split(',')[1];
    const bin = atob(base64);
    const bytes = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    const pdf = await lib.getDocument({ data: bytes.buffer }).promise;
    const page = await pdf.getPage(1);
    const ops = await page.getOperatorList();
    const imgs: { dataUrl: string; area: number }[] = [];
    for (let i = 0; i < ops.fnArray.length; i++) {
      const fn = ops.fnArray[i];
      if (fn === lib.OPS.paintImageXObject || fn === lib.OPS.paintJpegXObject) {
        const id = ops.argsArray[i][0];
        try {
          const img = page.objs.get(id) || page.commonObjs.get(id);
          if (img?.width && img?.height && img?.data) {
            const c = document.createElement('canvas');
            c.width = img.width; c.height = img.height;
            const ctx = c.getContext('2d')!;
            const id2 = ctx.createImageData(img.width, img.height);
            if (img.data.length === img.width * img.height * 3) {
              let s2 = 0, d = 0;
              for (let p = 0; p < img.width * img.height; p++) {
                id2.data[d] = img.data[s2]; id2.data[d+1] = img.data[s2+1];
                id2.data[d+2] = img.data[s2+2]; id2.data[d+3] = 255;
                s2 += 3; d += 4;
              }
            } else if (img.data.length === img.width * img.height * 4) {
              id2.data.set(img.data);
            } else continue;
            ctx.putImageData(id2, 0, 0);
            imgs.push({ dataUrl: c.toDataURL('image/jpeg'), area: img.width * img.height });
          }
        } catch {}
      }
    }
    imgs.sort((a, b) => b.area - a.area);
    return imgs.find(i => i.area >= 2500)?.dataUrl || '';
  } catch { return ''; }
};

// ── Main component ────────────────────────────────────────────────────────────

export function Profile() {
  const { user, resumeAnalysis: ctxResume, saveProfile, refreshResumeAnalysis } = useAuth();

  const [form, setForm] = useState({
    name: '', profession: '', age: '', gender: '', resumeText: '', photoUrl: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<'idle' | 'saving' | 'analyzing' | 'done' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const [resumeReady, setResumeReady] = useState(false);
  const [resumeChanged, setResumeChanged] = useState(false);

  // Load form from backend on mount
  useEffect(() => {
    usersApi.me().then((data) => {
      setForm({
        name: data.name || '',
        profession: data.profession || '',
        age: data.age || '',
        gender: data.gender || '',
        resumeText: data.resumeText || '',
        photoUrl: data.photoUrl || '',
      });
      if (data.resumeText) setResumeReady(true);
    }).catch(console.error);
  }, []);

  const set = (field: string, value: string) => {
    setForm(f => ({ ...f, [field]: value }));
    setErrors(e => ({ ...e, [field]: '' }));
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!form.name.trim()) errs.name = 'Name is required';
    if (!form.profession) errs.profession = 'Select your profession';
    if (!form.age || isNaN(+form.age) || +form.age < 10 || +form.age > 100)
      errs.age = 'Enter a valid age (10–100)';
    if (!form.gender) errs.gender = 'Select your gender';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setStatus(resumeChanged ? 'analyzing' : 'saving');
    setMessage(resumeChanged ? 'Analyzing resume with AI… this takes ~10s' : 'Saving profile…');
    try {
      await saveProfile(form, resumeChanged);
      setResumeChanged(false);
      setStatus('done');
      setMessage('Profile saved! Resume analysis updated.');
    } catch {
      setStatus('error');
      setMessage('Failed to save profile.');
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { alert('Max 5MB'); return; }
    const reader = new FileReader();
    reader.onload = async (ev) => {
      const base64 = ev.target?.result as string;
      const updated = { ...form, photoUrl: base64,
        name: form.name || user?.displayName || 'Developer',
        profession: form.profession || 'Full-Stack Developer',
        age: form.age || '25',
        gender: form.gender || 'Prefer not to say',
      };
      setForm(updated);
      try { await saveProfile(updated); } catch {}
    };
    reader.readAsDataURL(file);
  };

  const handleResumeUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { setErrors(v => ({ ...v, resume: 'Max 5MB' })); return; }
    setStatus('saving');
    setMessage('Reading PDF…');
    const reader = new FileReader();
    reader.onload = async (ev) => {
      const base64 = ev.target?.result as string;
      const extracted = await extractImageFromPdf(base64);
      setForm(prev => ({
        ...prev,
        resumeText: base64,
        photoUrl: extracted || prev.photoUrl,
      }));
      setResumeReady(true);
      setResumeChanged(true);
      setStatus('idle');
      setMessage(extracted
        ? '✓ Resume loaded, profile photo extracted. Click Save Profile to analyze.'
        : '✓ Resume loaded. Click Save Profile to analyze with AI.');
    };
    reader.readAsDataURL(file);
  };

  const isBusy = status === 'saving' || status === 'analyzing';

  return (
    <div className="mx-auto max-w-2xl space-y-8">

      {/* ── Avatar + name header ── */}
      <div className="flex items-center gap-5 border-b border-[var(--color-ink-border)] pb-6">
        <div className="relative group cursor-pointer h-20 w-20 flex-shrink-0">
          {form.photoUrl || user?.photoURL ? (
            <img src={form.photoUrl || user?.photoURL || undefined} alt="Profile"
              className="h-20 w-20 rounded-full ring-2 ring-[var(--color-amber)] object-cover" />
          ) : (
            <UserCircle size={80} className="text-[var(--color-text-muted)]" />
          )}
          <div className="absolute inset-0 bg-black/70 rounded-full flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <Upload size={18} className="text-white mb-0.5" />
            <span className="text-[8px] text-white font-semibold">Upload Photo</span>
          </div>
          <input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer"
            onChange={handlePhotoUpload} />
        </div>
        <div>
          <h2 className="text-2xl font-semibold font-display">{form.name || 'Your Profile'}</h2>
          <p className="text-sm text-[var(--color-text-muted)]">{user?.email}</p>
        </div>
      </div>

      {/* ── Profile form ── */}
      <form onSubmit={handleSubmit} className="space-y-5" noValidate>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <Field label="Display name" error={errors.name}>
            <input type="text" value={form.name}
              onChange={e => set('name', e.target.value)} className={inputCls(!!errors.name)} />
          </Field>
          <Field label="Profession" error={errors.profession}>
            <select value={form.profession}
              onChange={e => set('profession', e.target.value)} className={inputCls(!!errors.profession)}>
              <option value="">Select your role…</option>
              {PROFESSIONS.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </Field>
          <Field label="Age" error={errors.age}>
            <input type="number" value={form.age} min={10} max={100}
              onChange={e => set('age', e.target.value)} className={inputCls(!!errors.age)} />
          </Field>
          <Field label="Gender" error={errors.gender}>
            <div className="flex gap-3 flex-wrap items-center h-10">
              {['Male', 'Female', 'Non-binary', 'Prefer not to say'].map(g => (
                <label key={g} className="flex cursor-pointer items-center gap-1.5 text-sm">
                  <input type="radio" name="gender" value={g} checked={form.gender === g}
                    onChange={() => set('gender', g)} className="accent-[var(--color-amber)]" />
                  {g}
                </label>
              ))}
            </div>
            {errors.gender && <p className="text-xs text-[var(--color-diff-red)]">{errors.gender}</p>}
          </Field>
        </div>

        {/* Resume upload */}
        <div className="border-t border-[var(--color-ink-border)] pt-5">
          <label className="block text-sm font-medium text-[var(--color-text-muted)] mb-1.5">
            Resume <span className="text-[var(--color-text-faint)] font-normal">(PDF — AI will extract all details)</span>
          </label>
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 cursor-pointer rounded-lg border border-dashed border-[var(--color-ink-border)] bg-[var(--color-ink-panel-raised)] px-4 py-2.5 text-sm text-[var(--color-text-muted)] hover:border-[var(--color-amber)] hover:text-[var(--color-text)] transition-colors">
              <Upload size={15} />
              {resumeReady ? 'Replace resume PDF' : 'Upload resume PDF'}
              <input type="file" accept=".pdf" className="hidden" onChange={handleResumeUpload} />
            </label>
            {resumeReady && (
              <span className="flex items-center gap-1.5 text-xs text-[var(--color-diff-green)]">
                <CheckCircle size={13} /> Resume attached
              </span>
            )}
          </div>
          {resumeChanged && (
            <p className="mt-1.5 text-xs text-[var(--color-amber)]">
              ⚠ New resume detected — click Save Profile to run AI analysis
            </p>
          )}
        </div>

        {/* Save button */}
        <div className="flex items-center gap-4 pt-2">
          <button type="submit" disabled={isBusy}
            className="flex items-center gap-2 rounded-lg bg-[var(--color-amber)] px-5 py-2.5 text-sm font-semibold text-[var(--color-ink)] hover:opacity-90 disabled:opacity-50 transition-opacity">
            {status === 'analyzing' && <span className="h-4 w-4 animate-spin rounded-full border-2 border-[var(--color-ink)] border-t-transparent" />}
            {status === 'analyzing' ? 'Analyzing with AI…' : isBusy ? 'Saving…' : 'Save Profile'}
          </button>
          {message && (
            <span className={`text-xs ${status === 'error' ? 'text-[var(--color-diff-red)]' : 'text-[var(--color-diff-green)]'}`}>
              {message}
            </span>
          )}
        </div>
      </form>

      {/* ── Resume Analysis Preview ── */}
      {ctxResume && <ResumePreview resume={ctxResume} onRefresh={refreshResumeAnalysis} />}
    </div>
  );
}

// ── ResumePreview component ──────────────────────────────────────────────────

function ResumePreview({ resume, onRefresh }: {
  resume: NonNullable<ReturnType<typeof useAuth>['resumeAnalysis']>;
  onRefresh: () => Promise<void>;
}) {
  const [refreshing, setRefreshing] = useState(false);
  const refresh = async () => {
    setRefreshing(true);
    await onRefresh();
    setRefreshing(false);
  };

  return (
    <div className="rounded-xl border border-[var(--color-ink-border)] bg-[var(--color-ink-panel)] overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--color-ink-border)] bg-[var(--color-ink-panel-raised)]">
        <div>
          <h3 className="font-display text-sm font-semibold text-[var(--color-amber)]">
            AI Resume Analysis
          </h3>
          <p className="text-xs text-[var(--color-text-faint)] mt-0.5">
            Extracted from your uploaded PDF — auto-fills your portfolio
          </p>
        </div>
        <button onClick={refresh} disabled={refreshing}
          className="flex items-center gap-1.5 rounded-md border border-[var(--color-ink-border)] px-2.5 py-1.5 text-xs text-[var(--color-text-muted)] hover:border-[var(--color-amber)] hover:text-[var(--color-text)] transition-colors disabled:opacity-50">
          <RefreshCw size={12} className={refreshing ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      <div className="p-5 space-y-6">
        {/* Identity */}
        <div className="space-y-1">
          {resume.name && <p className="text-base font-semibold text-[var(--color-text)]">{resume.name}</p>}
          {resume.profession && <p className="text-sm text-[var(--color-amber)] font-medium">{resume.profession}</p>}
          {resume.summary && <p className="text-xs text-[var(--color-text-muted)] leading-relaxed mt-1">{resume.summary}</p>}
        </div>

        {/* Contact */}
        {resume.contact && Object.values(resume.contact).some(Boolean) && (
          <Section title="Contact">
            <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-[var(--color-text-muted)]">
              {resume.contact.email && <span>📧 {resume.contact.email}</span>}
              {resume.contact.phone && <span>📞 {resume.contact.phone}</span>}
              {resume.contact.location && <span>📍 {resume.contact.location}</span>}
              {resume.contact.linkedin && (
                <a href={resume.contact.linkedin} target="_blank" rel="noopener"
                  className="text-[var(--color-amber)] hover:underline">🔗 LinkedIn</a>
              )}
              {resume.contact.github && (
                <a href={resume.contact.github} target="_blank" rel="noopener"
                  className="text-[var(--color-amber)] hover:underline">💻 GitHub</a>
              )}
              {resume.contact.portfolio && (
                <a href={resume.contact.portfolio} target="_blank" rel="noopener"
                  className="text-[var(--color-amber)] hover:underline">🌐 Website</a>
              )}
            </div>
          </Section>
        )}

        {/* Skills */}
        {resume.skills && resume.skills.length > 0 && (
          <Section title="Skills & Technologies">
            <div className="flex flex-wrap gap-1.5">
              {resume.skills.map(s => (
                <span key={s} className="rounded bg-[var(--color-ink-panel-raised)] border border-[var(--color-ink-border)] px-2.5 py-1 text-xs text-[var(--color-text)]">
                  {s}
                </span>
              ))}
            </div>
          </Section>
        )}

        {/* Experience */}
        {resume.experience && resume.experience.length > 0 && (
          <Section title="Work Experience">
            <div className="space-y-4 border-l-2 border-[var(--color-ink-border)] pl-4 ml-1">
              {resume.experience.map((exp, i) => (
                <div key={i} className="relative">
                  <div className="absolute -left-[21px] top-1.5 h-3 w-3 rounded-full bg-[var(--color-amber)]" />
                  <p className="text-sm font-semibold text-[var(--color-text)]">{exp.role}</p>
                  <p className="text-xs text-[var(--color-amber)] font-medium">{exp.company} · {exp.duration}</p>
                  <p className="text-xs text-[var(--color-text-muted)] mt-1 leading-relaxed whitespace-pre-wrap">{exp.description}</p>
                </div>
              ))}
            </div>
          </Section>
        )}

        {/* Projects */}
        {resume.projects && resume.projects.length > 0 && (
          <Section title="Projects">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {resume.projects.map((p, i) => (
                <div key={i} className="rounded-lg border border-[var(--color-ink-border)] bg-[var(--color-ink-panel-raised)] p-3 space-y-1.5">
                  <p className="text-xs font-semibold text-[var(--color-text)]">{p.title}</p>
                  <p className="text-xs text-[var(--color-text-muted)] leading-relaxed">{p.description}</p>
                  {p.tech && p.tech.length > 0 && (
                    <div className="flex flex-wrap gap-1 pt-0.5">
                      {p.tech.map(t => (
                        <span key={t} className="text-[10px] px-1.5 py-0.5 rounded bg-[var(--color-ink-panel)] border border-[var(--color-ink-border)] text-[var(--color-amber)]">
                          {t}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </Section>
        )}

        {/* Education */}
        {resume.education && resume.education.length > 0 && (
          <Section title="Education">
            <div className="space-y-2.5">
              {resume.education.map((edu, i) => (
                <div key={i} className="rounded-lg border border-[var(--color-ink-border)] bg-[var(--color-ink-panel-raised)] px-3.5 py-2.5">
                  <p className="text-xs font-semibold text-[var(--color-text)]">{edu.degree}</p>
                  <p className="text-xs text-[var(--color-text-muted)]">{edu.school} · {edu.duration}</p>
                  {edu.score && <p className="text-[10px] text-[var(--color-amber)] mt-0.5">Score: {edu.score}</p>}
                </div>
              ))}
            </div>
          </Section>
        )}

        {/* Certifications */}
        {resume.certifications && resume.certifications.length > 0 && (
          <Section title="Certifications">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {resume.certifications.map((c, i) => (
                <div key={i} className="rounded-lg border border-[var(--color-ink-border)] bg-[var(--color-ink-panel-raised)] px-3.5 py-2.5">
                  <p className="text-xs font-semibold text-[var(--color-text)]">📜 {c.name}</p>
                  {c.authority && <p className="text-xs text-[var(--color-amber)]">{c.authority}</p>}
                  {c.date && <p className="text-[10px] text-[var(--color-text-faint)]">Issued: {c.date}</p>}
                </div>
              ))}
            </div>
          </Section>
        )}
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--color-text-faint)] mb-2">{title}</p>
      {children}
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
    'w-full rounded-lg border bg-[var(--color-ink-panel-raised)] px-3 py-2.5 text-sm text-[var(--color-text)]',
    'placeholder:text-[var(--color-text-faint)] focus:outline-none focus:ring-1',
    hasError
      ? 'border-[var(--color-diff-red)] focus:ring-[var(--color-diff-red)]'
      : 'border-[var(--color-ink-border)] focus:ring-[var(--color-amber)]',
  ].join(' ');
}
