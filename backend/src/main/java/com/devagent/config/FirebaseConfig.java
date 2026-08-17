package com.devagent.config;

import com.google.auth.oauth2.GoogleCredentials;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;

import jakarta.annotation.PostConstruct;

@Configuration
public class FirebaseConfig {

    private static final Logger log = LoggerFactory.getLogger(FirebaseConfig.class);

    @Value("${firebase.project-id}")
    private String projectId;

    @PostConstruct
    public void init() {
        if (FirebaseApp.getApps().isEmpty()) {
            try {
                FirebaseOptions options = FirebaseOptions.builder()
                        .setCredentials(GoogleCredentials.getApplicationDefault())
                        .setProjectId(projectId)
                        .build();
                FirebaseApp.initializeApp(options);
                log.info("FirebaseApp initialized with Application Default Credentials.");
            } catch (Exception e) {
                log.warn("Application Default Credentials not found for Firebase ({}), continuing startup...", e.getMessage());
                try {
                    FirebaseOptions options = FirebaseOptions.builder()
                            .setProjectId(projectId)
                            .build();
                    FirebaseApp.initializeApp(options);
                    log.info("FirebaseApp initialized with project ID: {}", projectId);
                } catch (Exception ex) {
                    log.error("Failed to initialize FirebaseApp: {}", ex.getMessage());
                }
            }
        }
    }
}
