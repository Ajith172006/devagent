package com.devagent.snippets;

import com.devagent.security.DevAgentPrincipal;
import com.devagent.snippets.dto.CreateSnippetRequest;
import com.devagent.snippets.dto.UpdateSnippetRequest;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/snippets")
public class SnippetsController {

    private final SnippetsService snippetsService;

    public SnippetsController(SnippetsService snippetsService) {
        this.snippetsService = snippetsService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Snippet create(@AuthenticationPrincipal DevAgentPrincipal principal,
                          @Valid @RequestBody CreateSnippetRequest req) {
        return snippetsService.create(principal.getUid(), req);
    }

    @GetMapping
    public List<Snippet> findAll(@AuthenticationPrincipal DevAgentPrincipal principal,
                                  @RequestParam(required = false) String language,
                                  @RequestParam(required = false) String tag,
                                  @RequestParam(required = false) String search) {
        return snippetsService.findAll(principal.getUid(), language, tag, search);
    }

    @GetMapping("/{id}")
    public Snippet findOne(@AuthenticationPrincipal DevAgentPrincipal principal,
                            @PathVariable String id) {
        return snippetsService.findOne(principal.getUid(), id);
    }

    @PatchMapping("/{id}")
    public Snippet update(@AuthenticationPrincipal DevAgentPrincipal principal,
                           @PathVariable String id,
                           @RequestBody UpdateSnippetRequest req) {
        return snippetsService.update(principal.getUid(), id, req);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void remove(@AuthenticationPrincipal DevAgentPrincipal principal,
                       @PathVariable String id) {
        snippetsService.remove(principal.getUid(), id);
    }
}
