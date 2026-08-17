package com.devagent.notes;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface NoteRepository extends JpaRepository<Note, String> {
    List<Note> findByUserIdOrderByPinnedDescUpdatedAtDesc(String userId);
    Optional<Note> findByIdAndUserId(String id, String userId);
    List<Note> findAllByOrderByUpdatedAtDesc();
}
