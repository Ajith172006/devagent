package com.devagent.notes;

import com.devagent.notes.dto.CreateNoteRequest;
import com.devagent.notes.dto.UpdateNoteRequest;
import com.devagent.security.DevAgentPrincipal;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/notes")
public class NotesController {

    private final NotesService notesService;

    public NotesController(NotesService notesService) {
        this.notesService = notesService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Note create(@AuthenticationPrincipal DevAgentPrincipal principal,
                       @Valid @RequestBody CreateNoteRequest req) {
        return notesService.create(principal.getUid(), req);
    }

    @GetMapping
    public List<Note> findAll(@AuthenticationPrincipal DevAgentPrincipal principal,
                               @RequestParam(required = false) String search) {
        return notesService.findAll(principal.getUid(), search);
    }

    @GetMapping("/{id}")
    public Note findOne(@AuthenticationPrincipal DevAgentPrincipal principal,
                         @PathVariable String id) {
        return notesService.findOne(principal.getUid(), id);
    }

    @PatchMapping("/{id}")
    public Note update(@AuthenticationPrincipal DevAgentPrincipal principal,
                        @PathVariable String id,
                        @RequestBody UpdateNoteRequest req) {
        return notesService.update(principal.getUid(), id, req);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void remove(@AuthenticationPrincipal DevAgentPrincipal principal,
                       @PathVariable String id) {
        notesService.remove(principal.getUid(), id);
    }
}
