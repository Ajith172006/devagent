package com.devagent.goals;

import com.devagent.goals.dto.CreateGoalRequest;
import com.devagent.goals.dto.LogProgressRequest;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
public class GoalsService {

    private final GoalRepository repo;

    public GoalsService(GoalRepository repo) {
        this.repo = repo;
    }

    public Goal setGoal(String userId, CreateGoalRequest req) {
        Goal goal = repo.findByUserIdAndDate(userId, req.getDate()).orElse(null);
        if (goal != null) {
            goal.setTargetMinutes(req.getTargetMinutes());
            if (req.getFocus() != null) goal.setFocus(req.getFocus());
            goal.setCompleted(goal.getMinutesLogged() >= goal.getTargetMinutes());
        } else {
            goal = new Goal();
            goal.setUserId(userId);
            goal.setDate(req.getDate());
            goal.setTargetMinutes(req.getTargetMinutes());
            goal.setFocus(req.getFocus());
            goal.setMinutesLogged(0);
            goal.setCompleted(false);
        }
        return repo.save(goal);
    }

    public List<Goal> findAll(String userId) {
        return repo.findByUserIdOrderByDateDesc(userId);
    }

    public List<Goal> findAllAdmin() {
        return repo.findAllByOrderByDateDesc();
    }

    public Goal findByDate(String userId, String date) {
        return repo.findByUserIdAndDate(userId, date)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "No goal set for " + date));
    }

    public Goal logProgress(String userId, String date, LogProgressRequest req) {
        Goal goal = findByDate(userId, date);
        goal.setMinutesLogged(goal.getMinutesLogged() + req.getMinutes());
        goal.setCompleted(goal.getMinutesLogged() >= goal.getTargetMinutes());
        return repo.save(goal);
    }

    public void remove(String userId, String date) {
        Goal goal = findByDate(userId, date);
        repo.delete(goal);
    }

    public void adminRemove(String id) {
        repo.findById(id).ifPresentOrElse(repo::delete,
                () -> { throw new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "Goal " + id + " not found"); });
    }

    public Map<String, Object> getStreak(String userId) {
        List<Goal> completed = repo.findByUserIdAndCompletedTrueOrderByDateAsc(userId);
        List<String> dates = completed.stream().map(Goal::getDate).sorted().toList();

        if (dates.isEmpty()) {
            return Map.of("currentStreak", 0, "longestStreak", 0, "totalCompletedDays", 0);
        }

        // Longest streak
        int longest = 1, running = 1;
        for (int i = 1; i < dates.size(); i++) {
            long diff = daysBetween(dates.get(i - 1), dates.get(i));
            running = (diff == 1) ? running + 1 : 1;
            if (running > longest) longest = running;
        }

        // Current streak — count backward from last completed date
        String today = LocalDate.now().toString();
        String lastDate = dates.get(dates.size() - 1);
        long gapFromToday = daysBetween(lastDate, today);

        int current = 0;
        if (gapFromToday <= 1) {
            current = 1;
            for (int i = dates.size() - 1; i > 0; i--) {
                if (daysBetween(dates.get(i - 1), dates.get(i)) == 1) current++;
                else break;
            }
        }

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("currentStreak", current);
        result.put("longestStreak", longest);
        result.put("totalCompletedDays", dates.size());
        return result;
    }

    private long daysBetween(String from, String to) {
        return LocalDate.parse(to).toEpochDay() - LocalDate.parse(from).toEpochDay();
    }
}
