package com.devagent.github;

import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/github")
public class GithubController {

    private final GithubService githubService;

    public GithubController(GithubService githubService) {
        this.githubService = githubService;
    }

    @GetMapping("/{username}/profile")
    public Map<String, Object> getProfile(@PathVariable String username) {
        return githubService.getProfile(username);
    }

    @GetMapping("/{username}/repos")
    public List<Map<String, Object>> getRepos(@PathVariable String username,
                                               @RequestParam(defaultValue = "100") int limit) {
        return githubService.getRepos(username, limit);
    }

    @GetMapping("/{username}/summary")
    public Map<String, Object> getSummary(@PathVariable String username) {
        return githubService.getSummary(username);
    }
}
