package com.web_app.proj.backend.controller;

import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.web_app.proj.backend.dto.AIMoveRequest;
import com.web_app.proj.backend.dto.AIMoveResponse;
import com.web_app.proj.backend.service.AIService;

@RestController
@RequestMapping("/ai")
public class AIController {

    private final AIService aiService;

    public AIController(AIService aiService) {
        this.aiService = aiService;
    }

    @PostMapping("/move")
    public AIMoveResponse computeMove(@RequestBody AIMoveRequest req) {
        long start = System.currentTimeMillis();

        AIService.Move move = aiService.computeMove(
                req.getBoard(),
                req.getSubWinners(),
                req.getCurrentPlayer(),
                req.getActiveSubBoard(),
                req.getDifficulty()
        );

        long elapsed = System.currentTimeMillis() - start;
        System.out.println("[AI] " + req.getDifficulty() + " → sub=" + move.sub
                + ", cell=" + move.cell + " (" + elapsed + " ms)");

        return new AIMoveResponse(move.sub, move.cell);
    }
}