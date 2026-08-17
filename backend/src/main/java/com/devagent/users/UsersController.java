package com.devagent.users;

import com.devagent.security.DevAgentPrincipal;
import com.devagent.users.dto.UpsertUserRequest;
import jakarta.validation.Valid;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/users")
public class UsersController {

    private final UsersService usersService;

    public UsersController(UsersService usersService) {
        this.usersService = usersService;
    }

    @PutMapping("/me")
    public User upsert(@AuthenticationPrincipal DevAgentPrincipal principal,
                       @Valid @RequestBody UpsertUserRequest req) {
        return usersService.upsert(principal.getUid(), req);
    }

    @GetMapping("/me")
    public User getMe(@AuthenticationPrincipal DevAgentPrincipal principal) {
        return usersService.findOne(principal.getUid());
    }
}
