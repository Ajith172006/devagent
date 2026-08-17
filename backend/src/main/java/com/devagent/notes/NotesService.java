package com.devagent.notes;

import com.devagent.notes.dto.CreateNoteRequest;
import com.devagent.notes.dto.UpdateNoteRequest;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class NotesService {

    private final NoteRepository repo;

    public NotesService(NoteRepository repo) {
        this.repo = repo;
    }

    public Note create(String userId, CreateNoteRequest req) {
        Note n = new Note();
        n.setUserId(userId);
        n.setTitle(req.getTitle());
        n.setContent(req.getContent());
        n.setTags(req.getTags() != null ? req.getTags() : List.of());
        n.setPinned(Boolean.TRUE.equals(req.getPinned()));
        return repo.save(n);
    }

    public List<Note> findAll(String userId, String search) {
        List<Note> all = repo.findByUserIdOrderByPinnedDescUpdatedAtDesc(userId);
        if (search == null || search.isBlank()) return all;
        String needle = search.toLowerCase();
        return all.stream()
                .filter(n -> (n.getTitle() + " " + n.getContent()).toLowerCase().contains(needle))
                .collect(Collectors.toList());
    }

    public List<Note> findAllAdmin() {
        return repo.findAllByOrderByUpdatedAtDesc();
    }

    public Note findOne(String userId, String id) {
        return repo.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "Note " + id + " not found"));
    }

    public Note update(String userId, String id, UpdateNoteRequest req) {
        Note n = findOne(userId, id);
        if (req.getTitle() != null) n.setTitle(req.getTitle());
        if (req.getContent() != null) n.setContent(req.getContent());
        if (req.getTags() != null) n.setTags(req.getTags());
        if (req.getPinned() != null) n.setPinned(req.getPinned());
        return repo.save(n);
    }

    public void remove(String userId, String id) {
        Note n = findOne(userId, id);
        repo.delete(n);
    }

    public void adminRemove(String id) {
        repo.findById(id).ifPresentOrElse(repo::delete,
                () -> { throw new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "Note " + id + " not found"); });
    }
}
