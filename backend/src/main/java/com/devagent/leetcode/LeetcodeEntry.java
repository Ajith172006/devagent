package com.devagent.leetcode;

import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "leetcode_entries", indexes = @Index(columnList = "user_id"))
public class LeetcodeEntry {

    public enum Difficulty { Easy, Medium, Hard }
    public enum Status { Attempted, Solved, Review }

    @Id
    @Column(length = 36)
    private String id;

    @Column(name = "user_id", nullable = false, length = 128)
    private String userId;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String url;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 10)
    private Difficulty difficulty;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 10)
    private Status status = Status.Attempted;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "leetcode_topics", joinColumns = @JoinColumn(name = "entry_id"))
    @Column(name = "topic")
    private List<String> topics = new ArrayList<>();

    @Column(columnDefinition = "TEXT")
    private String notes;

    @Column(name = "solved_at", length = 10)
    private String solvedAt;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private Instant createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private Instant updatedAt;

    @PrePersist
    public void prePersist() {
        if (id == null) id = UUID.randomUUID().toString();
    }

    public LeetcodeEntry() {}

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }
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
    public String getSolvedAt() { return solvedAt; }
    public void setSolvedAt(String solvedAt) { this.solvedAt = solvedAt; }
    public Instant getCreatedAt() { return createdAt; }
    public Instant getUpdatedAt() { return updatedAt; }
}
