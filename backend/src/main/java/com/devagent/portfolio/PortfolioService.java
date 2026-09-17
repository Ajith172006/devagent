package com.devagent.portfolio;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.devagent.github.GithubService;
import com.devagent.goals.GoalsService;
import com.devagent.leetcode.LeetcodeService;
import com.devagent.snippets.Snippet;
import com.devagent.snippets.SnippetsService;
import com.devagent.users.User;
import com.devagent.users.UsersService;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.*;

@Service
public class PortfolioService {

    private final SnippetsService snippetsService;
    private final LeetcodeService leetcodeService;
    private final GoalsService goalsService;
    private final GithubService githubService;
    private final UsersService usersService;
    private final ObjectMapper mapper = new ObjectMapper();

    public PortfolioService(SnippetsService snippetsService, LeetcodeService leetcodeService,
                            GoalsService goalsService, GithubService githubService,
                            UsersService usersService) {
        this.snippetsService = snippetsService;
        this.leetcodeService = leetcodeService;
        this.goalsService = goalsService;
        this.githubService = githubService;
        this.usersService = usersService;
    }

    @SuppressWarnings("unchecked")
    public Map<String, Object> generate(String userId, String githubUsername) {
        List<Snippet> snippets = snippetsService.findAll(userId, null, null, null);
        Map<String, Object> leetcode = leetcodeService.stats(userId);
        Map<String, Object> streak = goalsService.getStreak(userId);

        Map<String, Object> github = null;
        if (githubUsername != null && !githubUsername.isBlank()) {
            try { github = githubService.getSummary(githubUsername); }
            catch (Exception ignored) {}
        }

        Map<String, Object> userData = null;
        Object resumeAnalysisData = null;
        try {
            User user = usersService.findOne(userId);
            if (user != null) {
                userData = new LinkedHashMap<>();
                userData.put("name", user.getName());
                userData.put("profession", user.getProfession());
                userData.put("photoUrl", user.getPhotoUrl());
                userData.put("email", user.getEmail());

                if (user.getResumeAnalysis() != null && !user.getResumeAnalysis().isBlank()) {
                    try {
                        resumeAnalysisData = mapper.readValue(user.getResumeAnalysis(), Map.class);
                    } catch (Exception ignored) {}
                }
            }
        } catch (Exception ignored) {}

        List<Map<String, Object>> featuredSnippets = snippets.stream().limit(8)
                .map(s -> {
                    Map<String, Object> m = new LinkedHashMap<>();
                    m.put("title", s.getTitle());
                    m.put("language", s.getLanguage());
                    m.put("description", s.getDescription());
                    m.put("tags", s.getTags());
                    return m;
                }).toList();

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("generatedAt", Instant.now().toString());
        result.put("user", userData);
        result.put("resumeAnalysis", resumeAnalysisData);
        result.put("github", github);
        result.put("leetcode", leetcode);
        result.put("streak", streak);
        result.put("featuredSnippets", featuredSnippets);
        return result;
    }

    @SuppressWarnings("unchecked")
    public String generateHtml(String userId, String githubUsername,
                                String displayName, boolean includeLeetcode) {
        Map<String, Object> data = generate(userId, githubUsername);
        Map<String, Object> userMap = (Map<String, Object>) data.get("user");
        Map<String, Object> resumeAnalysis = (Map<String, Object>) data.get("resumeAnalysis");
        Map<String, Object> github = (Map<String, Object>) data.get("github");
        Map<String, Object> leetcode = (Map<String, Object>) data.get("leetcode");
        Map<String, Object> streak = (Map<String, Object>) data.get("streak");
        List<Map<String, Object>> snippets =
                (List<Map<String, Object>>) data.get("featuredSnippets");

        // Resolve display name
        String name = displayName;
        if ((name == null || name.isBlank()) && userMap != null) {
            name = (String) userMap.get("name");
        }
        if ((name == null || name.isBlank()) && resumeAnalysis != null) {
            name = (String) resumeAnalysis.getOrDefault("name", "");
        }
        if ((name == null || name.isBlank()) && github != null) {
            Map<String, Object> profile = (Map<String, Object>) github.get("profile");
            name = profile != null
                    ? (String) profile.getOrDefault("name", profile.get("login"))
                    : null;
        }
        if (name == null || name.isBlank()) {
            name = "Developer";
        }

        String profession = userMap != null ? (String) userMap.getOrDefault("profession", "") : "";
        if ((profession == null || profession.isBlank()) && resumeAnalysis != null) {
            profession = (String) resumeAnalysis.getOrDefault("profession", "");
        }

        String bio = "";
        String avatar = "";

        if (userMap != null && userMap.get("photoUrl") != null) {
            avatar = (String) userMap.get("photoUrl");
        }

        if (github != null) {
            Map<String, Object> profile = (Map<String, Object>) github.get("profile");
            if (profile != null) {
                bio = (String) profile.getOrDefault("bio", "");
                if (avatar.isBlank()) {
                    avatar = (String) profile.getOrDefault("avatar_url", "");
                }
                if (bio == null) bio = "";
                if (avatar == null) avatar = "";
            }
        }

        if (bio.isBlank() && resumeAnalysis != null) {
            bio = (String) resumeAnalysis.getOrDefault("summary", "");
        }

        // Contact information resolution
        Map<String, Object> contactMap = null;
        if (resumeAnalysis != null && resumeAnalysis.get("contact") instanceof Map<?, ?> cMap) {
            contactMap = (Map<String, Object>) cMap;
        }
        String email = userMap != null && userMap.get("email") != null ? (String) userMap.get("email") : "";
        if (email.isBlank() && contactMap != null) email = str(contactMap.get("email"));

        String phone = contactMap != null ? str(contactMap.get("phone")) : "";
        String location = contactMap != null ? str(contactMap.get("location")) : "";
        String linkedin = contactMap != null ? str(contactMap.get("linkedin")) : "";
        String githubUrl = contactMap != null ? str(contactMap.get("github")) : "";
        String portfolioUrl = contactMap != null ? str(contactMap.get("portfolio")) : "";

        // Build Skills badges HTML
        StringBuilder skillsHtml = new StringBuilder();
        if (resumeAnalysis != null && resumeAnalysis.get("skills") instanceof List<?> skillsList && !skillsList.isEmpty()) {
            skillsHtml.append("<section id=\"skills\"><h2>Tech Stack & Skills</h2><div class=\"skills-cloud\">");
            for (Object skill : skillsList) {
                skillsHtml.append("<span class=\"skill-badge\">").append(esc(str(skill))).append("</span>");
            }
            skillsHtml.append("</div></section>");
        }

        // Build Experience timeline HTML
        StringBuilder expHtml = new StringBuilder();
        if (resumeAnalysis != null && resumeAnalysis.get("experience") instanceof List<?> expList && !expList.isEmpty()) {
            expHtml.append("<section id=\"experience\"><h2>Work Experience</h2><div class=\"timeline\">");
            for (Object item : expList) {
                if (item instanceof Map<?, ?> exp) {
                    expHtml.append("""
                            <div class="timeline-item">
                              <div class="timeline-role">%s</div>
                              <div class="timeline-company">%s · %s</div>
                              <p>%s</p>
                            </div>""".formatted(
                            esc(str(exp.get("role"))),
                            esc(str(exp.get("company"))),
                            esc(str(exp.get("duration"))),
                            esc(str(exp.get("description")))));
                }
            }
            expHtml.append("</div></section>");
        }

        // Build Projects section (combining Resume Projects + GitHub Top Repos)
        StringBuilder projectsHtml = new StringBuilder();
        boolean hasProjects = false;
        if (resumeAnalysis != null && resumeAnalysis.get("projects") instanceof List<?> resProjects && !resProjects.isEmpty()) {
            hasProjects = true;
            for (Object item : resProjects) {
                if (item instanceof Map<?, ?> p) {
                    List<?> techList = p.get("tech") instanceof List<?> tl ? tl : List.of();
                    StringBuilder techPills = new StringBuilder();
                    for (Object t : techList) {
                        techPills.append("<span class=\"tech-pill\">").append(esc(str(t))).append("</span>");
                    }
                    projectsHtml.append("""
                            <div class="card project-card">
                              <h3>%s</h3>
                              <p>%s</p>
                              %s
                            </div>""".formatted(
                            esc(str(p.get("title"))),
                            esc(str(p.get("description"))),
                            techPills.length() > 0 ? "<div class=\"tech-stack\">" + techPills + "</div>" : ""));
                }
            }
        }

        if (github != null && github.get("topRepos") instanceof List<?> topRepos && !topRepos.isEmpty()) {
            hasProjects = true;
            for (Object item : topRepos) {
                if (item instanceof Map<?, ?> r) {
                    projectsHtml.append("""
                            <a class="card project-card github-card" href="%s" target="_blank" rel="noopener">
                              <h3>%s <span class="badge">GitHub</span></h3>
                              <p>%s</p>
                              <div class="meta">%s★ %s</div>
                            </a>""".formatted(
                            esc(str(r.get("url"))), esc(str(r.get("name"))),
                            esc(str(r.get("description"))),
                            r.get("language") != null ? esc(str(r.get("language"))) + " · " : "",
                            r.get("stars") != null ? r.get("stars") : 0));
                }
            }
        }

        // Build Education HTML
        StringBuilder eduHtml = new StringBuilder();
        if (resumeAnalysis != null && resumeAnalysis.get("education") instanceof List<?> eduList && !eduList.isEmpty()) {
            eduHtml.append("<section id=\"education\"><h2>Education</h2><div class=\"grid\">");
            for (Object item : eduList) {
                if (item instanceof Map<?, ?> edu) {
                    String score = str(edu.get("score"));
                    eduHtml.append("""
                            <div class="card">
                              <h3>%s</h3>
                              <p class="sub">%s</p>
                              <div class="meta">%s%s</div>
                            </div>""".formatted(
                            esc(str(edu.get("degree"))),
                            esc(str(edu.get("school"))),
                            esc(str(edu.get("duration"))),
                            score.isBlank() ? "" : " · Score: " + esc(score)));
                }
            }
            eduHtml.append("</div></section>");
        }

        // Build Certifications HTML
        StringBuilder certHtml = new StringBuilder();
        if (resumeAnalysis != null && resumeAnalysis.get("certifications") instanceof List<?> certList && !certList.isEmpty()) {
            certHtml.append("<section id=\"certifications\"><h2>Certifications</h2><div class=\"grid\">");
            for (Object item : certList) {
                if (item instanceof Map<?, ?> cert) {
                    String authority = str(cert.get("authority"));
                    String date = str(cert.get("date"));
                    certHtml.append("""
                            <div class="card">
                              <h3>📜 %s</h3>
                              <p class="sub">%s</p>
                              %s
                            </div>""".formatted(
                            esc(str(cert.get("name"))),
                            authority.isBlank() ? "Certification" : esc(authority),
                            date.isBlank() ? "" : "<div class=\"meta\">Issued: " + esc(date) + "</div>"));
                }
            }
            certHtml.append("</div></section>");
        }

        // Build snippet cards
        StringBuilder snippetCards = new StringBuilder();
        for (Map<String, Object> s : snippets) {
            List<String> tags = (List<String>) s.getOrDefault("tags", List.of());
            String tagStr = tags.isEmpty() ? "" : " · " + String.join(", ", tags);
            snippetCards.append("""
                    <div class="card"><h3>%s</h3><p>%s</p>
                    <div class="meta">%s%s</div></div>"""
                    .formatted(esc(str(s.get("title"))), esc(str(s.get("description"))),
                            esc(str(s.get("language"))), esc(tagStr)));
        }

        // Build Contact Section HTML
        StringBuilder contactBtns = new StringBuilder();
        if (!email.isBlank()) contactBtns.append("<a href=\"mailto:").append(esc(email)).append("\" class=\"btn btn-primary\">📧 Email Me</a>");
        if (!phone.isBlank()) contactBtns.append("<a href=\"tel:").append(esc(phone)).append("\" class=\"btn btn-ghost\">📞 ").append(esc(phone)).append("</a>");
        if (!linkedin.isBlank()) contactBtns.append("<a href=\"").append(esc(linkedin)).append("\" target=\"_blank\" class=\"btn btn-ghost\">🔗 LinkedIn</a>");
        if (!githubUrl.isBlank()) contactBtns.append("<a href=\"").append(esc(githubUrl)).append("\" target=\"_blank\" class=\"btn btn-ghost\">💻 GitHub</a>");
        if (!portfolioUrl.isBlank()) contactBtns.append("<a href=\"").append(esc(portfolioUrl)).append("\" target=\"_blank\" class=\"btn btn-ghost\">🌐 Website</a>");

        int totalSolved = leetcode != null ? (int) leetcode.getOrDefault("totalSolved", 0) : 0;
        int currentStreak = streak != null ? (int) streak.getOrDefault("currentStreak", 0) : 0;
        int totalRepos = github != null ? (int) github.getOrDefault("totalRepos", 0) : 0;

        String htmlTemplate = """
                <!DOCTYPE html>
                <html lang="en">
                <head>
                <meta charset="UTF-8"/>
                <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
                <title>{{NAME}} — Developer Portfolio</title>
                <link href="https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@400;500;700&display=swap" rel="stylesheet"/>
                <style>
                *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
                :root {
                  --bg: #06070d;
                  --bg-panel: rgba(16, 17, 29, 0.85);
                  --border: rgba(124, 109, 250, 0.2);
                  --accent: #7c6dfa;
                  --accent-glow: #6dfac0;
                  --amber: #f59e0b;
                  --text: #f5f3ff;
                  --muted: #a5a9c8;
                  --faint: #676a8b;
                }
                html { scroll-behavior: smooth; }
                body {
                  background: radial-gradient(circle at top left, rgba(124, 109, 250, 0.18), transparent 30%),
                              radial-gradient(circle at bottom right, rgba(250, 109, 124, 0.15), transparent 25%),
                              var(--bg);
                  color: var(--text);
                  font-family: 'DM Sans', -apple-system, BlinkMacSystemFont, sans-serif;
                  font-size: 16px;
                  line-height: 1.6;
                  min-height: 100vh;
                  position: relative;
                  overflow-x: hidden;
                }
                .scroll-progress {
                  position: fixed; top: 0; left: 0; height: 3px; width: 0%%;
                  background: linear-gradient(90deg, var(--accent), var(--accent-glow), var(--amber));
                  z-index: 100; transition: width 0.1s;
                }
                .orb {
                  position: fixed; border-radius: 50%%; filter: blur(120px); pointer-events: none; z-index: 0; opacity: 0.25;
                }
                .orb1 { width: 500px; height: 500px; background: #7c6dfa; top: -150px; left: -100px; }
                .orb2 { width: 420px; height: 420px; background: #fa6d7c; bottom: 5%%; right: -80px; }
                .orb3 { width: 320px; height: 320px; background: #6dfac0; top: 45%%; left: 40%%; }
                nav {
                  position: fixed; top: 0; left: 0; right: 0; z-index: 90;
                  display: flex; justify-content: space-between; align-items: center;
                  padding: 1rem 3rem; backdrop-filter: blur(18px);
                  background: rgba(6, 7, 13, 0.7); border-bottom: 1px solid var(--border);
                }
                .nav-logo { font-family: 'Syne', sans-serif; font-weight: 800; font-size: 1.1rem; color: var(--text); text-decoration: none; }
                .nav-logo span { color: var(--accent); }
                .nav-links { display: flex; gap: 1.5rem; list-style: none; }
                .nav-links a { color: var(--muted); text-decoration: none; font-size: 0.9rem; font-weight: 500; transition: color 0.2s; }
                .nav-links a:hover { color: var(--accent-glow); }
                header {
                  padding: 120px 24px 40px; text-align: center; max-width: 840px; margin: 0 auto; position: relative; z-index: 1;
                }
                header img {
                  width: 110px; height: 110px; border-radius: 50%%; object-fit: cover;
                  border: 3px solid var(--accent); box-shadow: 0 0 30px rgba(124, 109, 250, 0.4); margin-bottom: 20px;
                }
                .avatar-placeholder {
                  width: 100px; height: 100px; border-radius: 50%%; background: var(--bg-panel); border: 2px solid var(--border);
                  display: flex; align-items: center; justify-content: center; font-size: 2.5rem; margin: 0 auto 20px;
                }
                h1 { font-family: 'Syne', sans-serif; font-size: 2.8rem; font-weight: 800; letter-spacing: -0.02em; margin-bottom: 6px; }
                .profession { color: var(--accent-glow); font-weight: 600; font-size: 1.15rem; margin-bottom: 16px; }
                .bio { color: var(--muted); font-size: 1.05rem; line-height: 1.7; margin: 0 auto 24px; max-width: 700px; }
                .contact-bar { display: flex; justify-content: center; flex-wrap: wrap; gap: 12px; margin-top: 16px; }
                .location-tag { display: inline-flex; align-items: center; gap: 6px; color: var(--faint); font-size: 0.85rem; margin-bottom: 12px; }
                section { max-width: 960px; margin: 0 auto; padding: 36px 24px; position: relative; z-index: 1; }
                h2 { font-family: 'Syne', sans-serif; font-size: 1.4rem; font-weight: 700; margin-bottom: 20px; border-bottom: 1px solid var(--border); padding-bottom: 10px; display: flex; align-items: center; gap: 10px; }
                .skills-cloud { display: flex; flex-wrap: wrap; gap: 10px; }
                .skill-badge {
                  background: var(--bg-panel); border: 1px solid var(--border); color: var(--text);
                  padding: 8px 16px; border-radius: 8px; font-size: 0.9rem; font-weight: 500;
                  box-shadow: 0 4px 12px rgba(0,0,0,0.2); transition: transform 0.2s, border-color 0.2s;
                }
                .skill-badge:hover { transform: translateY(-2px); border-color: var(--accent); }
                .timeline { border-left: 2px solid var(--border); padding-left: 24px; margin-left: 8px; }
                .timeline-item { margin-bottom: 28px; position: relative; }
                .timeline-item::before {
                  content: ''; position: absolute; left: -31px; top: 6px; width: 12px; height: 12px;
                  border-radius: 50%%; background: var(--accent); box-shadow: 0 0 10px var(--accent);
                }
                .timeline-role { font-family: 'Syne', sans-serif; font-size: 1.1rem; font-weight: 700; color: var(--text); }
                .timeline-company { color: var(--amber); font-size: 0.9rem; font-weight: 500; margin: 2px 0 8px; }
                .timeline-item p { color: var(--muted); font-size: 0.95rem; white-space: pre-wrap; line-height: 1.6; }
                .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 18px; }
                .card {
                  background: var(--bg-panel); border-radius: 14px; padding: 20px; border: 1px solid var(--border);
                  backdrop-filter: blur(12px); text-decoration: none; color: inherit; transition: transform 0.2s, border-color 0.2s, box-shadow 0.2s;
                }
                .card:hover { transform: translateY(-3px); border-color: var(--accent); box-shadow: 0 8px 24px rgba(124, 109, 250, 0.15); }
                .card h3 { font-family: 'Syne', sans-serif; font-size: 1.05rem; font-weight: 700; margin-bottom: 8px; color: var(--text); }
                .card p { color: var(--muted); font-size: 0.9rem; line-height: 1.5; margin-bottom: 12px; }
                .card .sub { color: var(--amber); font-size: 0.85rem; font-weight: 500; }
                .card .meta { font-size: 0.8rem; color: var(--accent-glow); font-weight: 500; }
                .tech-stack { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 10px; }
                .tech-pill { background: rgba(124, 109, 250, 0.15); color: var(--accent); font-size: 0.75rem; padding: 3px 8px; border-radius: 4px; font-weight: 500; }
                .badge { background: var(--accent); color: #fff; font-size: 0.65rem; padding: 2px 6px; border-radius: 4px; vertical-align: middle; margin-left: 6px; }
                .stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: 16px; }
                .stat { background: var(--bg-panel); border-radius: 14px; padding: 20px; border: 1px solid var(--border); text-align: center; }
                .stat .n { font-family: 'Syne', sans-serif; font-size: 2rem; font-weight: 800; color: var(--accent-glow); }
                .stat .l { color: var(--muted); font-size: 0.85rem; font-weight: 500; margin-top: 4px; }
                .btn {
                  display: inline-flex; align-items: center; gap: 8px; padding: 10px 20px; border-radius: 10px;
                  font-size: 0.9rem; font-weight: 600; text-decoration: none; transition: all 0.2s; cursor: pointer;
                }
                .btn-primary { background: var(--accent); color: #fff; box-shadow: 0 4px 16px rgba(124, 109, 250, 0.4); }
                .btn-primary:hover { background: #6b5be8; transform: translateY(-2px); }
                .btn-ghost { background: rgba(255,255,255,0.05); color: var(--text); border: 1px solid var(--border); }
                .btn-ghost:hover { background: rgba(255,255,255,0.1); border-color: var(--accent); }
                footer { text-align: center; padding: 50px 24px; color: var(--faint); font-size: 0.85rem; border-top: 1px solid var(--border); margin-top: 40px; position: relative; z-index: 1; }
                @media (max-width: 768px) {
                  nav { padding: 1rem; }
                  .nav-links { display: none; }
                  h1 { font-size: 2.1rem; }
                  section { padding: 24px 16px; }
                }
                </style>
                </head>
                <body>
                <div class="scroll-progress" id="progressBar"></div>
                <div class="orb orb1"></div>
                <div class="orb orb2"></div>
                <div class="orb orb3"></div>
                <nav>
                  <a href="#" class="nav-logo">{{NAME}}<span>.</span></a>
                  <ul class="nav-links">
                    <li><a href="#skills">Skills</a></li>
                    <li><a href="#experience">Experience</a></li>
                    <li><a href="#projects">Projects</a></li>
                    <li><a href="#education">Education</a></li>
                    <li><a href="#contact">Contact</a></li>
                  </ul>
                </nav>
                <header id="hero">
                  {{AVATAR_HTML}}
                  <h1>{{NAME}}</h1>
                  {{PROFESSION_HTML}}
                  {{LOCATION_HTML}}
                  <p class="bio">{{BIO}}</p>
                  <div class="contact-bar">
                    {{CONTACT_BUTTONS}}
                  </div>
                </header>

                {{SKILLS_SECTION}}
                {{EXPERIENCE_SECTION}}

                {{PROJECTS_CONTAINER}}

                {{EDUCATION_SECTION}}
                {{CERTIFICATIONS_SECTION}}

                <section id="stats">
                  <h2>Productivity & Stats</h2>
                  <div class="stats">
                    {{LEETCODE_STAT}}
                    <div class="stat"><div class="n">{{STREAK}}</div><div class="l">Day Streak</div></div>
                    <div class="stat"><div class="n">{{REPOS}}</div><div class="l">GitHub Repos</div></div>
                    <div class="stat"><div class="n">{{SNIPPETS_COUNT}}</div><div class="l">Saved Snippets</div></div>
                  </div>
                </section>

                {{SNIPPET_SECTION}}

                <footer id="contact">
                  <p>© {{NAME}} — Generated by DevAgent on {{DATE}}</p>
                </footer>

                <script>
                window.addEventListener('scroll', () => {
                  const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
                  const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
                  const scrolled = (winScroll / height) * 100;
                  const pb = document.getElementById('progressBar');
                  if (pb) pb.style.width = scrolled + '%%';
                });
                </script>
                </body>
                </html>
                """;

        String avatarHtml = avatar.isBlank()
                ? "<div class=\"avatar-placeholder\">👤</div>"
                : "<img src=\"" + esc(avatar) + "\" alt=\"" + esc(name) + "\"/>";
        String professionHtml = profession.isBlank() ? "" : "<div class=\"profession\">" + esc(profession) + "</div>";
        String locationHtml = location.isBlank() ? "" : "<div class=\"location-tag\">📍 " + esc(location) + "</div>";

        String projectsContainer = hasProjects
                ? "<section id=\"projects\"><h2>Featured Projects</h2><div class=\"grid\">" + projectsHtml + "</div></section>"
                : "";

        return htmlTemplate
                .replace("{{NAME}}", esc(name))
                .replace("{{AVATAR_HTML}}", avatarHtml)
                .replace("{{PROFESSION_HTML}}", professionHtml)
                .replace("{{LOCATION_HTML}}", locationHtml)
                .replace("{{BIO}}", esc(bio))
                .replace("{{CONTACT_BUTTONS}}", contactBtns.toString())
                .replace("{{SKILLS_SECTION}}", skillsHtml.toString())
                .replace("{{EXPERIENCE_SECTION}}", expHtml.toString())
                .replace("{{PROJECTS_CONTAINER}}", projectsContainer)
                .replace("{{EDUCATION_SECTION}}", eduHtml.toString())
                .replace("{{CERTIFICATIONS_SECTION}}", certHtml.toString())
                .replace("{{LEETCODE_STAT}}", includeLeetcode ? "<div class=\"stat\"><div class=\"n\">" + totalSolved + "</div><div class=\"l\">LeetCode Solved</div></div>" : "")
                .replace("{{STREAK}}", String.valueOf(currentStreak))
                .replace("{{REPOS}}", String.valueOf(totalRepos))
                .replace("{{SNIPPETS_COUNT}}", String.valueOf(snippets.size()))
                .replace("{{SNIPPET_SECTION}}", snippets.isEmpty() ? "" : "<section><h2>Featured Snippets</h2><div class=\"grid\">" + snippetCards + "</div></section>")
                .replace("{{DATE}}", java.time.LocalDate.now().toString());
    }

    private String esc(String s) {
        if (s == null) return "";
        return s.replace("&", "&amp;").replace("<", "&lt;")
                .replace(">", "&gt;").replace("\"", "&quot;");
    }

    private String str(Object o) { return o != null ? o.toString() : ""; }
}
