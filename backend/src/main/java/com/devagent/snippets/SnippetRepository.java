package com.devagent.snippets;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SnippetRepository extends JpaRepository<Snippet, String> {
    List<Snippet> findByUserIdOrderByUpdatedAtDesc(String userId);
    Optional<Snippet> findByIdAndUserId(String id, String userId);
    List<Snippet> findAllByOrderByUpdatedAtDesc();
}
