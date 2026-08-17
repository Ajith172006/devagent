package com.devagent.users.dto;

import jakarta.validation.constraints.NotBlank;

public class UpsertUserRequest {
    @NotBlank private String name;
    private String profession;
    private String age;
    private String gender;
    private String email;
    private String photoUrl;
    private String resumeText;
    private Boolean forceAnalyze;

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
    public Boolean getForceAnalyze() { return forceAnalyze; }
    public void setForceAnalyze(Boolean forceAnalyze) { this.forceAnalyze = forceAnalyze; }
}
