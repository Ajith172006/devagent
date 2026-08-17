package com.devagent.goals;

import com.devagent.goals.dto.CreateGoalRequest;
import com.devagent.goals.dto.LogProgressRequest;
import com.devagent.security.DevAgentPrincipal;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/goals")
public class GoalsController {

    private final GoalsService goalsService;

    public GoalsController(GoalsService goalsService) {
        this.goalsService = goalsService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Goal setGoal(@AuthenticationPrincipal DevAgentPrincipal principal,
                        @Valid @RequestBody CreateGoalRequest req) {
        return goalsService.setGoal(principal.getUid(), req);
    }

    @GetMapping
    public List<Goal> findAll(@AuthenticationPrincipal DevAgentPrincipal principal) {
        return goalsService.findAll(principal.getUid());
    }

    @GetMapping("/streak")
    public Map<String, Object> getStreak(@AuthenticationPrincipal DevAgentPrincipal principal) {
        return goalsService.getStreak(principal.getUid());
    }

    @GetMapping("/{date}")
    public Goal findByDate(@AuthenticationPrincipal DevAgentPrincipal principal,
                            @PathVariable String date) {
        return goalsService.findByDate(principal.getUid(), date);
    }

    @PutMapping("/{date}/progress")
    public Goal logProgress(@AuthenticationPrincipal DevAgentPrincipal principal,
                             @PathVariable String date,
                             @Valid @RequestBody LogProgressRequest req) {
        return goalsService.logProgress(principal.getUid(), date, req);
    }

    @DeleteMapping("/{date}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void remove(@AuthenticationPrincipal DevAgentPrincipal principal,
                       @PathVariable String date) {
        goalsService.remove(principal.getUid(), date);
    }
}
