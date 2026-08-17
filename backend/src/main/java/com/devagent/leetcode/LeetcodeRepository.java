package com.devagent.leetcode;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface LeetcodeRepository extends JpaRepository<LeetcodeEntry, String> {
    List<LeetcodeEntry> findByUserIdOrderByUpdatedAtDesc(String userId);
    Optional<LeetcodeEntry> findByIdAndUserId(String id, String userId);
    List<LeetcodeEntry> findAllByOrderByUpdatedAtDesc();
    List<LeetcodeEntry> findByUserId(String userId);
}
