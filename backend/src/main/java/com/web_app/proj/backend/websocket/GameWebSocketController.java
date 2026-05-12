package com.web_app.proj.backend.websocket;

import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import com.web_app.proj.backend.dto.GameDTO;
import com.web_app.proj.backend.mapper.GameMapper;
import com.web_app.proj.backend.model.Game;
import com.web_app.proj.backend.service.GameService;

@Controller
public class GameWebSocketController {

    private final SimpMessagingTemplate messagingTemplate;
    private final GameService gameService;

    public GameWebSocketController(SimpMessagingTemplate messagingTemplate, GameService gameService) {
        this.messagingTemplate = messagingTemplate;
        this.gameService = gameService;
    }

    // Lorsqu'un joueur rejoint la room WebSocket
    @MessageMapping("/game/{id}/join")
    public void joinGame(@DestinationVariable Long id, @Payload String username) {

        Game game = gameService.getGame(id).orElseThrow();
        GameDTO dto = GameMapper.toDTO(game);

        messagingTemplate.convertAndSend(
                "/topic/game/" + id,
                "[JOIN] " + username
        );

        messagingTemplate.convertAndSend(
                "/topic/game/" + id + "/state",
                dto
        );
    }

    // Lorsqu'un joueur joue un coup
    @MessageMapping("/game/{id}/move")
    public void handleMove(@DestinationVariable Long id, @Payload String newState) {

        Game updated = gameService.updateState(id, newState);
        GameDTO dto = GameMapper.toDTO(updated);

        messagingTemplate.convertAndSend(
                "/topic/game/" + id + "/state",
                dto
        );
    }

    // Lorsqu'un joueur termine la partie
    @MessageMapping("/game/{id}/end")
    public void endGame(@DestinationVariable Long id, @Payload String winnerName) {

        messagingTemplate.convertAndSend(
                "/topic/game/" + id,
                "[END] Winner: " + winnerName
        );
    }
}
