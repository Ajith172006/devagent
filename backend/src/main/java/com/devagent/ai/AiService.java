package com.devagent.ai;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import okhttp3.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;

@Service
public class AiService {

    private static final String BASE =
            "https://generativelanguage.googleapis.com/v1beta/models/";
    private static final MediaType JSON = MediaType.get("application/json");

    private final OkHttpClient httpClient = new OkHttpClient.Builder()
            .callTimeout(java.time.Duration.ofSeconds(120))
            .build();
    private final ObjectMapper mapper = new ObjectMapper();

    @Value("${gemini.api-key:}")
    private String apiKey;

    @Value("${gemini.model:gemini-2.5-flash}")
    private String model;

    // ── Core call ────────────────────────────────────────────────────────────

    private String generate(ObjectNode requestBody) {
        if (apiKey == null || apiKey.isBlank()) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR,
                    "GEMINI_API_KEY is not set.");
        }
        String url = BASE + model + ":generateContent?key=" + apiKey;
        try {
            RequestBody body = RequestBody.create(mapper.writeValueAsString(requestBody), JSON);
            Request req = new Request.Builder().url(url).post(body).build();
            try (Response res = httpClient.newCall(req).execute()) {
                String responseStr = res.body().string();
                if (!res.isSuccessful()) {
                    throw new ResponseStatusException(HttpStatus.BAD_GATEWAY,
                            "Gemini API error: " + res.code() + " " + responseStr);
                }
                JsonNode root = mapper.readTree(responseStr);
                return root.path("candidates").get(0)
                        .path("content").path("parts").get(0)
                        .path("text").asText();
            }
        } catch (ResponseStatusException e) {
            throw e;
        } catch (IOException e) {
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY,
                    "Failed to reach Gemini API: " + e.getMessage());
        }
    }

    private ObjectNode textRequest(String prompt) {
        ObjectNode body = mapper.createObjectNode();
        ArrayNode contents = body.putArray("contents");
        ObjectNode content = contents.addObject();
        ArrayNode parts = content.putArray("parts");
        parts.addObject().put("text", prompt);
        ObjectNode config = body.putObject("generationConfig");
        config.put("maxOutputTokens", 2000);
        return body;
    }

    // ── Public methods ────────────────────────────────────────────────────────

    public String debugCode(String code, String language, String errorMessage, String context) {
        String lang = language != null ? language : "";
        String prompt = String.join("\n",
                "You are an expert " + lang + " debugger helping a developer inside \"DevAgent\".",
                "Analyze the following code" + (errorMessage != null ? " and error below" : "") + " and identify bugs.",
                "",
                "```" + lang,
                code,
                "```",
                errorMessage != null ? "\nError message:\n" + errorMessage : "",
                context != null ? "\nAdditional context:\n" + context : "",
                "",
                "Respond in this exact structure:",
                "1. **Root cause** — concise explanation of what is wrong.",
                "2. **Fix** — corrected code in a fenced code block.",
                "3. **Why it works** — short explanation of the fix.",
                "4. **Prevention tip** — one tip to avoid this class of bug."
        );
        return generate(textRequest(prompt));
    }

    public String explainCode(String code, String language, String level) {
        String lang = language != null ? language : "";
        String lvl = level != null ? level : "intermediate";
        String prompt = String.join("\n",
                "Explain the following " + lang + " code to a developer at a " + lvl + " level.",
                "Cover: what it does overall, how it works step by step, and notable patterns, edge cases, or issues.",
                "",
                "```" + lang,
                code,
                "```"
        );
        return generate(textRequest(prompt));
    }

    public String analyzeResume(String base64DataUrl) {
        if (!base64DataUrl.contains(";base64,")) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Invalid data URL format.");
        }
        String[] parts = base64DataUrl.split(";base64,", 2);
        String mimeType = parts[0].replace("data:", "");
        String base64Data = parts[1];

        String promptText = """
                Analyze the attached resume and extract key details into valid JSON only (no markdown).
                Structure: { "name", "profession", "contact": { "email","phone","location","github","linkedin","portfolio" },
                "summary", "skills": [], "experience": [{"role","company","duration","description"}],
                "projects": [{"title","description","tech":[]}],
                "education": [{"degree","school","duration","score"}],
                "certifications": [{"name","authority","date"}] }
                """;

        ObjectNode body = mapper.createObjectNode();
        ArrayNode contents = body.putArray("contents");
        ObjectNode content = contents.addObject();
        ArrayNode partsList = content.putArray("parts");

        partsList.addObject().put("text", promptText);

        ObjectNode filePart = partsList.addObject();
        ObjectNode inlineData = filePart.putObject("inlineData");
        inlineData.put("mimeType", mimeType);
        inlineData.put("data", base64Data);

        return generate(body);
    }
}
