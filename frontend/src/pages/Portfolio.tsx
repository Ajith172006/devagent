import { useState, useEffect } from 'react';
import { Globe, Download } from 'lucide-react';
import { portfolioApi } from '../api/modules';
import type { PortfolioData } from '../types';
import { GutterCard } from '../components/GutterCard';
import { Button, EmptyState, ErrorNote, Input, Loader } from '../components/ui';
import { useAuth } from '../context/AuthContext';

export function Portfolio() {
  const { user, profile, saveProfile } = useAuth();
  const [githubUsername, setGithubUsername] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [includeLeetcode, setIncludeLeetcode] = useState(false);
  const [data, setData] = useState<PortfolioData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (profile) {
      setDisplayName((prev) => prev || profile.name || '');
      setPhotoUrl(profile.photoUrl || '');
    } else if (user) {
      setDisplayName((prev) => prev || user.displayName || '');
      setPhotoUrl(user.photoURL || '');
    }
  }, [profile, user]);

  async function handlePhotoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      alert('File too large (max 5MB)');
      return;
    }
    const reader = new FileReader();
    reader.onload = async (event) => {
      const base64Data = event.target?.result as string;
      setPhotoUrl(base64Data);

      const updatedProfile = {
        name: profile?.name || displayName || user?.displayName || 'Developer',
        profession: profile?.profession || 'Full-Stack Developer',
        age: profile?.age || '25',
        gender: profile?.gender || 'Prefer not to say',
        resumeText: profile?.resumeText,
        photoUrl: base64Data,
      };
      try {
        await saveProfile(updatedProfile);
      } catch (err) {
        console.error('Failed to auto-save uploaded image to profile:', err);
      }
    };
    reader.readAsDataURL(file);
  }

  async function handleGenerate(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const result = await portfolioApi.generate(githubUsername || undefined);
      setData(result);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-3xl space-y-5">
      <form onSubmit={handleGenerate} className="flex flex-wrap gap-3 items-end">
        <div className="flex items-center gap-3 bg-[var(--color-ink-panel-raised)] border border-[var(--color-ink-border)] rounded-lg px-3 py-1.5 h-[38px]">
          <div className="relative group cursor-pointer h-7 w-7 flex-shrink-0">
            {photoUrl ? (
              <img 
                src={photoUrl} 
                alt="Avatar" 
                className="h-7 w-7 rounded-full ring-2 ring-[var(--color-amber)] object-cover" 
              />
            ) : (
              <div className="h-7 w-7 rounded-full bg-[var(--color-ink-panel)] border border-[var(--color-ink-border)] flex items-center justify-center text-xs text-[var(--color-text-muted)]">
                👤
              </div>
            )}
            <div className="absolute inset-0 bg-black/70 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-150">
              <span className="text-[7px] text-white font-semibold">Edit</span>
            </div>
            <input
              type="file"
              accept="image/*"
              className="absolute inset-0 opacity-0 cursor-pointer"
              onChange={handlePhotoUpload}
              title="Upload Portfolio Photo"
            />
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] text-[var(--color-text-muted)] font-semibold leading-tight">Portfolio Image</span>
            <span className="text-[8px] text-[var(--color-text-faint)] leading-tight">Click circle to upload</span>
          </div>
        </div>
        <div>
          <label className="text-xs text-[var(--color-text-muted)]">Display name</label>
          <Input
            placeholder="Ada Lovelace"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            className="w-52"
          />
        </div>
        <div>
          <label className="text-xs text-[var(--color-text-muted)]">GitHub username (optional)</label>
          <Input
            placeholder="octocat"
            value={githubUsername}
            onChange={(e) => setGithubUsername(e.target.value)}
            className="w-52"
          />
        </div>
        <div className="flex items-center gap-2 h-[38px] px-3 bg-[var(--color-ink-panel-raised)] border border-[var(--color-ink-border)] rounded-lg select-none mb-[2px]">
          <label className="flex cursor-pointer items-center gap-2 text-xs font-semibold text-[var(--color-text-muted)]">
            <input
              type="checkbox"
              checked={includeLeetcode}
              onChange={(e) => setIncludeLeetcode(e.target.checked)}
              className="accent-[var(--color-amber)] h-4 w-4 rounded cursor-pointer"
            />
            Include LeetCode solved counts
          </label>
        </div>
        <Button type="submit" disabled={loading}>
          <Globe size={15} />
          {loading ? 'Generating…' : 'Generate preview'}
        </Button>
        <a href={portfolioApi.exportUrl(user?.uid, githubUsername || undefined, displayName || undefined, includeLeetcode)} target="_blank" rel="noopener noreferrer">
          <Button type="button" variant="ghost">
            <Download size={15} />
            Download HTML
          </Button>
        </a>
      </form>

      {error && <ErrorNote message={error} />}
      {loading && <Loader label="Aggregating your work…" />}

      {!loading && !data && !error && (
        <EmptyState
          title="No portfolio generated yet"
          hint="Pulls your GitHub repos, LeetCode stats, streak, and featured snippets into a single shareable page."
          icon={<Globe size={22} />}
        />
      )}

      {data && (
        <div className="space-y-5">
          {/* Profile Header Card */}
          <div className="rounded-xl border border-[var(--color-ink-border)] bg-[var(--color-ink-panel)] p-6 flex flex-col md:flex-row items-start md:items-center gap-5">
            {data.user?.photoUrl || photoUrl ? (
              <img
                src={data.user?.photoUrl || photoUrl}
                alt="Profile"
                className="h-20 w-20 rounded-full ring-2 ring-[var(--color-amber)] object-cover flex-shrink-0"
              />
            ) : (
              <div className="h-20 w-20 rounded-full bg-[var(--color-ink-panel-raised)] border border-[var(--color-ink-border)] flex items-center justify-center text-2xl flex-shrink-0">
                👤
              </div>
            )}
            <div className="space-y-1">
              <h2 className="text-xl font-bold font-display text-[var(--color-text)]">
                {displayName || data.user?.name || 'Developer'}
              </h2>
              {(data.user?.profession || data.resumeAnalysis?.profession) && (
                <p className="text-sm font-semibold text-[var(--color-amber)]">
                  {data.user?.profession || data.resumeAnalysis?.profession}
                </p>
              )}
              {(data.resumeAnalysis?.summary || data.github?.profile?.bio) && (
                <p className="text-xs text-[var(--color-text-muted)] max-w-2xl leading-relaxed mt-1">
                  {data.resumeAnalysis?.summary || data.github?.profile?.bio}
                </p>
              )}
              {data.resumeAnalysis?.contact && (
                <div className="flex flex-wrap gap-3 text-xs text-[var(--color-text-faint)] pt-1">
                  {data.resumeAnalysis.contact.email && <span>📧 {data.resumeAnalysis.contact.email}</span>}
                  {data.resumeAnalysis.contact.location && <span>📍 {data.resumeAnalysis.contact.location}</span>}
                  {data.resumeAnalysis.contact.linkedin && <span>🔗 {data.resumeAnalysis.contact.linkedin}</span>}
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:grid-cols-4">
            <GutterCard gutter="green">
              <p className="text-xs text-[var(--color-text-muted)]">LeetCode solved</p>
              <p className="font-data text-xl font-semibold">{data.leetcode.totalSolved}</p>
            </GutterCard>
            <GutterCard gutter="red">
              <p className="text-xs text-[var(--color-text-muted)]">Day streak</p>
              <p className="font-data text-xl font-semibold">{data.streak.currentStreak}</p>
            </GutterCard>
            <GutterCard gutter="amber">
              <p className="text-xs text-[var(--color-text-muted)]">GitHub repos</p>
              <p className="font-data text-xl font-semibold">{data.github?.totalRepos ?? 0}</p>
            </GutterCard>
            <GutterCard gutter="muted">
              <p className="text-xs text-[var(--color-text-muted)]">Snippets</p>
              <p className="font-data text-xl font-semibold">{data.featuredSnippets.length}</p>
            </GutterCard>
          </div>

          {/* Resume Skills Section */}
          {data.resumeAnalysis?.skills && data.resumeAnalysis.skills.length > 0 && (
            <GutterCard gutter="amber">
              <h3 className="font-display text-sm font-semibold mb-3">Skills & Technologies</h3>
              <div className="flex flex-wrap gap-1.5">
                {data.resumeAnalysis.skills.map((skill) => (
                  <span
                    key={skill}
                    className="rounded-md bg-[var(--color-ink-panel-raised)] border border-[var(--color-ink-border)] px-2.5 py-1 text-xs text-[var(--color-text)]"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </GutterCard>
          )}

          {/* Resume Work Experience Timeline */}
          {data.resumeAnalysis?.experience && data.resumeAnalysis.experience.length > 0 && (
            <GutterCard gutter="green">
              <h3 className="font-display text-sm font-semibold mb-4">Work Experience</h3>
              <div className="space-y-4 border-l border-[var(--color-ink-border)] pl-4">
                {data.resumeAnalysis.experience.map((exp, i) => (
                  <div key={i} className="relative space-y-0.5">
                    <div className="absolute -left-[21px] top-1.5 h-2.5 w-2.5 rounded-full bg-[var(--color-amber)]" />
                    <h4 className="text-sm font-semibold text-[var(--color-text)]">{exp.role}</h4>
                    <p className="text-xs text-[var(--color-amber)]">{exp.company} · {exp.duration}</p>
                    <p className="text-xs text-[var(--color-text-muted)] leading-relaxed whitespace-pre-wrap mt-1">
                      {exp.description}
                    </p>
                  </div>
                ))}
              </div>
            </GutterCard>
          )}

          {/* Education & Projects */}
          {data.resumeAnalysis?.education && data.resumeAnalysis.education.length > 0 && (
            <GutterCard gutter="muted">
              <h3 className="font-display text-sm font-semibold mb-3">Education</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {data.resumeAnalysis.education.map((edu, i) => (
                  <div key={i} className="rounded-lg border border-[var(--color-ink-border)] bg-[var(--color-ink-panel-raised)] p-3 space-y-1">
                    <p className="text-xs font-semibold text-[var(--color-text)]">{edu.degree}</p>
                    <p className="text-xs text-[var(--color-text-muted)]">{edu.school} ({edu.duration})</p>
                  </div>
                ))}
              </div>
            </GutterCard>
          )}

          {data.featuredSnippets.length > 0 && (
            <GutterCard gutter="amber">
              <h3 className="font-display text-sm font-semibold mb-3">Featured snippets</h3>
              <div className="flex flex-wrap gap-2">
                {data.featuredSnippets.map((s) => (
                  <span
                    key={s.title}
                    className="rounded-full bg-[var(--color-ink-panel-raised)] px-3 py-1 text-xs"
                  >
                    {s.title} <span className="text-[var(--color-text-faint)]">· {s.language}</span>
                  </span>
                ))}
              </div>
            </GutterCard>
          )}

          <p className="hash-tag">
            Use "Download HTML" above for a self-contained page you can host anywhere.
          </p>
        </div>
      )}
    </div>
  );
}
