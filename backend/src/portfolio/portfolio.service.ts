import { Injectable } from '@nestjs/common';
import { SnippetsService } from '../snippets/snippets.service';
import { LeetcodeService } from '../leetcode/leetcode.service';
import { GithubService } from '../github/github.service';
import { GoalsService } from '../goals/goals.service';
import { UsersService } from '../users/users.service';

export interface PortfolioData {
  generatedAt: string;
  github: Awaited<ReturnType<GithubService['getSummary']>> | null;
  leetcode: Awaited<ReturnType<LeetcodeService['stats']>>;
  streak: Awaited<ReturnType<GoalsService['getStreak']>>;
  featuredSnippets: Array<{ title: string; language: string; description: string | null; tags: string[] }>;
  user: Awaited<ReturnType<UsersService['findOne']>> | null;
}

@Injectable()
export class PortfolioService {
  constructor(
    private readonly snippetsService: SnippetsService,
    private readonly leetcodeService: LeetcodeService,
    private readonly githubService: GithubService,
    private readonly goalsService: GoalsService,
    private readonly usersService: UsersService,
  ) {}

  async generate(userId: string, options: { githubUsername?: string } = {}): Promise<PortfolioData> {
    const [snippets, leetcode, streak, github, user] = await Promise.all([
      this.snippetsService.findAll(userId, {}),
      this.leetcodeService.stats(userId),
      this.goalsService.getStreak(userId),
      options.githubUsername ? this.githubService.getSummary(options.githubUsername) : Promise.resolve(null),
      this.usersService.findOne(userId).catch(() => null),
    ]);

    const featuredSnippets = snippets.slice(0, 8).map((s) => ({
      title: s.title,
      language: s.language,
      description: s.description,
      tags: s.tags,
    }));

    return {
      generatedAt: new Date().toISOString(),
      github,
      leetcode,
      streak,
      featuredSnippets,
      user,
    };
  }

  async generateHtml(userId: string, options: { githubUsername?: string; displayName?: string; includeLeetcode?: boolean } = {}): Promise<string> {
    const data = await this.generate(userId, options);
    
    // Parse resume analysis JSON
    let resume: any = null;
    if (data.user?.resumeAnalysis) {
      try {
        resume = JSON.parse(data.user.resumeAnalysis);
      } catch (e) {
        console.error('Failed to parse resume JSON:', e);
      }
    }

    // Map fields from resume or fallbacks
    const name = options.displayName || resume?.name || data.user?.name || data.github?.profile?.['name'] || data.github?.profile?.['login'] || 'Developer';
    const profession = resume?.profession || data.user?.profession || 'Full Stack Developer';
    const bio = resume?.summary || data.github?.profile?.['bio'] || 'Building impactful web solutions.';
    
    // Resume photo URL
    const avatar = data.user?.photoUrl || '';
    const hasImage = !!avatar;

    const email = resume?.contact?.email || data.user?.email || '';
    const phone = resume?.contact?.phone || '';
    const location = resume?.contact?.location || '';
    const githubLink = resume?.contact?.github || (options.githubUsername ? `https://github.com/${options.githubUsername}` : '');
    const linkedinLink = resume?.contact?.linkedin || '';
    const portfolioLink = resume?.contact?.portfolio || '';

    const skills = resume?.skills || ['React', 'Next.js', 'Node.js', 'MongoDB', 'JavaScript', 'HTML', 'CSS', 'Git'];
    const experience = resume?.experience || [];
    const projects = resume?.projects || [];
    const education = resume?.education || [];
    const certifications = resume?.certifications || [];

    // Extract unique tags for dynamic project filtering
    const allProjectTags = Array.from(
      new Set(
        projects.flatMap((p) => p.tech || [])
      )
    ).slice(0, 12) as string[];

    const filterButtonsHtml = allProjectTags.length > 0
      ? `
      <div class="filter-bar reveal">
        <button class="filter-btn active" data-filter="all">All</button>
        ${allProjectTags.map((tag) => `<button class="filter-btn" data-filter="${escapeHtml(tag)}">${escapeHtml(tag)}</button>`).join('')}
      </div>`
      : '';

    // Deterministically select theme colors based on user ID to vary designs
    const themeIndex = getThemeIndex(userId, 4);
    const colors = getThemeColors(themeIndex);

    // Build items HTML
    const totalSkills = skills.length;
    const skillPillsHtml = skills
      .map((s, idx) => {
        const angle = ((360 / totalSkills) * idx).toFixed(1);
        return `
      <div class="skill-pill reveal" style="top: 50%; left: 50%; transform: translate(-50%, -50%) rotate(${angle}deg) translateY(calc(-1 * var(--wheel-radius))) rotate(-${angle}deg);">
        <span class="skill-icon">${getSkillEmoji(s)}</span>${escapeHtml(s)}
      </div>`;
      })
      .join('');

    const timelineItemsHtml = experience
      .map(
        (exp) => `
      <div class="timeline-item reveal">
        <div class="timeline-period">${escapeHtml(exp.duration)}</div>
        <div class="timeline-role">${escapeHtml(exp.role)}</div>
        <div class="timeline-company">${escapeHtml(exp.company)}</div>
        <p style="color: var(--muted); font-size:0.9rem; margin-bottom: 1rem; max-width: 520px;">
          ${escapeHtml(exp.description)}
        </p>
        ${exp.tech && exp.tech.length ? `
        <div class="tech-tags">
          ${exp.tech.map((t: string) => `<span class="tag">${escapeHtml(t)}</span>`).join('')}
        </div>
        ` : ''}
      </div>`,
      )
      .join('');

    const projectCardsHtml = projects
      .map(
        (proj, idx) => `
      <div class="project-card reveal" data-tech="${(proj.tech || []).map(escapeHtml).join(',')}">
        <div class="project-num">${(idx + 1).toString().padStart(2, '0')} / ${escapeHtml(proj.title)}</div>
        <div class="project-title">${escapeHtml(proj.title)}</div>
        <p style="color:var(--muted); font-size:0.87rem; line-height:1.6;">${escapeHtml(proj.description)}</p>
        <div class="project-tech">
          ${(proj.tech || []).map((t) => `<span class="tag">${escapeHtml(t)}</span>`).join('')}
        </div>
      </div>`,
      )
      .join('');

    const educationCardsHtml = education
      .map(
        (edu) => `
      <div class="edu-card reveal">
        <div class="edu-meta">${escapeHtml(edu.duration)}</div>
        <div class="edu-degree">${escapeHtml(edu.degree)}</div>
        <div class="edu-school">${escapeHtml(edu.school)}</div>
        ${edu.score ? `<span class="edu-score">${escapeHtml(edu.score)}</span>` : ''}
      </div>`,
      )
      .join('');

    const certificationsCardsHtml = certifications
      .map(
        (cert) => `
      <div class="cert-card reveal">
        <div class="cert-icon">⚡</div>
        <div>
          <div class="cert-name">${escapeHtml(cert.name)}</div>
          <div class="cert-meta">${escapeHtml(cert.authority || '')}${cert.date ? ' · ' + escapeHtml(cert.date) : ''}</div>
        </div>
      </div>`,
      )
      .join('');

    // Generate output HTML
    return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>${escapeHtml(name)} — Portfolio</title>
<link href="https://fonts.googleapis.com/css2?family=Syne:wght@400;700;800&family=DM+Mono:ital,wght@0,400;0,500;1,400&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,500;1,9..40,300&display=swap" rel="stylesheet" />
<style>
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --bg: #06070d;
    --bg2: #10111d;
    --bg3: #171926;
    --accent: ${colors.accent};
    --accent2: ${colors.accent2};
    --accent3: ${colors.accent3};
    --text: #f5f3ff;
    --muted: #a5a9c8;
    --border: rgba(124, 109, 250, 0.18);
    --card-bg: rgba(15, 18, 28, 0.82);
  }

  html { scroll-behavior: smooth; }

  body {
    background:
      radial-gradient(circle at top left, rgba(124, 109, 250, 0.22), transparent 28%),
      radial-gradient(circle at bottom right, rgba(250, 109, 124, 0.15), transparent 24%),
      var(--bg);
    color: var(--text);
    font-family: 'DM Sans', sans-serif;
    font-size: 16px;
    line-height: 1.7;
    overflow-x: hidden;
  }

  body::before {
    content: '';
    position: fixed;
    inset: 0;
    background-image:
      linear-gradient(rgba(124, 109, 250, 0.05) 1px, transparent 1px),
      linear-gradient(90deg, rgba(124, 109, 250, 0.05) 1px, transparent 1px);
    background-size: 54px 54px;
    mask-image: linear-gradient(to bottom, rgba(0,0,0,0.7), transparent 90%);
    pointer-events: none;
    z-index: 0;
  }

  body::after {
    content: '';
    position: fixed;
    inset: 0;
    background: radial-gradient(circle, rgba(255,255,255,0.05) 0%, transparent 60%);
    pointer-events: none;
    z-index: 0;
  }

  .scroll-progress {
    position: fixed;
    top: 0;
    left: 0;
    height: 3px;
    width: 0%;
    background: linear-gradient(90deg, var(--accent), var(--accent2), var(--accent3));
    z-index: 120;
    box-shadow: 0 0 24px rgba(124, 109, 250, 0.45);
  }

  .orb {
    position: fixed;
    border-radius: 50%;
    filter: blur(110px);
    pointer-events: none;
    z-index: 0;
    opacity: 0.28;
    animation: drift 14s ease-in-out infinite alternate;
  }
  .orb1 { width: 520px; height: 520px; background: var(--accent); top: -180px; left: -120px; animation-delay: 0s; }
  .orb2 { width: 440px; height: 440px; background: var(--accent2); bottom: 4%; right: -100px; animation-delay: -6s; }
  .orb3 { width: 340px; height: 340px; background: var(--accent3); top: 48%; left: 40%; animation-delay: -3s; }

  @keyframes drift {
    from { transform: translate(0, 0) scale(1); }
    to { transform: translate(32px, 20px) scale(1.08); }
  }

  nav {
    position: fixed;
    top: 0; left: 0; right: 0;
    z-index: 100;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem 4rem;
    backdrop-filter: blur(18px);
    background: rgba(7, 8, 12, 0.55);
    border-bottom: 1px solid rgba(255,255,255,0.04);
    transition: background 0.3s ease, border-color 0.3s ease;
  }
  nav.scrolled {
    background: rgba(7, 8, 12, 0.85);
    border-color: rgba(124, 109, 250, 0.2);
  }
  .nav-logo {
    font-family: 'Syne', sans-serif;
    font-weight: 800;
    font-size: 1.3rem;
    letter-spacing: -0.02em;
    color: var(--text);
    text-decoration: none;
  }
  .nav-logo span { color: var(--accent); }
  .nav-links { display: flex; gap: 1.7rem; list-style: none; }
  .nav-links a {
    color: var(--muted);
    text-decoration: none;
    font-size: 0.78rem;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    transition: color 0.2s ease;
    font-family: 'DM Mono', monospace;
    position: relative;
  }
  .nav-links a::after {
    content: '';
    position: absolute;
    left: 0; bottom: -0.35rem;
    width: 0; height: 1px;
    background: linear-gradient(90deg, var(--accent), var(--accent2));
    transition: width 0.25s ease;
  }
  .nav-links a:hover,
  .nav-links a.active { color: var(--text); }
  .nav-links a:hover::after,
  .nav-links a.active::after { width: 100%; }

  section { position: relative; z-index: 1; }

  #hero {
    min-height: 100vh;
    display: flex;
    align-items: center;
    padding: 8.5rem 4rem 4rem;
    max-width: 1200px;
    margin: 0 auto;
  }
  .hero-row {
    display: grid;
    grid-template-columns: 1.1fr 0.9fr;
    align-items: center;
    gap: 3rem;
    width: 100%;
  }
  .hero-row.full-width {
    grid-template-columns: 1fr;
    text-align: center;
  }
  .hero-row.full-width .hero-content {
    margin: 0 auto;
  }
  .hero-row.full-width .hero-cta {
    justify-content: center;
  }
  .hero-content { max-width: 640px; }
  .hero-badge {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    background: rgba(124, 109, 250, 0.12);
    border: 1px solid rgba(124, 109, 250, 0.3);
    border-radius: 999px;
    padding: 0.6rem 1rem;
    font-family: 'DM Mono', monospace;
    font-size: 0.74rem;
    color: var(--accent);
    margin-bottom: 1.5rem;
    letter-spacing: 0.06em;
    animation: fadeUp 0.7s ease both;
  }
  .hero-badge::before {
    content: '';
    width: 7px; height: 7px;
    border-radius: 50%;
    background: var(--accent3);
    animation: pulse 2s ease-in-out infinite;
  }
  @keyframes pulse {
    0%, 100% { opacity: 1; transform: scale(1); }
    50% { opacity: 0.5; transform: scale(1.3); }
  }
  h1.hero-name {
    font-family: 'Syne', sans-serif;
    font-weight: 800;
    font-size: clamp(3.5rem, 8vw, 6.8rem);
    line-height: 0.95;
    letter-spacing: -0.04em;
    margin-bottom: 0.8rem;
    animation: fadeUp 0.7s 0.08s ease both;
  }
  h1.hero-name span {
    background: linear-gradient(135deg, var(--accent), var(--accent2));
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }
  .hero-title {
    font-family: 'DM Mono', monospace;
    font-size: 1rem;
    color: var(--accent3);
    margin-bottom: 1rem;
    animation: fadeUp 0.7s 0.16s ease both;
  }
  .hero-desc {
    font-size: 1.04rem;
    color: var(--muted);
    max-width: 590px;
    margin-bottom: 2rem;
    line-height: 1.8;
    animation: fadeUp 0.7s 0.24s ease both;
  }
  .hero-cta {
    display: flex; gap: 1rem; flex-wrap: wrap;
    animation: fadeUp 0.7s 0.32s ease both;
  }
  .btn {
    display: inline-flex;
    align-items: center; gap: 8px;
    padding: 0.82rem 1.8rem;
    border-radius: 999px;
    font-size: 0.9rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.25s ease;
    text-decoration: none;
    font-family: 'DM Sans', sans-serif;
  }
  .btn-primary {
    background: linear-gradient(135deg, var(--accent), #6358d4);
    color: #fff;
    border: none;
    box-shadow: 0 12px 30px rgba(124, 109, 250, 0.24);
  }
  .btn-primary:hover { transform: translateY(-2px); box-shadow: 0 16px 36px rgba(124, 109, 250, 0.3); }
  .btn-ghost {
    background: rgba(255,255,255,0.02);
    color: var(--text);
    border: 1px solid var(--border);
  }
  .btn-ghost:hover { border-color: var(--accent); color: var(--accent); transform: translateY(-2px); }
  
  .hero-highlights {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 0.9rem;
    margin-top: 1.7rem;
    animation: fadeUp 0.7s 0.4s ease both;
  }
  .hero-highlight-card {
    padding: 0.95rem 1rem;
    border-radius: 16px;
    background: rgba(255,255,255,0.03);
    border: 1px solid rgba(255,255,255,0.06);
    backdrop-filter: blur(8px);
  }
  .hero-highlight-card strong {
    display: block;
    font-size: 1rem;
    margin-bottom: 0.2rem;
    color: var(--text);
  }
  .hero-highlight-card span {
    color: var(--muted);
    font-size: 0.78rem;
  }
  .hero-visual {
    position: relative;
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 460px;
    transform-style: preserve-3d;
    animation: floatCard 6s ease-in-out infinite;
  }
  .hero-visual-frame {
    position: relative;
    width: min(360px, 100%);
    border-radius: 28px;
    padding: 0.8rem;
    background: linear-gradient(145deg, rgba(124, 109, 250, 0.3), rgba(250, 109, 124, 0.16));
    box-shadow: 0 35px 90px rgba(0, 0, 0, 0.35);
    transform: perspective(1200px) rotateX(var(--rotate-x, 0deg)) rotateY(var(--rotate-y, 0deg));
    transition: transform 0.2s ease-out;
  }
  .hero-visual-frame::before {
    content: '';
    position: absolute;
    inset: 8px;
    border-radius: 22px;
    border: 1px solid rgba(255,255,255,0.14);
    pointer-events: none;
  }
  .hero-visual img {
    width: 100%;
    aspect-ratio: 1 / 1;
    object-fit: cover;
    border-radius: 22px;
    display: block;
  }
  .hero-floating-card {
    position: absolute;
    padding: 0.9rem 1rem;
    border-radius: 16px;
    background: rgba(7, 8, 12, 0.8);
    border: 1px solid rgba(255,255,255,0.08);
    box-shadow: 0 18px 40px rgba(0,0,0,0.25);
    backdrop-filter: blur(12px);
    min-width: 160px;
  }
  .hero-floating-card span {
    display: block;
    color: var(--muted);
    font-size: 0.72rem;
    text-transform: uppercase;
    letter-spacing: 0.12em;
    margin-bottom: 0.25rem;
  }
  .hero-floating-card strong {
    font-size: 0.95rem;
    color: var(--text);
  }
  .hero-floating-card.card-one { top: 8%; right: -3%; }
  .hero-floating-card.card-two { bottom: 10%; left: -2%; }
  
  @keyframes floatCard {
    0%, 100% { transform: translateY(0px); }
    50% { transform: translateY(-12px); }
  }

  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(24px); }
    to { opacity: 1; transform: translateY(0); }
  }

  .container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 6rem 4rem;
  }
  .section-label {
    font-family: 'DM Mono', monospace;
    font-size: 0.72rem;
    letter-spacing: 0.15em;
    text-transform: uppercase;
    color: var(--accent);
    margin-bottom: 0.75rem;
    display: flex;
    align-items: center;
    gap: 10px;
  }
  .section-label::after {
    content: '';
    flex: 1;
    max-width: 60px;
    height: 1px;
    background: var(--accent);
    opacity: 0.4;
  }
  .section-title {
    font-family: 'Syne', sans-serif;
    font-size: clamp(2rem, 4vw, 3rem);
    font-weight: 700;
    letter-spacing: -0.03em;
    margin-bottom: 0.8rem;
    line-height: 1.1;
  }

  .section-intro {
    max-width: 680px;
    color: var(--muted);
    font-size: 0.98rem;
    margin-bottom: 2.2rem;
    line-height: 1.8;
  }

  .section-shell {
    position: relative;
    padding: 2.2rem;
    border-radius: 28px;
    border: 1px solid rgba(255,255,255,0.06);
    background: linear-gradient(135deg, rgba(255,255,255,0.03), rgba(124, 109, 250, 0.04));
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.18);
    overflow: hidden;
  }

  .section-shell::before {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.06), transparent);
    transform: translateX(-100%);
    animation: sectionSweep 9s linear infinite;
    pointer-events: none;
  }

  @keyframes sectionSweep {
    0% { transform: translateX(-100%); }
    100% { transform: translateX(100%); }
  }

  #skills { background: transparent; }
  .skills-wheel {
    --wheel-radius: 260px;
    --wheel-rotation: 0deg;
    position: relative;
    width: min(720px, 100%);
    aspect-ratio: 1 / 1;
    margin: 0 auto;
    padding: 2rem;
    transform: rotate(var(--wheel-rotation));
    transform-origin: center;
    will-change: transform;
  }
  .skills-wheel .skill-pill {
    position: absolute;
    width: 120px;
    height: 120px;
    border-radius: 50%;
    padding: 1rem;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 0.75rem;
    text-align: center;
    transition: transform 0.25s ease, border-color 0.25s ease, background 0.25s ease;
  }
  .skills-wheel .skill-pill:hover {
    transform: scale(1.08);
    border-color: var(--accent);
    color: var(--text);
    background: rgba(124, 109, 250, 0.08);
  }
  .skill-pill {
    font-size: 0.82rem;
    color: var(--muted);
    background: var(--card-bg);
    border: 1px solid var(--border);
    cursor: default;
    backdrop-filter: blur(12px);
    box-shadow: inset 0 1px 0 rgba(255,255,255,0.04);
  }
  .skill-icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 46px;
    height: 46px;
    border-radius: 50%;
    background: rgba(250,109,124,0.12);
    color: var(--accent2);
    font-size: 1.3rem;
    line-height: 1;
    box-shadow: inset 0 0 0 1px rgba(250,109,124,0.18);
  }

  .timeline {
    display: grid;
    gap: 1rem;
  }
  .timeline-item {
    position: relative;
    padding: 1.4rem 1.6rem;
    border-radius: 18px;
    background: var(--card-bg);
    border: 1px solid var(--border);
    backdrop-filter: blur(10px);
  }
  .timeline-item::before {
    content: '';
    position: absolute;
    left: -0.8rem; top: 1.5rem;
    width: 0.85rem; height: 0.85rem;
    border-radius: 50%;
    background: linear-gradient(135deg, var(--accent), var(--accent2));
    box-shadow: 0 0 0 6px rgba(124, 109, 250, 0.12);
  }
  .timeline-period {
    font-family: 'DM Mono', monospace;
    font-size: 0.75rem;
    color: var(--accent3);
    margin-bottom: 0.3rem;
    letter-spacing: 0.05em;
  }
  .timeline-role {
    font-family: 'Syne', sans-serif;
    font-size: 1.16rem;
    font-weight: 700;
    margin-bottom: 0.2rem;
  }
  .timeline-company {
    color: var(--muted);
    font-size: 0.9rem;
    margin-bottom: 0.8rem;
  }
  .tech-tags { display: flex; flex-wrap: wrap; gap: 8px; }
  .tag {
    background: rgba(124,109,250,0.1);
    border: 1px solid rgba(124,109,250,0.2);
    border-radius: 999px;
    padding: 3px 12px;
    font-size: 0.74rem;
    color: var(--accent);
    font-family: 'DM Mono', monospace;
  }

  .projects-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 1.5rem;
  }
  .project-card {
    background: var(--card-bg);
    border: 1px solid var(--border);
    border-radius: 20px;
    padding: 1.8rem;
    backdrop-filter: blur(10px);
    transition: all 0.3s ease;
    position: relative;
    overflow: hidden;
  }
  .project-card::before {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(135deg, rgba(124,109,250,0.12), transparent 40%, rgba(250,109,124,0.08));
    opacity: 0;
    transition: opacity 0.3s ease;
    pointer-events: none;
  }
  .project-card:hover { transform: translateY(-6px); border-color: rgba(124,109,250,0.4); }
  .project-card:hover::before { opacity: 1; }
  .project-num {
    font-family: 'DM Mono', monospace;
    font-size: 0.7rem;
    color: var(--accent);
    opacity: 0.5;
    margin-bottom: 1rem;
    letter-spacing: 0.1em;
  }
  .project-title {
    font-family: 'Syne', sans-serif;
    font-size: 1.15rem;
    font-weight: 700;
    margin-bottom: 0.8rem;
  }
  .project-tech { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 1.2rem; }
  .project-tech .tag {
    background: rgba(109,250,192,0.07);
    border-color: rgba(109,250,192,0.2);
    color: var(--accent3);
  }

  .edu-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 1.5rem;
  }
  .edu-card {
    background: var(--card-bg);
    border: 1px solid var(--border);
    border-radius: 20px;
    padding: 1.8rem;
    backdrop-filter: blur(10px);
    transition: all 0.3s ease;
  }
  .edu-card:hover { border-color: rgba(250,109,124,0.4); transform: translateY(-4px); }
  .edu-degree {
    font-family: 'Syne', sans-serif;
    font-size: 1rem;
    font-weight: 700;
    margin-bottom: 0.4rem;
  }
  .edu-school { color: var(--muted); font-size: 0.88rem; margin-bottom: 0.4rem; }
  .edu-meta {
    font-family: 'DM Mono', monospace;
    font-size: 0.75rem;
    color: var(--accent2);
    margin-bottom: 0.6rem;
    letter-spacing: 0.05em;
  }
  .edu-score {
    display: inline-block;
    background: rgba(250,109,124,0.1);
    border: 1px solid rgba(250,109,124,0.2);
    border-radius: 999px;
    padding: 3px 12px;
    font-size: 0.8rem;
    color: var(--accent2);
    font-family: 'DM Mono', monospace;
  }

  .cert-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 1.2rem;
  }
  .cert-card {
    background: var(--card-bg);
    border: 1px solid var(--border);
    border-radius: 16px;
    padding: 1.4rem 1.6rem;
    backdrop-filter: blur(10px);
    display: flex;
    align-items: center;
    gap: 1rem;
    transition: all 0.3s ease;
  }
  .cert-card:hover { border-color: rgba(109,250,192,0.4); transform: translateX(4px); }
  .cert-icon {
    width: 44px; height: 44px;
    border-radius: 12px;
    background: rgba(109,250,192,0.1);
    border: 1px solid rgba(109,250,192,0.2);
    display: flex; align-items: center; justify-content: center;
    font-size: 1.2rem;
    flex-shrink: 0;
  }
  .cert-name { font-size: 0.95rem; font-weight: 500; margin-bottom: 0.2rem; }
  .cert-meta { font-size: 0.78rem; color: var(--muted); font-family: 'DM Mono', monospace; }

  #contact { background: transparent; }
  .contact-box {
    background: var(--card-bg);
    border: 1px solid var(--border);
    border-radius: 28px;
    padding: 4rem;
    text-align: center;
    backdrop-filter: blur(20px);
    position: relative;
    overflow: hidden;
  }
  .contact-box::before {
    content: '';
    position: absolute;
    inset: -1px;
    border-radius: 28px;
    background: linear-gradient(135deg, rgba(124,109,250,0.3), rgba(250,109,124,0.15), rgba(109,250,192,0.2));
    z-index: -1;
  }
  .contact-title {
    font-family: 'Syne', sans-serif;
    font-size: clamp(2rem, 4vw, 3rem);
    font-weight: 700;
    margin-bottom: 1rem;
  }
  .contact-desc { color: var(--muted); margin-bottom: 2rem; max-width: 480px; margin-left: auto; margin-right: auto; }
  .contact-info {
    display: flex;
    gap: 1.5rem;
    justify-content: center;
    flex-wrap: wrap;
    margin-top: 2rem;
  }
  .contact-link {
    display: flex;
    align-items: center;
    gap: 8px;
    color: var(--muted);
    text-decoration: none;
    font-size: 0.9rem;
    transition: color 0.2s;
    font-family: 'DM Mono', monospace;
  }
  .contact-link:hover { color: var(--text); }


  footer {
    text-align: center;
    padding: 2rem;
    color: var(--muted);
    font-size: 0.8rem;
    font-family: 'DM Mono', monospace;
    position: relative; z-index: 1;
    border-top: 1px solid var(--border);
  }

  .reveal {
    opacity: 0;
    transform: translateY(30px);
    transition: opacity 0.7s ease, transform 0.7s ease;
  }
  .reveal.visible {
    opacity: 1;
    transform: translateY(0);
  }

  /* LeetCode stats grid and card styling */
  .leetcode-stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
    gap: 1.5rem;
    margin-top: 2rem;
  }
  .leetcode-stat-card {
    background: rgba(255, 255, 255, 0.01);
    border: 1px solid var(--border);
    border-radius: 12px;
    padding: 2.5rem;
    text-align: center;
    transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
    position: relative;
    overflow: hidden;
  }
  .leetcode-stat-card::before {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0;
    height: 3px;
    transition: opacity 0.3s;
  }
  .leetcode-stat-card.total::before { background: var(--accent); }
  .leetcode-stat-card.easy::before { background: #10b981; }
  .leetcode-stat-card.medium::before { background: #f59e0b; }
  .leetcode-stat-card.hard::before { background: #ef4444; }

  .leetcode-stat-card:hover {
    transform: translateY(-4px);
    border-color: var(--accent);
    background: rgba(255, 255, 255, 0.02);
    box-shadow: 0 15px 30px rgba(0, 0, 0, 0.2);
  }
  .leetcode-stat-card .stat-num {
    font-family: 'Syne', sans-serif;
    font-size: 2.8rem;
    font-weight: 700;
    margin-bottom: 0.5rem;
  }
  .leetcode-stat-card.total .stat-num { color: var(--accent); }
  .leetcode-stat-card.easy .stat-num { color: #10b981; }
  .leetcode-stat-card.medium .stat-num { color: #f59e0b; }
  .leetcode-stat-card.hard .stat-num { color: #ef4444; }
  
  .leetcode-stat-card .stat-label {
    font-family: 'DM Mono', monospace;
    font-size: 0.8rem;
    color: var(--muted);
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  /* Project Filtering Bar */
  .filter-bar {
    display: flex;
    flex-wrap: wrap;
    gap: 0.6rem;
    margin-bottom: 2.5rem;
    justify-content: center;
  }
  .filter-btn {
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid var(--border);
    color: var(--muted);
    border-radius: 100px;
    padding: 0.4rem 1.2rem;
    font-size: 0.82rem;
    font-family: 'DM Mono', monospace;
    cursor: pointer;
    transition: all 0.25s ease;
  }
  .filter-btn:hover, .filter-btn.active {
    background: var(--accent);
    color: #fff;
    border-color: var(--accent);
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(124, 109, 250, 0.2);
  }
  
  .project-card.filtered-out {
    opacity: 0.15;
    pointer-events: none;
    transform: scale(0.95);
  }

  /* Theme Switcher Widget */
  .theme-switcher {
    position: fixed;
    bottom: 2rem;
    right: 2rem;
    background: rgba(255, 255, 255, 0.85);
    border: 1px solid var(--border);
    border-radius: 100px;
    padding: 0.5rem 0.8rem;
    display: flex;
    align-items: center;
    gap: 0.6rem;
    z-index: 1000;
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    box-shadow: 0 10px 30px rgba(17, 17, 17, 0.08);
    transition: transform 0.3s ease;
  }
  .theme-switcher:hover {
    transform: scale(1.05);
  }
  .theme-switcher-label {
    font-family: 'DM Mono', monospace;
    font-size: 0.7rem;
    color: #06070d;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }
  .theme-btn {
    width: 20px;
    height: 20px;
    border-radius: 50%;
    border: 2px solid transparent;
    background: var(--btn-color);
    cursor: pointer;
    transition: transform 0.2s, border-color 0.2s;
  }
  .theme-btn:hover {
    transform: scale(1.2);
  }
  .theme-btn.active {
    border-color: #fff;
    transform: scale(1.1);
  }

  @media (max-width: 900px) {
    .hero-row { grid-template-columns: 1fr; }
    .hero-content { max-width: 100%; }
    .hero-visual { min-height: 390px; margin-top: 1rem; }
    .hero-highlights { grid-template-columns: repeat(3, minmax(0, 1fr)); }
    .skills-wheel { --wheel-radius: 220px; width: min(640px, 100%); }
    .skills-wheel .skill-pill { width: 110px; height: 110px; }
  }

  @media (max-width: 768px) {
    nav { padding: 1rem 1.5rem; }
    .nav-links { gap: 1rem; }
    .nav-links a { font-size: 0.72rem; }
    #hero { padding: 7rem 1.5rem 3rem; }
    .hero-cta { justify-content: center; }
    .hero-highlights { grid-template-columns: 1fr; }
    .hero-visual { min-height: 320px; }
    .hero-floating-card { display: none; }
    .container { padding: 4rem 1.5rem; }
    .contact-box { padding: 2.5rem 1.5rem; }
    .skills-wheel { --wheel-radius: 180px; width: min(560px, 100%); padding: 1.5rem; }
    .skills-wheel .skill-pill { width: 100px; height: 100px; }
  }

  @media (max-width: 540px) {
    .skills-wheel { --wheel-radius: 140px; width: min(480px, 100%); padding: 1rem; }
    .skills-wheel .skill-pill { width: 90px; height: 90px; }
  }

  @media (max-width: 420px) {
    .skills-wheel { --wheel-radius: 110px; width: min(380px, 100%); padding: 0.75rem; }
    .skills-wheel .skill-pill { width: 80px; height: 80px; }
  }

  @media (prefers-reduced-motion: reduce) {
    *, *::before, *::after { animation-duration: 0.01ms !important; animation-iteration-count: 1 !important; transition-duration: 0.01ms !important; scroll-behavior: auto !important; }
  }
</style>
</head>
<body>
<div class="scroll-progress"></div>

<div class="orb orb1"></div>
<div class="orb orb2"></div>
<div class="orb orb3"></div>

<!-- NAV -->
<nav>
  <a class="nav-logo" href="#hero">${escapeHtml(name)}'s Portfolio<span></span></a>
  <ul class="nav-links">
    <li><a href="#skills">Skills</a></li>
    ${options.includeLeetcode ? '<li><a href="#achievements">LeetCode</a></li>' : ''}
    ${experience.length ? '<li><a href="#experience">Experience</a></li>' : ''}
    ${projects.length ? '<li><a href="#projects">Projects</a></li>' : ''}
    ${education.length || certifications.length ? '<li><a href="#education">Education</a></li>' : ''}
    <li><a href="#contact">Contact</a></li>
  </ul>
</nav>

<!-- HERO -->
<div id="hero">
  <div class="hero-row ${hasImage ? '' : 'full-width'}">
    <div class="hero-content">
      <div class="hero-badge">Available for opportunities</div>
      <h1 class="hero-name">${escapeHtml(name)}<span>.</span></h1>
      <p class="hero-title">${escapeHtml(profession)}</p>
      <p class="hero-desc">
        ${escapeHtml(bio)}
      </p>
      <div class="hero-cta">
        ${projects.length ? '<a href="#projects" class="btn btn-primary">View Projects ↓</a>' : ''}
        <a href="#contact" class="btn btn-ghost">Get in Touch</a>
      </div>
      <div class="hero-highlights">
        <div class="hero-highlight-card">
          <strong>${projects.length}+</strong>
          <span>Projects shipped</span>
        </div>
        <div class="hero-highlight-card">
          <strong>100%</strong>
          <span>Focus on clean UX</span>
        </div>
        <div class="hero-highlight-card">
          <strong>${skills.length}+</strong>
          <span>Tech stack skills</span>
        </div>
      </div>
    </div>
    ${hasImage ? `
    <div class="hero-visual reveal">
      <div class="hero-visual-frame">
        <img src="${avatar}" alt="${escapeHtml(name)} profile" />
        <div class="hero-floating-card card-one">
          <span>Role</span>
          <strong>Developer</strong>
        </div>
        <div class="hero-floating-card card-two">
          <span>Status</span>
          <strong>Active</strong>
        </div>
      </div>
    </div>
    ` : ''}
  </div>
</div>

<!-- SKILLS -->
<section id="skills">
  <div class="container section-shell">
    <div class="section-label reveal">Skills</div>
    <h2 class="section-title reveal">Tech Stack</h2>
    <p class="section-intro reveal">A practical toolkit for turning ideas into responsive interfaces, reliable APIs, and polished product experiences.</p>
    <div class="skills-wheel">
      ${skillPillsHtml}
    </div>
  </div>
</section>

<!-- ACHIEVEMENTS -->
${options.includeLeetcode ? `
<section id="achievements">
  <div class="container section-shell">
    <div class="section-label reveal">Achievements</div>
    <h2 class="section-title reveal">LeetCode Stats</h2>
    <p class="section-intro reveal">Problem-solving consistency tracked live on LeetCode database.</p>
    <div class="leetcode-stats-grid reveal">
      <div class="leetcode-stat-card total">
        <div class="stat-num">${data.leetcode.totalSolved}</div>
        <div class="stat-label">Total Solved</div>
      </div>
      <div class="leetcode-stat-card easy">
        <div class="stat-num">${data.leetcode.easy.solved}</div>
        <div class="stat-label">Easy Solved</div>
      </div>
      <div class="leetcode-stat-card medium">
        <div class="stat-num">${data.leetcode.medium.solved}</div>
        <div class="stat-label">Medium Solved</div>
      </div>
      <div class="leetcode-stat-card hard">
        <div class="stat-num">${data.leetcode.hard.solved}</div>
        <div class="stat-label">Hard Solved</div>
      </div>
    </div>
  </div>
</section>
` : ''}

<!-- EXPERIENCE -->
${experience.length ? `
<section id="experience">
  <div class="container section-shell">
    <div class="section-label reveal">Experience</div>
    <h2 class="section-title reveal">Work History</h2>
    <p class="section-intro reveal">Focused internships and professional history in modern software engineering.</p>
    <div class="timeline">
      ${timelineItemsHtml}
    </div>
  </div>
</section>
` : ''}

<!-- PROJECTS -->
${projects.length ? `
<section id="projects">
  <div class="container section-shell">
    <div class="section-label reveal">Projects</div>
    <h2 class="section-title reveal">What I've Built</h2>
    <p class="section-intro reveal">Selected work that blends product thinking with hands-on implementation across modern web applications.</p>
    ${filterButtonsHtml}
    <div class="projects-grid">
      ${projectCardsHtml}
    </div>
  </div>
</section>
` : ''}

<!-- EDUCATION -->
${education.length || certifications.length ? `
<section id="education">
  <div class="container section-shell">
    ${education.length ? `
    <div class="section-label reveal">Education</div>
    <h2 class="section-title reveal">Academic Background</h2>
    <p class="section-intro reveal">Academic achievements and foundational system structures.</p>
    <div class="edu-grid" style="margin-bottom: 4rem;">
      ${educationCardsHtml}
    </div>
    ` : ''}
    
    ${certifications.length ? `
    <div>
      <div class="section-label reveal" style="margin-bottom: 1.5rem;">Certifications</div>
      <div class="cert-grid">
        ${certificationsCardsHtml}
      </div>
    </div>
    ` : ''}
  </div>
</section>
` : ''}

<!-- CONTACT -->
<section id="contact">
  <div class="container">
    <div class="contact-box reveal">
      <div class="section-label" style="justify-content:center; margin-bottom:1rem;">Contact</div>
      <div class="contact-title">Let's Connect</div>
      <p class="contact-desc">Have a project, opportunity, or just want to chat? Say hello directly via the links below.</p>

      <div class="contact-info">
        ${email ? `<a href="mailto:${escapeHtml(email)}" class="contact-link">✉ ${escapeHtml(email)}</a>` : ''}
        ${phone ? `<span class="contact-link">📞 ${escapeHtml(phone)}</span>` : ''}
        ${location ? `<span class="contact-link">📍 ${escapeHtml(location)}</span>` : ''}
        ${githubLink ? `<a href="${escapeHtml(githubLink)}" target="_blank" rel="noopener noreferrer" class="contact-link">GitHub</a>` : ''}
        ${linkedinLink ? `<a href="${escapeHtml(linkedinLink)}" target="_blank" rel="noopener noreferrer" class="contact-link">LinkedIn</a>` : ''}
        ${portfolioLink ? `<a href="${escapeHtml(portfolioLink)}" target="_blank" rel="noopener noreferrer" class="contact-link">Portfolio</a>` : ''}
      </div>
    </div>
  </div>
</section>

<!-- THEME SWITCHER -->
<div class="theme-switcher">
  <span class="theme-switcher-label">Theme</span>
  <button class="theme-btn ${themeIndex === 0 ? 'active' : ''}" data-theme="0" style="--btn-color: #eb4d6d" title="Rose Pink"></button>
  <button class="theme-btn ${themeIndex === 1 ? 'active' : ''}" data-theme="1" style="--btn-color: #00a8cc" title="Classic Cyan"></button>
  <button class="theme-btn ${themeIndex === 2 ? 'active' : ''}" data-theme="2" style="--btn-color: #d97706" title="Amber Gold"></button>
  <button class="theme-btn ${themeIndex === 3 ? 'active' : ''}" data-theme="3" style="--btn-color: #7c3aed" title="Electric Violet"></button>
</div>

<footer>
  <p>Designed & Developed by ${escapeHtml(name)} &nbsp;·&nbsp; ${escapeHtml(profession)} &nbsp;·&nbsp; ${new Date(data.generatedAt).getFullYear()}</p>
</footer>



<script>
  function initScrollProgress() {
    const progressBar = document.querySelector('.scroll-progress');
    if (!progressBar) return;

    const updateProgress = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
      progressBar.style.width = \`\${Math.min(100, Math.max(0, progress))}%\`;
    };

    window.addEventListener('scroll', updateProgress, { passive: true });
    window.addEventListener('resize', updateProgress);
    updateProgress();
  }

  function initRevealObserver() {
    const reveals = document.querySelectorAll('.reveal');
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry, i) => {
        if (entry.isIntersecting) {
          setTimeout(() => entry.target.classList.add('visible'), i * 60);
        } else {
          entry.target.classList.remove('visible');
        }
      });
    }, { threshold: 0.1 });
    reveals.forEach(el => observer.observe(el));
  }

  function initSkillsWheel() {
    const skillsSection = document.getElementById('skills');
    const wheel = skillsSection?.querySelector('.skills-wheel');

    if (!wheel || !skillsSection) return;

    const updateRotation = () => {
      const sectionTop = skillsSection.offsetTop;
      const sectionHeight = skillsSection.offsetHeight;
      const start = sectionTop - window.innerHeight * 0.7;
      const end = sectionTop + sectionHeight - window.innerHeight * 0.2;
      const progress = Math.max(0, Math.min(1, (window.scrollY - start) / (end - start || 1)));
      wheel.style.setProperty('--wheel-rotation', \`\${progress * 360}deg\`);
    };

    window.addEventListener('scroll', updateRotation, { passive: true });
    window.addEventListener('resize', updateRotation);
    updateRotation();
  }

  function initNavigation() {
    const nav = document.querySelector('nav');
    const links = document.querySelectorAll('.nav-links a');
    const sections = Array.from(document.querySelectorAll('section[id], #hero'));

    const setActiveLink = () => {
      const scrollPosition = window.scrollY + 140;
      let currentId = '#hero';

      sections.forEach((section) => {
        const id = \`#\${section.id}\`;
        if (section.offsetTop <= scrollPosition) {
          currentId = id;
        }
      });

      links.forEach((link) => {
        const isActive = link.getAttribute('href') === currentId;
        link.classList.toggle('active', isActive);
      });
    };

    const handleScroll = () => {
      nav?.classList.toggle('scrolled', window.scrollY > 20);
      setActiveLink();
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
  }

  function initHeroTilt() {
    const visual = document.querySelector('.hero-visual-frame');
    if (!visual) return;

    const resetTilt = () => {
      visual.style.setProperty('--rotate-x', '0deg');
      visual.style.setProperty('--rotate-y', '0deg');
    };

    visual.addEventListener('pointermove', (event) => {
      const bounds = visual.getBoundingClientRect();
      const x = (event.clientX - bounds.left) / bounds.width - 0.5;
      const y = (event.clientY - bounds.top) / bounds.height - 0.5;

      visual.style.setProperty('--rotate-y', \`\${x * 8}deg\`);
      visual.style.setProperty('--rotate-x', \`\${y * -8}deg\`);
    });

    visual.addEventListener('pointerleave', resetTilt);
  }



  function initThemeSwitcher() {
    const themes = {
      0: { accent: '#eb4d6d', accent2: '#fa6d7c', accent3: '#4debbe' },
      1: { accent: '#00a8cc', accent2: '#005f73', accent3: '#0a9396' },
      2: { accent: '#d97706', accent2: '#b45309', accent3: '#ca8a04' },
      3: { accent: '#7c3aed', accent2: '#6d28d9', accent3: '#8b5cf6' }
    };
    const root = document.documentElement;
    const buttons = document.querySelectorAll('.theme-btn');
    buttons.forEach(btn => {
      btn.addEventListener('click', () => {
        const themeId = btn.getAttribute('data-theme');
        const theme = themes[themeId];
        if (theme) {
          root.style.setProperty('--accent', theme.accent);
          root.style.setProperty('--accent2', theme.accent2);
          root.style.setProperty('--accent3', theme.accent3);
          
          buttons.forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
        }
      });
    });
  }

  function initProjectFilters() {
    const filterBar = document.querySelector('.filter-bar');
    if (!filterBar) return;
    const buttons = filterBar.querySelectorAll('.filter-btn');
    const cards = document.querySelectorAll('.project-card');

    buttons.forEach(btn => {
      btn.addEventListener('click', () => {
        const filter = btn.getAttribute('data-filter');
        
        buttons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        cards.forEach(card => {
          if (filter === 'all') {
            card.classList.remove('filtered-out');
          } else {
            const techs = (card.getAttribute('data-tech') || '').split(',');
            if (techs.includes(filter)) {
              card.classList.remove('filtered-out');
            } else {
              card.classList.add('filtered-out');
            }
          }
        });
      });
    });
  }

  window.addEventListener('DOMContentLoaded', () => {
    initScrollProgress();
    initRevealObserver();
    initSkillsWheel();
    initNavigation();
    initHeroTilt();
    initThemeSwitcher();
    initProjectFilters();


  });
</script>
</body>
</html>`;
  }
}

function getThemeIndex(userId: string, count: number): number {
  let hash = 0;
  for (let i = 0; i < userId.length; i++) {
    hash = userId.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash) % count;
}

function escapeHtml(str: string): string {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function getThemeColors(themeIndex: number) {
  switch (themeIndex) {
    case 0: // Rose Pink
      return {
        accent: '#eb4d6d',
        accent2: '#fa6d7c',
        accent3: '#4debbe',
      };
    case 1: // Classic Cyan
      return {
        accent: '#00a8cc',
        accent2: '#005f73',
        accent3: '#0a9396',
      };
    case 2: // Amber Gold
      return {
        accent: '#d97706',
        accent2: '#b45309',
        accent3: '#ca8a04',
      };
    case 3: // Electric Violet
      return {
        accent: '#7c3aed',
        accent2: '#6d28d9',
        accent3: '#8b5cf6',
      };
    default:
      return {
        accent: '#eb4d6d',
        accent2: '#fa6d7c',
        accent3: '#4debbe',
      };
  }
}

function getSkillEmoji(skill: string): string {
  const s = skill.toLowerCase();
  if (s.includes('react')) return '⚛️';
  if (s.includes('next')) return '▲';
  if (s.includes('node')) return '🟢';
  if (s.includes('mongo')) return '🍃';
  if (s.includes('express')) return '🚂';
  if (s.includes('python')) return '🐍';
  if (s.includes('java') && !s.includes('script')) return '☕';
  if (s.includes('javascript') || s === 'js') return '🟨';
  if (s.includes('typescript') || s === 'ts') return '🔷';
  if (s.includes('html')) return '🌐';
  if (s.includes('css')) return '🎨';
  if (s.includes('git')) return '🔧';
  if (s.includes('django')) return '🤖';
  if (s.includes('spring')) return '🌱';
  return '💻';
}
