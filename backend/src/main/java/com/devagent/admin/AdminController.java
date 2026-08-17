package com.devagent.admin;

import com.devagent.goals.Goal;
import com.devagent.goals.GoalsService;
import com.devagent.leetcode.LeetcodeEntry;
import com.devagent.leetcode.LeetcodeService;
import com.devagent.notes.Note;
import com.devagent.notes.NotesService;
import com.devagent.snippets.Snippet;
import com.devagent.snippets.SnippetsService;
import com.devagent.users.User;
import com.devagent.users.UsersService;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/admin")
public class AdminController {

    private final UsersService usersService;
    private final SnippetsService snippetsService;
    private final NotesService notesService;
    private final GoalsService goalsService;
    private final LeetcodeService leetcodeService;

    public AdminController(UsersService usersService, SnippetsService snippetsService,
                           NotesService notesService, GoalsService goalsService,
                           LeetcodeService leetcodeService) {
        this.usersService = usersService;
        this.snippetsService = snippetsService;
        this.notesService = notesService;
        this.goalsService = goalsService;
        this.leetcodeService = leetcodeService;
    }

    // ── Overview ──────────────────────────────────────────────────────────────
    @GetMapping("/overview")
    public Map<String, Object> overview() {
        Map<String, Object> counts = new LinkedHashMap<>();
        counts.put("users",    usersService.findAll().size());
        counts.put("snippets", snippetsService.findAllAdmin().size());
        counts.put("notes",    notesService.findAllAdmin().size());
        counts.put("goals",    goalsService.findAllAdmin().size());
        counts.put("leetcode", leetcodeService.findAllAdmin().size());
        return Map.of("counts", counts);
    }

    // ── Users ─────────────────────────────────────────────────────────────────
    @GetMapping("/users")
    public List<User> getAllUsers() { return usersService.findAll(); }

    @GetMapping("/users/{uid}")
    public User getUser(@PathVariable String uid) { return usersService.findOne(uid); }

    @GetMapping("/users/{uid}/data")
    public Map<String, Object> getUserData(@PathVariable String uid) {
        List<Snippet>       snippets = snippetsService.findAll(uid, null, null, null);
        List<Note>          notes    = notesService.findAll(uid, null);
        List<Goal>          goals    = goalsService.findAll(uid);
        List<LeetcodeEntry> leetcode = leetcodeService.findAll(uid, null, null, null);
        Map<String, Object> streak   = goalsService.getStreak(uid);

        Map<String, Object> counts = Map.of(
                "snippets", snippets.size(), "notes", notes.size(),
                "goals", goals.size(), "leetcode", leetcode.size());

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("counts",   counts);
        result.put("streak",   streak);
        result.put("snippets", snippets);
        result.put("notes",    notes);
        result.put("goals",    goals);
        result.put("leetcode", leetcode);
        return result;
    }

    @DeleteMapping("/users/{uid}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteUser(@PathVariable String uid) {
        snippetsService.findAllAdmin().stream()
                .filter(s -> uid.equals(s.getUserId()))
                .forEach(s -> snippetsService.adminRemove(s.getId()));
        notesService.findAllAdmin().stream()
                .filter(n -> uid.equals(n.getUserId()))
                .forEach(n -> notesService.adminRemove(n.getId()));
        goalsService.findAllAdmin().stream()
                .filter(g -> uid.equals(g.getUserId()))
                .forEach(g -> goalsService.adminRemove(g.getId()));
        leetcodeService.findAllAdmin().stream()
                .filter(e -> uid.equals(e.getUserId()))
                .forEach(e -> leetcodeService.adminRemove(e.getId()));
        usersService.remove(uid);
    }

    // ── Snippets ──────────────────────────────────────────────────────────────
    @GetMapping("/snippets")
    public List<Snippet> getAllSnippets() { return snippetsService.findAllAdmin(); }

    @DeleteMapping("/snippets/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteSnippet(@PathVariable String id) { snippetsService.adminRemove(id); }

    @DeleteMapping("/snippets")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteAllSnippets() {
        snippetsService.findAllAdmin().forEach(s -> snippetsService.adminRemove(s.getId()));
    }

    // ── Notes ─────────────────────────────────────────────────────────────────
    @GetMapping("/notes")
    public List<Note> getAllNotes() { return notesService.findAllAdmin(); }

    @DeleteMapping("/notes/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteNote(@PathVariable String id) { notesService.adminRemove(id); }

    @DeleteMapping("/notes")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteAllNotes() {
        notesService.findAllAdmin().forEach(n -> notesService.adminRemove(n.getId()));
    }

    // ── Goals ─────────────────────────────────────────────────────────────────
    @GetMapping("/goals")
    public List<Goal> getAllGoals() { return goalsService.findAllAdmin(); }

    @DeleteMapping("/goals/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteGoal(@PathVariable String id) { goalsService.adminRemove(id); }

    @DeleteMapping("/goals")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteAllGoals() {
        goalsService.findAllAdmin().forEach(g -> goalsService.adminRemove(g.getId()));
    }

    // ── LeetCode ──────────────────────────────────────────────────────────────
    @GetMapping("/leetcode")
    public List<LeetcodeEntry> getAllLeetcode() { return leetcodeService.findAllAdmin(); }

    @DeleteMapping("/leetcode/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteLeetcode(@PathVariable String id) { leetcodeService.adminRemove(id); }

    @DeleteMapping("/leetcode")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteAllLeetcode() {
        leetcodeService.findAllAdmin().forEach(e -> leetcodeService.adminRemove(e.getId()));
    }
}
