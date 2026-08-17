package com.devagent.snippets.dto;

import jakarta.validation.constraints.NotBlank;
import java.util.List;

public class CreateSnippetRequest {
    @NotBlank private String title;
    @NotBlank private String code;
    @NotBlank private String language;
    private List<String> tags;
    private String description;

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getCode() { return code; }
    public void setCode(String code) { this.code = code; }
    public String getLanguage() { return language; }
    public void setLanguage(String language) { this.language = language; }
    public List<String> getTags() { return tags; }
    public void setTags(List<String> tags) { this.tags = tags; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
}
