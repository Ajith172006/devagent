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

        // Build Skills badges HTML
        StringBuilder skillsHtml = new StringBuilder();
        if (resumeAnalysis != null && resumeAnalysis.get("skills") instanceof List<?> skillsList) {
            skillsHtml.append("<section><h2>Skills</h2><div class=\"skills-cloud\">");
            for (Object skill : skillsList) {
                skillsHtml.append("<span class=\"skill-badge\">").append(esc(str(skill))).append("</span>");
            }
            skillsHtml.append("</div></section>");
        }

        // Build Experience timeline HTML
        StringBuilder expHtml = new StringBuilder();
        if (resumeAnalysis != null && resumeAnalysis.get("experience") instanceof List<?> expList) {
            expHtml.append("<section><h2>Work Experience</h2><div class=\"timeline\">");
            for (Object item : expList) {
                if (item instanceof Map<?, ?> exp) {
                    expHtml.append("""
                            <div class="timeline-item">
                              <div class="role">%s</div>
                              <div class="company">%s · %s</div>
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

        // Build Education HTML
        StringBuilder eduHtml = new StringBuilder();
        if (resumeAnalysis != null && resumeAnalysis.get("education") instanceof List<?> eduList && !eduList.isEmpty()) {
            eduHtml.append("<section><h2>Education</h2><div class=\"grid\">");
            for (Object item : eduList) {
                if (item instanceof Map<?, ?> edu) {
                    eduHtml.append("""
                            <div class="card">
                              <h3>%s</h3>
                              <p>%s (%s)</p>
                            </div>""".formatted(
                            esc(str(edu.get("degree"))),
                            esc(str(edu.get("school"))),
                            esc(str(edu.get("duration")))));
                }
            }
            eduHtml.append("</div></section>");
        }

        // Build repo cards
        StringBuilder repoCards = new StringBuilder();
        if (github != null) {
            List<Map<String, Object>> topRepos =
                    (List<Map<String, Object>>) github.get("topRepos");
            if (topRepos != null) {
                for (Map<String, Object> r : topRepos) {
                    repoCards.append("""
                            <a class="card" href="%s" target="_blank" rel="noopener">
                              <h3>%s</h3><p>%s</p>
                              <div class="meta">%s★ %s</div>
                            </a>""".formatted(
                            esc(str(r.get("url"))), esc(str(r.get("name"))),
                            esc(str(r.get("description"))),
                            r.get("language") != null ? esc(str(r.get("language"))) + " · " : "",
                            r.getOrDefault("stars", 0)));
                }
            }
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

        int totalSolved = leetcode != null ? (int) leetcode.getOrDefault("totalSolved", 0) : 0;
        int currentStreak = streak != null ? (int) streak.getOrDefault("currentStreak", 0) : 0;
        int totalRepos = github != null ? (int) github.getOrDefault("totalRepos", 0) : 0;

        String htmlTemplate = """
                <!DOCTYPE html><html lang="en"><head>
                <meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/>
                <title>{{NAME}} — Portfolio</title>
                <style>
                :root{--bg:#0f1115;--panel:#161923;--text:#e8e9ed;--muted:#9298a8;--accent:#5eead4;--amber:#f59e0b}
                *{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--text);
                font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif}
                header{padding:64px 24px 32px;text-align:center}
                header img{width:104px;height:104px;border-radius:50%;object-fit:cover;margin-bottom:16px;border:3px solid var(--amber)}
                h1{margin:0 0 4px;font-size:2.25rem}.profession{color:var(--amber);font-weight:600;font-size:1.1rem;margin-bottom:12px}
                .bio{color:var(--muted);max-width:640px;margin:0 auto;line-height:1.6}
                section{max-width:960px;margin:0 auto;padding:24px 24px}
                h2{font-size:1.25rem;border-bottom:1px solid #262a36;padding-bottom:8px;margin-bottom:16px}
                .stats{display:flex;gap:16px;flex-wrap:wrap}
                .stat{background:var(--panel);border-radius:12px;padding:16px 20px;flex:1;min-width:140px}
                .stat .n{font-size:1.75rem;font-weight:700;color:var(--accent)}.stat .l{color:var(--muted);font-size:.85rem}
                .skills-cloud{display:flex;flex-wrap:wrap;gap:8px}
                .skill-badge{background:var(--panel);border:1px solid #2b3040;color:var(--text);padding:6px 14px;border-radius:8px;font-size:0.85rem}
                .timeline{border-left:2px solid #262a36;padding-left:16px;margin-left:8px}
                .timeline-item{margin-bottom:20px;position:relative}
                .timeline-item::before{content:'';position:absolute;left:-22px;top:4px;width:10px;height:10px;border-radius:50%;background:var(--amber)}
                .role{font-weight:600;font-size:1rem;color:var(--text)}
                .company{font-size:0.85rem;color:var(--muted);margin-bottom:6px}
                .timeline-item p{margin:0;font-size:0.875rem;color:var(--muted);line-height:1.5;white-space:pre-wrap}
                .grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:16px}
                .card{display:block;background:var(--panel);border-radius:12px;padding:16px;
                text-decoration:none;color:inherit;border:1px solid #232735}
                .card h3{margin:0 0 6px;font-size:1rem}.card p{margin:0 0 10px;color:var(--muted);font-size:.875rem}
                .card .meta{font-size:.75rem;color:var(--accent)}
                footer{text-align:center;padding:40px 24px;color:var(--muted);font-size:.8rem}
                </style></head><body>
                <header>
                  {{AVATAR}}
                  <h1>{{NAME}}</h1>
                  {{PROFESSION}}
                  <p class="bio">{{BIO}}</p>
                </header>
                {{SKILLS_SECTION}}
                {{EXPERIENCE_SECTION}}
                {{EDUCATION_SECTION}}
                <section><h2>Stats</h2><div class="stats">
                {{LEETCODE_STAT}}
                <div class="stat"><div class="n">{{STREAK}}</div><div class="l">Day streak</div></div>
                <div class="stat"><div class="n">{{REPOS}}</div><div class="l">GitHub repos</div></div>
                <div class="stat"><div class="n">{{SNIPPETS}}</div><div class="l">Saved snippets</div></div>
                </div></section>
                {{REPO_SECTION}}
                {{SNIPPET_SECTION}}
                <footer>Generated by DevAgent on {{DATE}}</footer></body></html>
                """;

        return htmlTemplate
                .replace("{{NAME}}", esc(name))
                .replace("{{AVATAR}}", avatar.isBlank() ? "" : "<img src=\"" + esc(avatar) + "\" alt=\"avatar\"/>")
                .replace("{{PROFESSION}}", profession.isBlank() ? "" : "<div class=\"profession\">" + esc(profession) + "</div>")
                .replace("{{BIO}}", esc(bio))
                .replace("{{SKILLS_SECTION}}", skillsHtml.toString())
                .replace("{{EXPERIENCE_SECTION}}", expHtml.toString())
                .replace("{{EDUCATION_SECTION}}", eduHtml.toString())
                .replace("{{LEETCODE_STAT}}", includeLeetcode ? "<div class=\"stat\"><div class=\"n\">" + totalSolved + "</div><div class=\"l\">LeetCode solved</div></div>" : "")
                .replace("{{STREAK}}", String.valueOf(currentStreak))
                .replace("{{REPOS}}", String.valueOf(totalRepos))
                .replace("{{SNIPPETS}}", String.valueOf(snippets.size()))
                .replace("{{REPO_SECTION}}", repoCards.length() > 0 ? "<section><h2>Top Repositories</h2><div class=\"grid\">" + repoCards + "</div></section>" : "")
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

