import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { usersApi } from '../api/modules';
import { UserCircle } from 'lucide-react';

const PROFESSIONS = [
  'Frontend Developer', 'Backend Developer', 'Full-Stack Developer',
  'Mobile Developer', 'DevOps / SRE', 'Data Engineer', 'ML / AI Engineer',
  'Student', 'Other',
];

// PDF.js Helper Functions
const loadPdfJs = (): Promise<any> => {
  return new Promise((resolve, reject) => {
    if ((window as any).pdfjsLib) {
      resolve((window as any).pdfjsLib);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.min.js';
    script.onload = () => {
      const pdfjsLib = (window as any).pdfjsLib;
      pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.worker.min.js';
      resolve(pdfjsLib);
    };
    script.onerror = () => reject(new Error('Failed to load PDF.js'));
    document.head.appendChild(script);
  });
};

const dataUrlToArrayBuffer = (dataUrl: string): ArrayBuffer => {
  const base64 = dataUrl.split(',')[1];
  const binary = atob(base64);
  const len = binary.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
};

const extractImagesFromPdf = async (arrayBuffer: ArrayBuffer): Promise<string[]> => {
  const pdfjsLib = await loadPdfJs();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  const validImages: { dataUrl: string; area: number }[] = [];

  if (pdf.numPages > 0) {
    const page = await pdf.getPage(1);
    const operatorList = await page.getOperatorList();

    for (let i = 0; i < operatorList.fnArray.length; i++) {
      const fn = operatorList.fnArray[i];
      if (fn === pdfjsLib.OPS.paintImageXObject || fn === pdfjsLib.OPS.paintJpegXObject) {
        const args = operatorList.argsArray[i];
        const imageId = args[0];
        try {
          const img = page.objs.get(imageId) || page.commonObjs.get(imageId);
          if (img && img.width && img.height && img.data) {
            const canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext('2d');
            if (ctx) {
              const imageData = ctx.createImageData(img.width, img.height);
              if (img.data.length === img.width * img.height * 3) {
                let srcIdx = 0;
                let dstIdx = 0;
                for (let p = 0; p < img.width * img.height; p++) {
                  imageData.data[dstIdx] = img.data[srcIdx];
                  imageData.data[dstIdx + 1] = img.data[srcIdx + 1];
                  imageData.data[dstIdx + 2] = img.data[srcIdx + 2];
                  imageData.data[dstIdx + 3] = 255;
                  srcIdx += 3;
                  dstIdx += 4;
                }
              } else if (img.data.length === img.width * img.height * 4) {
                imageData.data.set(img.data);
              } else {
                continue;
              }
              ctx.putImageData(imageData, 0, 0);
              const dataUrl = canvas.toDataURL('image/jpeg');
              validImages.push({ dataUrl, area: img.width * img.height });
            }
          }
        } catch (e) {
          console.error('Error extracting image object:', e);
        }
      }
    }
  }

  validImages.sort((a, b) => b.area - a.area);
  return validImages.filter(img => img.area >= 2500).map(img => img.dataUrl);
};

export function Profile() {
  const { user, saveProfile } = useAuth();
  const [form, setForm] = useState({
    name: '',
    profession: '',
    age: '',
    gender: '',
    resumeText: '',
    photoUrl: '',
  });
  const [resumeAnalysis, setResumeAnalysis] = useState<any>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [resumeChanged, setResumeChanged] = useState(false);

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
      if (data.resumeAnalysis) {
        try {
          setResumeAnalysis(JSON.parse(data.resumeAnalysis));
        } catch {}
      }
    }).catch(console.error);
  }, []);

  const set = (field: string, value: string) => {
    setForm((f) => ({ ...f, [field]: value }));
    setErrors((e) => ({ ...e, [field]: '' }));
    setMessage('');
  };

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!form.name.trim()) errs.name = 'Name is required';
    if (!form.profession) errs.profession = 'Select your profession';
    if (!form.age || isNaN(Number(form.age)) || Number(form.age) < 10 || Number(form.age) > 100)
      errs.age = 'Enter a valid age (10–100)';
    if (!form.gender) errs.gender = 'Select your gender';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    
    setSaving(true);
    setMessage('');
    try {
      await saveProfile(form, resumeChanged);
      const data = await usersApi.me();
      if (data.resumeAnalysis) {
        try {
          setResumeAnalysis(JSON.parse(data.resumeAnalysis));
        } catch {}
      }
      setResumeChanged(false);
      setMessage('Profile and resume updated successfully!');
    } catch (err) {
      setMessage('Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  const handleImageUploadFromIcon = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      alert('File too large (max 5MB)');
      return;
    }

    setSaving(true);
    setMessage('Uploading profile photo...');

    try {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const base64Data = event.target?.result as string;

        const updatedForm = {
          ...form,
          photoUrl: base64Data,
        };

        setForm(updatedForm);

        // Ensure database save succeeds
        const finalForm = {
          ...updatedForm,
          name: updatedForm.name || user?.displayName || 'Developer',
          profession: updatedForm.profession || 'Full-Stack Developer',
          age: updatedForm.age || '25',
          gender: updatedForm.gender || 'Prefer not to say',
        };

        await saveProfile(finalForm);
        setMessage('Profile photo updated successfully!');
      };
      reader.readAsDataURL(file);
    } catch (err) {
      console.error(err);
      setMessage('Failed to process and upload profile photo.');
    } finally {
      setSaving(false);
    }
  };

  const handleBottomResumeUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setErrors((prev) => ({ ...prev, resumeText: 'File too large (max 5MB)' }));
      return;
    }

    setSaving(true);
    setMessage('Reading resume PDF...');

    try {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const base64Data = event.target?.result as string;

        let extractedPhotoUrl = '';
        try {
          const arrayBuffer = dataUrlToArrayBuffer(base64Data);
          const images = await extractImagesFromPdf(arrayBuffer);
          if (images && images.length > 0) {
            extractedPhotoUrl = images[0];
          }
        } catch (err) {
          console.error('Failed to extract image from PDF:', err);
        }

        setForm((prev) => ({
          ...prev,
          resumeText: base64Data,
          photoUrl: extractedPhotoUrl || prev.photoUrl,
        }));
        setResumeChanged(true);
        
        setMessage(extractedPhotoUrl 
          ? 'Resume loaded and profile photo extracted! Click Save Profile to apply.' 
          : 'Resume loaded! Click Save Profile to apply.'
        );
      };
      reader.readAsDataURL(file);
    } catch (err) {
      console.error(err);
      setMessage('Failed to process resume.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center gap-6 border-b border-[var(--color-ink-border)] pb-6">
        <div className="relative group cursor-pointer h-20 w-20 flex-shrink-0">
          {form.photoUrl || user?.photoURL ? (
            <img 
              src={form.photoUrl || user?.photoURL || undefined} 
              alt="Profile" 
              className="h-20 w-20 rounded-full ring-2 ring-[var(--color-amber)] object-cover" 
            />
          ) : (
            <UserCircle size={80} className="text-[var(--color-text-muted)] h-20 w-20" />
          )}
          {/* Overlay Upload Button / Loading Spinner */}
          <div className="absolute inset-0 bg-black/70 rounded-full flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            {saving ? (
              <span className="h-5 w-5 animate-spin rounded-full border-2 border-[var(--color-ink-border)] border-t-[var(--color-amber)]" />
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white mb-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
                <span className="text-[8px] text-white font-semibold text-center leading-tight">Upload<br/>Photo</span>
              </>
            )}
          </div>
          {!saving && (
            <input
              type="file"
              accept="image/*"
              className="absolute inset-0 opacity-0 cursor-pointer"
              onChange={handleImageUploadFromIcon}
              title="Upload Profile Photo"
            />
          )}
        </div>
        <div>
          <h2 className="text-2xl font-semibold font-display">{form.name || 'Your Profile'}</h2>
          <p className="text-[var(--color-text-muted)]">{user?.email}</p>
          <p className="text-xs text-[var(--color-text-faint)] mt-1">Hover over your profile photo to upload a custom image</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6" noValidate>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Name */}
          <Field label="Display name" error={errors.name}>
            <input
              type="text"
              value={form.name}
              onChange={(e) => set('name', e.target.value)}
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
              min={10} max={100}
              className={inputCls(!!errors.age)}
            />
          </Field>

          {/* Gender */}
          <Field label="Gender" error={errors.gender}>
            <div className="flex gap-3 flex-wrap h-10 items-center">
              {['Male', 'Female', 'Non-binary', 'Prefer not to say'].map((g) => (
                <label key={g} className="flex cursor-pointer items-center gap-1.5 text-sm">
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
        </div>

        {/* Resume */}
        <div className="pt-4 border-t border-[var(--color-ink-border)]">
          <Field label="Resume (PDF format only)" error={errors.resumeText}>
            <input
              type="file"
              accept=".pdf"
              onChange={handleBottomResumeUpload}
              className="block w-full text-sm text-[var(--color-text-muted)]
                file:mr-4 file:py-2 file:px-4
                file:rounded-full file:border-0
                file:text-sm file:font-semibold
                file:bg-[var(--color-amber)] file:text-[var(--color-ink)]
                hover:file:opacity-90"
            />
            {form.resumeText && form.resumeText.startsWith('data:') && (
              <p className="mt-2 text-xs text-[var(--color-diff-green)]">✓ Resume PDF attached and ready to be analyzed.</p>
            )}
          </Field>
        </div>

        <div className="flex items-center gap-4 pt-4">
          <button
            type="submit"
            disabled={saving}
            className="rounded-lg bg-[var(--color-amber)] px-6 py-2.5 text-sm font-semibold text-[var(--color-ink)] transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {saving ? 'Analyzing & Saving...' : 'Save Profile'}
          </button>
          {message && <span className="text-sm text-[var(--color-diff-green)]">{message}</span>}
        </div>
      </form>

      {resumeAnalysis && (
        <div className="rounded-xl border border-[var(--color-ink-border)] bg-[var(--color-ink-panel)] p-6 space-y-4">
          <h3 className="font-display text-base font-semibold text-[var(--color-amber)]">AI Resume Analysis Result</h3>
          
          {resumeAnalysis.summary && (
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">Extracted Summary</h4>
              <p className="text-sm mt-1 text-[var(--color-text)] leading-relaxed">{resumeAnalysis.summary}</p>
            </div>
          )}

          {resumeAnalysis.skills && resumeAnalysis.skills.length > 0 && (
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">Extracted Skills</h4>
              <div className="flex flex-wrap gap-1.5 mt-2">
                {resumeAnalysis.skills.map((s: string) => (
                  <span key={s} className="rounded bg-[var(--color-ink-panel-raised)] px-2.5 py-1 text-xs text-[var(--color-text)] border border-[var(--color-ink-border)]">
                    {s}
                  </span>
                ))}
              </div>
            </div>
          )}

          {resumeAnalysis.experience && resumeAnalysis.experience.length > 0 && (
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">Experience Timeline</h4>
              <div className="mt-3 space-y-4">
                {resumeAnalysis.experience.map((exp: any, index: number) => (
                  <div key={index} className="border-l border-[var(--color-ink-border)] pl-4 py-1 relative">
                    <div className="absolute left-[-4.5px] top-2.5 w-2.5 h-2.5 rounded-full bg-[var(--color-amber)]" />
                    <h5 className="text-sm font-semibold text-[var(--color-text)]">{exp.role}</h5>
                    <p className="text-xs text-[var(--color-text-muted)]">{exp.company} · {exp.duration}</p>
                    <p className="text-xs text-[var(--color-text-muted)] mt-1 whitespace-pre-wrap">{exp.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {resumeAnalysis.education && resumeAnalysis.education.length > 0 && (
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">Education</h4>
              <div className="mt-2 space-y-2">
                {resumeAnalysis.education.map((edu: any, index: number) => (
                  <div key={index} className="text-xs">
                    <span className="font-semibold text-[var(--color-text)]">{edu.degree}</span>
                    <span className="text-[var(--color-text-muted)]"> — {edu.school} ({edu.duration})</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
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
