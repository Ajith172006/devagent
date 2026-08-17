package com.devagent.users;

import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import java.time.Instant;

@Entity
@Table(name = "users")
public class User {

    @Id
    @Column(name = "id", length = 128)
    private String id;

    @Column(nullable = false)
    private String name;

    @Column
    private String profession;

    @Column
    private String age;

    @Column
    private String gender;

    @Column
    private String email;

    @Column(name = "photo_url", columnDefinition = "TEXT")
    private String photoUrl;

    @Column(name = "resume_text", columnDefinition = "TEXT")
    private String resumeText;

    @Column(name = "resume_analysis", columnDefinition = "TEXT")
    private String resumeAnalysis;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private Instant createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private Instant updatedAt;

    public User() {}

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getProfession() { return profession; }
    public void setProfession(String profession) { this.profession = profession; }
    public String getAge() { return age; }
    public void setAge(String age) { this.age = age; }
    public String getGender() { return gender; }
    public void setGender(String gender) { this.gender = gender; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getPhotoUrl() { return photoUrl; }
    public void setPhotoUrl(String photoUrl) { this.photoUrl = photoUrl; }
    public String getResumeText() { return resumeText; }
    public void setResumeText(String resumeText) { this.resumeText = resumeText; }
    public String getResumeAnalysis() { return resumeAnalysis; }
    public void setResumeAnalysis(String resumeAnalysis) { this.resumeAnalysis = resumeAnalysis; }
    public Instant getCreatedAt() { return createdAt; }
    public Instant getUpdatedAt() { return updatedAt; }
}
