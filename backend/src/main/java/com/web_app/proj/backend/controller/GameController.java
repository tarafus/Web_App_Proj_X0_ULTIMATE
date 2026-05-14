package com.web_app.proj.backend.controller;

import com.web_app.proj.backend.dto.ChatMessageDTO;
import com.web_app.proj.backend.dto.GameDTO;
import com.web_app.proj.backend.mapper.GameMapper;
import com.web_app.proj.backend.model.Game;
import com.web_app.proj.backend.model.NotificationType;
import com.web_app.proj.backend.service.ChatService;
import com.web_app.proj.backend.service.GameService;
import com.web_app.proj.backend.service.NotificationService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/game")
public class GameController {

    private final GameService gameService;
    private final ChatService chatService;
    private final NotificationService notificationService;

    public GameController(GameService gameService,
                          ChatService chatService,
                          NotificationService notificationService) {
        this.gameService = gameService;
        this.chatService = chatService;
        this.notificationService = notificationService;
    }

    @PostMapping("/create")
    public GameDTO createGame(@RequestAttribute("username") String username) {
        return GameMapper.toDTO(gameService.createGame(username));
    }

    @PostMapping("/join/{id}")
    public GameDTO joinGame(@PathVariable Long id,
                            @RequestAttribute("username") String username) {
        return GameMapper.toDTO(gameService.joinGame(id, username));
    }

    @GetMapping("/{id}")
    public GameDTO getGame(@PathVariable Long id) {
        return GameMapper.toDTO(gameService.getGame(id).orElseThrow());
    }

    @GetMapping("/{id}/state")
    public Map<String, Object> getState(@PathVariable Long id) {
        Game g = gameService.getGame(id).orElseThrow();
        return gameService.parseState(g.getState());
    }

    @GetMapping("/ongoing")
    public List<GameDTO> getOngoing(@RequestAttribute("username") String username) {
        return gameService.getOngoingGamesForUser(username).stream()
                .map(GameMapper::toDTO).toList();
    }

    @PostMapping("/{id}/ping")
    public ResponseEntity<Void> ping(@PathVariable Long id,
                                     @RequestAttribute("username") String username) {
        Game game = gameService.getGame(id).orElseThrow();
        String other;
        if (game.getPlayer1() != null && game.getPlayer1().getUsername().equals(username)) {
            other = game.getPlayer2() != null ? game.getPlayer2().getUsername() : null;
        } else {
            other = game.getPlayer1() != null ? game.getPlayer1().getUsername() : null;
        }
        if (other != null) {
            notificationService.create(
                    other,
                    NotificationType.REMINDER,
                    username + " vous attend pour finir la partie",
                    id,
                    null,
                    username
            );
        }
        return ResponseEntity.ok().build();
    }

    @GetMapping("/{id}/messages")
    public List<ChatMessageDTO> getMessages(@PathVariable Long id) {
        return chatService.getMessages(id);
    }
}