package com.devagent.leetcode.dto;

import com.devagent.leetcode.LeetcodeEntry.Difficulty;
import com.devagent.leetcode.LeetcodeEntry.Status;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.util.List;

public class CreateLeetcodeRequest {
    @NotBlank private String title;
    private String url;
    @NotNull private Difficulty difficulty;
    private Status status;
    private List<String> topics;
    private String notes;

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getUrl() { return url; }
    public void setUrl(String url) { this.url = url; }
    public Difficulty getDifficulty() { return difficulty; }
    public void setDifficulty(Difficulty difficulty) { this.difficulty = difficulty; }
    public Status getStatus() { return status; }
    public void setStatus(Status status) { this.status = status; }
    public List<String> getTopics() { return topics; }
    public void setTopics(List<String> topics) { this.topics = topics; }
    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
}
