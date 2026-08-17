package com.devagent.notes.dto;

import java.util.List;

public class UpdateNoteRequest {
    private String title;
    private String content;
    private List<String> tags;
    private Boolean pinned;

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }
    public List<String> getTags() { return tags; }
    public void setTags(List<String> tags) { this.tags = tags; }
    public Boolean getPinned() { return pinned; }
    public void setPinned(Boolean pinned) { this.pinned = pinned; }
}
