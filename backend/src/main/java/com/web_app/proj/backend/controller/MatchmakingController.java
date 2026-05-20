package com.web_app.proj.backend.controller;

import java.util.Map;

import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestAttribute;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.web_app.proj.backend.service.MatchmakingService;

@RestController
@RequestMapping("/matchmaking")
public class MatchmakingController {

    private final MatchmakingService matchmakingService;

    public MatchmakingController(MatchmakingService matchmakingService) {
        this.matchmakingService = matchmakingService;
    }

    @PostMapping("/join")
    public Map<String, String> join(@RequestAttribute("username") String username) {
        String status = matchmakingService.join(username);
        return Map.of("status", status);
    }

    @PostMapping("/leave")
    public void leave(@RequestAttribute("username") String username) {
        matchmakingService.leave(username);
    }
}