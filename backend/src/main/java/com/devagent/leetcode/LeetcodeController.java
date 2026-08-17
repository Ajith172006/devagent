package com.devagent.leetcode;

import com.devagent.leetcode.dto.CreateLeetcodeRequest;
import com.devagent.leetcode.dto.UpdateLeetcodeRequest;
import com.devagent.security.DevAgentPrincipal;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/leetcode")
public class LeetcodeController {

    private final LeetcodeService leetcodeService;

    public LeetcodeController(LeetcodeService leetcodeService) {
        this.leetcodeService = leetcodeService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public LeetcodeEntry create(@AuthenticationPrincipal DevAgentPrincipal principal,
                                 @Valid @RequestBody CreateLeetcodeRequest req) {
        return leetcodeService.create(principal.getUid(), req);
    }

    @GetMapping
    public List<LeetcodeEntry> findAll(@AuthenticationPrincipal DevAgentPrincipal principal,
                                        @RequestParam(required = false) String status,
                                        @RequestParam(required = false) String difficulty,
                                        @RequestParam(required = false) String topic) {
        return leetcodeService.findAll(principal.getUid(), status, difficulty, topic);
    }

    @GetMapping("/stats")
    public Map<String, Object> stats(@AuthenticationPrincipal DevAgentPrincipal principal) {
        return leetcodeService.stats(principal.getUid());
    }

    @GetMapping("/{id}")
    public LeetcodeEntry findOne(@AuthenticationPrincipal DevAgentPrincipal principal,
                                  @PathVariable String id) {
        return leetcodeService.findOne(principal.getUid(), id);
    }

    @PatchMapping("/{id}")
    public LeetcodeEntry update(@AuthenticationPrincipal DevAgentPrincipal principal,
                                 @PathVariable String id,
                                 @RequestBody UpdateLeetcodeRequest req) {
        return leetcodeService.update(principal.getUid(), id, req);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void remove(@AuthenticationPrincipal DevAgentPrincipal principal,
                       @PathVariable String id) {
        leetcodeService.remove(principal.getUid(), id);
    }
}
