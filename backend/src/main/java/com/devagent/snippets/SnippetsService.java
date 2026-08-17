package com.devagent.snippets;

import com.devagent.snippets.dto.CreateSnippetRequest;
import com.devagent.snippets.dto.UpdateSnippetRequest;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class SnippetsService {

    private final SnippetRepository repo;

    public SnippetsService(SnippetRepository repo) {
        this.repo = repo;
    }

    public Snippet create(String userId, CreateSnippetRequest req) {
        Snippet s = new Snippet();
        s.setUserId(userId);
        s.setTitle(req.getTitle());
        s.setCode(req.getCode());
        s.setLanguage(req.getLanguage());
        s.setTags(req.getTags() != null ? req.getTags() : List.of());
        s.setDescription(req.getDescription());
        return repo.save(s);
    }

    public List<Snippet> findAll(String userId, String language, String tag, String search) {
        List<Snippet> all = repo.findByUserIdOrderByUpdatedAtDesc(userId);
        return all.stream()
                .filter(s -> language == null || s.getLanguage().equalsIgnoreCase(language))
                .filter(s -> tag == null || s.getTags().stream()
                        .anyMatch(t -> t.equalsIgnoreCase(tag)))
                .filter(s -> search == null || (s.getTitle() + " " + s.getCode()
                        + " " + (s.getDescription() != null ? s.getDescription() : ""))
                        .toLowerCase().contains(search.toLowerCase()))
                .collect(Collectors.toList());
    }

    public List<Snippet> findAllAdmin() {
        return repo.findAllByOrderByUpdatedAtDesc();
    }

    public Snippet findOne(String userId, String id) {
        return repo.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "Snippet " + id + " not found"));
    }

    public Snippet update(String userId, String id, UpdateSnippetRequest req) {
        Snippet s = findOne(userId, id);
        if (req.getTitle() != null) s.setTitle(req.getTitle());
        if (req.getCode() != null) s.setCode(req.getCode());
        if (req.getLanguage() != null) s.setLanguage(req.getLanguage());
        if (req.getTags() != null) s.setTags(req.getTags());
        if (req.getDescription() != null) s.setDescription(req.getDescription());
        return repo.save(s);
    }

    public void remove(String userId, String id) {
        Snippet s = findOne(userId, id);
        repo.delete(s);
    }

    public void adminRemove(String id) {
        repo.findById(id).ifPresentOrElse(repo::delete,
                () -> { throw new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "Snippet " + id + " not found"); });
    }
}
