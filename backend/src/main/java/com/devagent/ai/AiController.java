package com.devagent.ai;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/ai")
public class AiController {

    private final AiService aiService;

    public AiController(AiService aiService) {
        this.aiService = aiService;
    }

    @PostMapping("/debug")
    public Map<String, String> debug(@Valid @RequestBody DebugRequest req) {
        return Map.of("result", aiService.debugCode(
                req.getCode(), req.getLanguage(),
                req.getErrorMessage(), req.getContext()));
    }

    @PostMapping("/explain")
    public Map<String, String> explain(@Valid @RequestBody ExplainRequest req) {
        return Map.of("result", aiService.explainCode(
                req.getCode(), req.getLanguage(), req.getLevel()));
    }

    // ── Inner DTOs ────────────────────────────────────────────────────────────

    public static class DebugRequest {
        @NotBlank private String code;
        private String language;
        private String errorMessage;
        private String context;

        public DebugRequest() {}

        public String getCode() { return code; }
        public void setCode(String code) { this.code = code; }
        public String getLanguage() { return language; }
        public void setLanguage(String language) { this.language = language; }
        public String getErrorMessage() { return errorMessage; }
        public void setErrorMessage(String errorMessage) { this.errorMessage = errorMessage; }
        public String getContext() { return context; }
        public void setContext(String context) { this.context = context; }
    }

    public static class ExplainRequest {
        @NotBlank private String code;
        private String language;
        private String level; // beginner | intermediate | expert

        public ExplainRequest() {}

        public String getCode() { return code; }
        public void setCode(String code) { this.code = code; }
        public String getLanguage() { return language; }
        public void setLanguage(String language) { this.language = language; }
        public String getLevel() { return level; }
        public void setLevel(String level) { this.level = level; }
    }
}
