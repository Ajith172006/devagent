package com.devagent.portfolio;

import com.devagent.github.GithubService;
import com.devagent.goals.GoalsService;
import com.devagent.leetcode.LeetcodeService;
import com.devagent.snippets.Snippet;
import com.devagent.snippets.SnippetsService;
import com.devagent.users.User;
import com.devagent.users.UsersService;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.util.*;

@Service
public class PortfolioService {

    private final SnippetsService snippetsService;
    private final LeetcodeService leetcodeService;
    private final GoalsService goalsService;
    private final GithubService githubService;
    private final UsersService usersService;

    public PortfolioService(SnippetsService snippetsService, LeetcodeService leetcodeService,
                            GoalsService goalsService, GithubService githubService,
                            UsersService usersService) {
        this.snippetsService = snippetsService;
        this.leetcodeService = leetcodeService;
        this.goalsService = goalsService;
        this.githubService = githubService;
        this.usersService = usersService;
    }

    public Map<String, Object> generate(String userId, String githubUsername) {
        List<Snippet> snippets = snippetsService.findAll(userId, null, null, null);
        Map<String, Object> leetcode = leetcodeService.stats(userId);
        Map<String, Object> streak = goalsService.getStreak(userId);

        Map<String, Object> github = null;
        if (githubUsername != null && !githubUsername.isBlank()) {
            try { github = githubService.getSummary(githubUsername); }
            catch (Exception ignored) {}
        }

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
        Map<String, Object> github = (Map<String, Object>) data.get("github");
        Map<String, Object> leetcode = (Map<String, Object>) data.get("leetcode");
        Map<String, Object> streak = (Map<String, Object>) data.get("streak");
        List<Map<String, Object>> snippets =
                (List<Map<String, Object>>) data.get("featuredSnippets");

        // Resolve display name
        String name = displayName;
        if ((name == null || name.isBlank()) && github != null) {
            Map<String, Object> profile = (Map<String, Object>) github.get("profile");
            name = profile != null
                    ? (String) profile.getOrDefault("name", profile.get("login"))
                    : null;
        }
        if (name == null || name.isBlank()) {
            try { name = usersService.findOne(userId).getName(); }
            catch (Exception ignored) { name = "Developer"; }
        }

        String bio = "";
        String avatar = "";
        if (github != null) {
            Map<String, Object> profile = (Map<String, Object>) github.get("profile");
            if (profile != null) {
                bio = (String) profile.getOrDefault("bio", "");
                avatar = (String) profile.getOrDefault("avatar_url", "");
                if (bio == null) bio = "";
                if (avatar == null) avatar = "";
            }
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

        return """
                <!DOCTYPE html><html lang="en"><head>
                <meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/>
                <title>%s — Portfolio</title>
                <style>
                :root{--bg:#0f1115;--panel:#161923;--text:#e8e9ed;--muted:#9298a8;--accent:#5eead4}
                *{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--text);
                font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif}
                header{padding:64px 24px 32px;text-align:center}
                header img{width:96px;height:96px;border-radius:50%;margin-bottom:16px}
                h1{margin:0 0 8px;font-size:2rem}.bio{color:var(--muted);max-width:560px;margin:0 auto}
                section{max-width:960px;margin:0 auto;padding:32px 24px}
                h2{font-size:1.25rem;border-bottom:1px solid #262a36;padding-bottom:8px}
                .stats{display:flex;gap:16px;flex-wrap:wrap}
                .stat{background:var(--panel);border-radius:12px;padding:16px 20px;flex:1;min-width:140px}
                .stat .n{font-size:1.75rem;font-weight:700;color:var(--accent)}.stat .l{color:var(--muted);font-size:.85rem}
                .grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:16px}
                .card{display:block;background:var(--panel);border-radius:12px;padding:16px;
                text-decoration:none;color:inherit;border:1px solid #232735}
                .card h3{margin:0 0 6px;font-size:1rem}.card p{margin:0 0 10px;color:var(--muted);font-size:.875rem}
                .card .meta{font-size:.75rem;color:var(--accent)}
                footer{text-align:center;padding:32px;color:var(--muted);font-size:.8rem}
                </style></head><body>
                <header>%s<h1>%s</h1><p class="bio">%s</p></header>
                <section><h2>Stats</h2><div class="stats">
                %s
                <div class="stat"><div class="n">%d</div><div class="l">Day streak</div></div>
                <div class="stat"><div class="n">%d</div><div class="l">GitHub repos</div></div>
                <div class="stat"><div class="n">%d</div><div class="l">Saved snippets</div></div>
                </div></section>
                %s%s
                <footer>Generated by DevAgent on %s</footer></body></html>
                """.formatted(
                esc(name),
                avatar.isBlank() ? "" : "<img src=\"" + esc(avatar) + "\" alt=\"avatar\"/>",
                esc(name), esc(bio),
                includeLeetcode ? "<div class=\"stat\"><div class=\"n\">" + totalSolved
                        + "</div><div class=\"l\">LeetCode solved</div></div>" : "",
                currentStreak, totalRepos, snippets.size(),
                repoCards.length() > 0 ? "<section><h2>Top Repositories</h2><div class=\"grid\">"
                        + repoCards + "</div></section>" : "",
                snippets.isEmpty() ? "" : "<section><h2>Featured Snippets</h2><div class=\"grid\">"
                        + snippetCards + "</div></section>",
                java.time.LocalDate.now());
    }

    private String esc(String s) {
        if (s == null) return "";
        return s.replace("&", "&amp;").replace("<", "&lt;")
                .replace(">", "&gt;").replace("\"", "&quot;");
    }

    private String str(Object o) { return o != null ? o.toString() : ""; }
}
