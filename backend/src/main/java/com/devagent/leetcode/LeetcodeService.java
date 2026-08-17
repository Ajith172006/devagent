package com.devagent.leetcode;

import com.devagent.leetcode.LeetcodeEntry.Difficulty;
import com.devagent.leetcode.LeetcodeEntry.Status;
import com.devagent.leetcode.dto.CreateLeetcodeRequest;
import com.devagent.leetcode.dto.UpdateLeetcodeRequest;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class LeetcodeService {

    private final LeetcodeRepository repo;

    public LeetcodeService(LeetcodeRepository repo) {
        this.repo = repo;
    }

    public LeetcodeEntry create(String userId, CreateLeetcodeRequest req) {
        boolean isSolved = Status.Solved.equals(req.getStatus());
        LeetcodeEntry e = new LeetcodeEntry();
        e.setUserId(userId);
        e.setTitle(req.getTitle());
        e.setUrl(req.getUrl());
        e.setDifficulty(req.getDifficulty());
        e.setStatus(req.getStatus() != null ? req.getStatus() : Status.Attempted);
        e.setTopics(req.getTopics() != null ? req.getTopics() : List.of());
        e.setNotes(req.getNotes());
        e.setSolvedAt(isSolved ? LocalDate.now().toString() : null);
        return repo.save(e);
    }

    public List<LeetcodeEntry> findAll(String userId, String statusStr,
                                       String difficultyStr, String topic) {
        List<LeetcodeEntry> all = repo.findByUserIdOrderByUpdatedAtDesc(userId);
        return all.stream()
                .filter(e -> statusStr == null || e.getStatus().name().equalsIgnoreCase(statusStr))
                .filter(e -> difficultyStr == null || e.getDifficulty().name().equalsIgnoreCase(difficultyStr))
                .filter(e -> topic == null || e.getTopics().stream()
                        .anyMatch(t -> t.equalsIgnoreCase(topic)))
                .collect(Collectors.toList());
    }

    public List<LeetcodeEntry> findAllAdmin() {
        return repo.findAllByOrderByUpdatedAtDesc();
    }

    public LeetcodeEntry findOne(String userId, String id) {
        return repo.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "LeetCode entry " + id + " not found"));
    }

    public LeetcodeEntry update(String userId, String id, UpdateLeetcodeRequest req) {
        LeetcodeEntry e = findOne(userId, id);
        boolean wasSolved = Status.Solved.equals(e.getStatus());

        if (req.getTitle() != null) e.setTitle(req.getTitle());
        if (req.getUrl() != null) e.setUrl(req.getUrl());
        if (req.getDifficulty() != null) e.setDifficulty(req.getDifficulty());
        if (req.getStatus() != null) e.setStatus(req.getStatus());
        if (req.getTopics() != null) e.setTopics(req.getTopics());
        if (req.getNotes() != null) e.setNotes(req.getNotes());

        if (!wasSolved && Status.Solved.equals(e.getStatus()) && e.getSolvedAt() == null) {
            e.setSolvedAt(LocalDate.now().toString());
        }
        return repo.save(e);
    }

    public void remove(String userId, String id) {
        LeetcodeEntry e = findOne(userId, id);
        repo.delete(e);
    }

    public void adminRemove(String id) {
        repo.findById(id).ifPresentOrElse(repo::delete,
                () -> { throw new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "LeetCode entry " + id + " not found"); });
    }

    public Map<String, Object> stats(String userId) {
        List<LeetcodeEntry> all = repo.findByUserId(userId);
        List<LeetcodeEntry> solved = all.stream()
                .filter(e -> Status.Solved.equals(e.getStatus())).toList();

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("totalProblems", all.size());
        result.put("totalSolved", solved.size());
        result.put("easy", diffStats(all, solved, Difficulty.Easy));
        result.put("medium", diffStats(all, solved, Difficulty.Medium));
        result.put("hard", diffStats(all, solved, Difficulty.Hard));

        // Top topics
        Map<String, Long> topicCounts = solved.stream()
                .flatMap(e -> e.getTopics().stream())
                .collect(Collectors.groupingBy(t -> t, Collectors.counting()));

        List<Map<String, Object>> topTopics = topicCounts.entrySet().stream()
                .sorted(Map.Entry.<String, Long>comparingByValue().reversed())
                .limit(10)
                .map(entry -> {
                    Map<String, Object> m = new LinkedHashMap<>();
                    m.put("topic", entry.getKey());
                    m.put("count", entry.getValue());
                    return m;
                })
                .toList();
        result.put("topTopics", topTopics);
        return result;
    }

    private Map<String, Integer> diffStats(List<LeetcodeEntry> all,
                                            List<LeetcodeEntry> solved,
                                            Difficulty d) {
        return Map.of(
                "solved", (int) solved.stream().filter(e -> d.equals(e.getDifficulty())).count(),
                "attempted", (int) all.stream().filter(e -> d.equals(e.getDifficulty())).count()
        );
    }
}
