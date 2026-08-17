package com.devagent.github;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import okhttp3.OkHttpClient;
import okhttp3.Request;
import okhttp3.Response;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class GithubService {

    private static final String BASE = "https://api.github.com";
    private final OkHttpClient httpClient = new OkHttpClient();
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Value("${github.token:}")
    private String githubToken;

    private Request.Builder builder(String url) {
        Request.Builder b = new Request.Builder()
                .url(url)
                .header("Accept", "application/vnd.github+json")
                .header("User-Agent", "DevAgent");
        if (githubToken != null && !githubToken.isBlank()) {
            b.header("Authorization", "Bearer " + githubToken);
        }
        return b;
    }

    private <T> T fetch(String url, TypeReference<T> type) {
        try (Response res = httpClient.newCall(builder(url).build()).execute()) {
            if (!res.isSuccessful()) {
                throw new ResponseStatusException(HttpStatus.valueOf(res.code()),
                        "GitHub API error: " + res.code());
            }
            return objectMapper.readValue(res.body().string(), type);
        } catch (ResponseStatusException e) {
            throw e;
        } catch (IOException e) {
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY,
                    "Failed to reach GitHub API: " + e.getMessage());
        }
    }

    public Map<String, Object> getProfile(String username) {
        return fetch(BASE + "/users/" + username,
                new TypeReference<>() {});
    }

    public List<Map<String, Object>> getRepos(String username, int limit) {
        return fetch(BASE + "/users/" + username + "/repos?per_page=" + limit + "&sort=updated",
                new TypeReference<>() {});
    }

    public Map<String, Object> getSummary(String username) {
        Map<String, Object> profile = getProfile(username);
        List<Map<String, Object>> rawRepos = getRepos(username, 100);

        // Language breakdown
        Map<String, Long> langCounts = rawRepos.stream()
                .filter(r -> r.get("language") != null)
                .collect(Collectors.groupingBy(r -> (String) r.get("language"),
                        Collectors.counting()));

        List<Map<String, Object>> languages = langCounts.entrySet().stream()
                .sorted(Map.Entry.<String, Long>comparingByValue().reversed())
                .map(e -> Map.<String, Object>of("language", e.getKey(), "count", e.getValue()))
                .toList();

        // Top repos — non-forks by stars
        List<Map<String, Object>> topRepos = rawRepos.stream()
                .filter(r -> !Boolean.TRUE.equals(r.get("fork")))
                .sorted(Comparator.comparingInt(
                        (Map<String, Object> r) -> (Integer) r.getOrDefault("stargazers_count", 0))
                        .reversed())
                .limit(6)
                .map(r -> {
                    Map<String, Object> repo = new LinkedHashMap<>();
                    repo.put("name", r.get("name"));
                    repo.put("url", r.get("html_url"));
                    repo.put("description", r.get("description"));
                    repo.put("language", r.get("language"));
                    repo.put("stars", r.getOrDefault("stargazers_count", 0));
                    repo.put("forks", r.getOrDefault("forks_count", 0));
                    repo.put("fork", r.getOrDefault("fork", false));
                    repo.put("updatedAt", r.get("updated_at"));
                    return repo;
                })
                .toList();

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("profile", profile);
        result.put("totalRepos", rawRepos.size());
        result.put("languages", languages);
        result.put("topRepos", topRepos);
        return result;
    }
}
