package com.devagent.goals;

import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "goals",
       indexes = @Index(columnList = "user_id"),
       uniqueConstraints = @UniqueConstraint(columnNames = {"user_id", "date"}))
public class Goal {

    @Id
    @Column(length = 36)
    private String id;

    @Column(name = "user_id", nullable = false, length = 128)
    private String userId;

    @Column(nullable = false, length = 10)
    private String date;

    @Column(name = "target_minutes", nullable = false)
    private int targetMinutes;

    @Column(name = "minutes_logged", nullable = false)
    private int minutesLogged = 0;

    @Column(columnDefinition = "TEXT")
    private String focus;

    @Column(nullable = false)
    private boolean completed = false;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private Instant createdAt;

    @PrePersist
    public void prePersist() {
        if (id == null) id = UUID.randomUUID().toString();
    }

    public Goal() {}

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }
    public String getDate() { return date; }
    public void setDate(String date) { this.date = date; }
    public int getTargetMinutes() { return targetMinutes; }
    public void setTargetMinutes(int targetMinutes) { this.targetMinutes = targetMinutes; }
    public int getMinutesLogged() { return minutesLogged; }
    public void setMinutesLogged(int minutesLogged) { this.minutesLogged = minutesLogged; }
    public String getFocus() { return focus; }
    public void setFocus(String focus) { this.focus = focus; }
    public boolean isCompleted() { return completed; }
    public void setCompleted(boolean completed) { this.completed = completed; }
    public Instant getCreatedAt() { return createdAt; }
}
