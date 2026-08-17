package com.devagent.goals;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface GoalRepository extends JpaRepository<Goal, String> {
    List<Goal> findByUserIdOrderByDateDesc(String userId);
    Optional<Goal> findByUserIdAndDate(String userId, String date);
    List<Goal> findByUserIdAndCompletedTrueOrderByDateAsc(String userId);
    List<Goal> findAllByOrderByDateDesc();
}
