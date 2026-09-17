package com.devagent.users;

import com.devagent.ai.AiService;
import com.devagent.users.dto.UpsertUserRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Objects;

@Service
public class UsersService {

    private static final Logger log = LoggerFactory.getLogger(UsersService.class);

    private final UserRepository repo;
    private final AiService aiService;

    public UsersService(UserRepository repo, AiService aiService) {
        this.repo = repo;
        this.aiService = aiService;
    }

    public User upsert(String uid, UpsertUserRequest req) {
        User user = repo.findById(uid).orElse(null);
        if (user == null) {
            user = new User();
            user.setId(uid);
        }
        if (req.getName() != null) user.setName(req.getName());
        if (req.getProfession() != null) user.setProfession(req.getProfession());
        if (req.getAge() != null) user.setAge(req.getAge());
        if (req.getGender() != null) user.setGender(req.getGender());
        if (req.getEmail() != null) user.setEmail(req.getEmail());
        if (req.getPhotoUrl() != null) user.setPhotoUrl(req.getPhotoUrl());

        boolean resumeChanged = req.getResumeText() != null
                && !Objects.equals(req.getResumeText(), user.getResumeText());
        boolean forceAnalyze = Boolean.TRUE.equals(req.getForceAnalyze());

        if (req.getResumeText() != null) user.setResumeText(req.getResumeText());

        if ((resumeChanged || forceAnalyze) && user.getResumeText() != null && !user.getResumeText().isBlank()) {
            try {
                user.setResumeAnalysis(aiService.analyzeResume(user.getResumeText()));
            } catch (Exception e) {
                log.warn("Failed to analyze resume for user {}: {}", uid, e.getMessage());
            }
        }
        return repo.save(user);
    }

    public User findOne(String uid) {
        return repo.findById(uid)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "User " + uid + " not found"));
    }

    public List<User> findAll() {
        return repo.findAllByOrderByCreatedAtDesc();
    }

    public void remove(String uid) {
        repo.delete(findOne(uid));
    }
}
