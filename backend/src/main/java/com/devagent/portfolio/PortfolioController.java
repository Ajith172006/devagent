package com.devagent.portfolio;

import com.devagent.security.DevAgentPrincipal;
import org.springframework.http.MediaType;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/portfolio")
public class PortfolioController {

    private final PortfolioService portfolioService;

    public PortfolioController(PortfolioService portfolioService) {
        this.portfolioService = portfolioService;
    }

    @GetMapping
    public Map<String, Object> generate(
            @AuthenticationPrincipal DevAgentPrincipal principal,
            @RequestParam(required = false) String githubUsername) {
        return portfolioService.generate(principal.getUid(), githubUsername);
    }

    /** Public export endpoint — userId passed as query param so /portfolio/export link works */
    @GetMapping(value = "/export", produces = MediaType.TEXT_HTML_VALUE)
    public String export(
            @RequestParam(required = false) String userId,
            @RequestParam(required = false) String githubUsername,
            @RequestParam(required = false) String displayName,
            @RequestParam(required = false, defaultValue = "true") boolean includeLeetcode,
            @AuthenticationPrincipal DevAgentPrincipal principal) {

        // Prefer the authenticated user's uid; fall back to query param for direct link
        String uid = (principal != null) ? principal.getUid() : userId;
        if (uid == null || uid.isBlank()) {
            throw new org.springframework.web.server.ResponseStatusException(
                    org.springframework.http.HttpStatus.BAD_REQUEST, "userId is required");
        }
        return portfolioService.generateHtml(uid, githubUsername, displayName, includeLeetcode);
    }
}
