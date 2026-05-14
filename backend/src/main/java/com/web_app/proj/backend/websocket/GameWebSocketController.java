package com.web_app.proj.backend.websocket;

import java.util.HashMap;
import java.util.Map;

import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.web_app.proj.backend.model.Game;
import com.web_app.proj.backend.model.GameStatus;
import com.web_app.proj.backend.service.ChatService;
import com.web_app.proj.backend.service.GameService;

@Controller
public class GameWebSocketController {

    private final SimpMessagingTemplate messagingTemplate;
    private final GameService gameService;
    private final ChatService chatService;
    private final ObjectMapper mapper = new ObjectMapper();

    public GameWebSocketController(SimpMessagingTemplate messagingTemplate,
                                   GameService gameService,
                                   ChatService chatService) {
        this.messagingTemplate = messagingTemplate;
        this.gameService = gameService;
        this.chatService = chatService;
    }

    @MessageMapping("/game/{id}/join")
    public void joinGame(@DestinationVariable Long id, @Payload String username) {
        gameService.getGame(id).ifPresent(game -> {
            Map<String, Object> state = gameService.parseState(game.getState());
            messagingTemplate.convertAndSend("/topic/game/" + id + "/state", state);
        });
    }

    @MessageMapping("/game/{id}/move")
    public void handleMove(@DestinationVariable Long id, @Payload String payloadJson) {
        try {
            Map<String, Object> payload = mapper.readValue(payloadJson, Map.class);

            Object subObj = payload.get("sub");
            Object cellObj = payload.get("cell");
            if (subObj instanceof Integer && cellObj instanceof Integer) {
                try {
                    gameService.recordMove(id, (int) subObj, (int) cellObj);
                } catch (Exception e) {
                    System.err.println("[WS] recordMove failed (non-critical): " + e.getMessage());
                }
            }

            Map<String, Object> state = new HashMap<>(payload);
            state.remove("sub");
            state.remove("cell");
            String stateJson = mapper.writeValueAsString(state);
            gameService.updateState(id, stateJson);
            messagingTemplate.convertAndSend("/topic/game/" + id + "/state", state);

            Object winner = state.get("globalWinner");
            if (winner != null && !winner.toString().isEmpty() && !"null".equals(winner.toString())) {
                gameService.finalizeGame(id, winner.toString());
                messagingTemplate.convertAndSend("/topic/game/" + id, "[END] Winner: " + winner);
            }

        } catch (Exception e) {
            System.err.println("[WS] handleMove critical error: " + e.getMessage());
            e.printStackTrace();
        }
    }

    @MessageMapping("/game/{id}/leave")
    public void leaveGame(@DestinationVariable Long id, @Payload String username) {
        gameService.getGame(id).ifPresent(game -> {
            if (game.getStatus() == GameStatus.RUNNING) {
                messagingTemplate.convertAndSend("/topic/game/" + id, "[PLAYER_LEFT] " + username);
            }
        });
    }

    @MessageMapping("/game/{id}/abandon")
    public void abandonGame(@DestinationVariable Long id, @Payload String abandoner) {
        Game game = gameService.getGame(id).orElseThrow();

        if (game.getStatus() != GameStatus.RUNNING) return;
        if (game.getPlayer1() == null || game.getPlayer2() == null) return;

        String winnerSymbol = game.getPlayer1().getUsername().equals(abandoner) ? "O" : "X";

        try {
            Map<String, Object> state = gameService.parseState(game.getState());
            state.put("globalWinner", winnerSymbol);
            String stateJson = mapper.writeValueAsString(state);
            gameService.updateState(id, stateJson);
            messagingTemplate.convertAndSend("/topic/game/" + id + "/state", state);
        } catch (Exception e) {
            System.err.println("[WS] abandonGame state update failed: " + e.getMessage());
        }

        gameService.finalizeGame(id, winnerSymbol);
        messagingTemplate.convertAndSend("/topic/game/" + id, "[ABANDON] " + abandoner);
    }

    @MessageMapping("/game/{id}/end")
    public void endGame(@DestinationVariable Long id, @Payload String winnerName) {
        gameService.finalizeGame(id, winnerName);
        messagingTemplate.convertAndSend("/topic/game/" + id, "[END] Winner: " + winnerName);
    }

    // ─── Chat ─────────────────────────────────────────────────────────────

    @MessageMapping("/game/{id}/chat")
    public void handleChat(@DestinationVariable Long id, @Payload String payloadJson) {
        try {
            Map<String, Object> payload = mapper.readValue(payloadJson, Map.class);
            String username = (String) payload.get("username");
            String content = (String) payload.get("content");
            if (username == null || content == null) return;
            chatService.sendMessage(id, username, content);
        } catch (Exception e) {
            System.err.println("[WS] chat error: " + e.getMessage());
        }
    }

    // ─── Rematch ──────────────────────────────────────────────────────────

    @MessageMapping("/game/{id}/rematch/request")
    public void rematchRequest(@DestinationVariable Long id, @Payload String username) {
        messagingTemplate.convertAndSend("/topic/game/" + id, "[REMATCH_REQUEST] " + username);
    }

    @MessageMapping("/game/{id}/rematch/decline")
    public void rematchDecline(@DestinationVariable Long id, @Payload String username) {
        messagingTemplate.convertAndSend("/topic/game/" + id, "[REMATCH_DECLINED] " + username);
    }

    @MessageMapping("/game/{id}/rematch/accept")
    public void rematchAccept(@DestinationVariable Long id, @Payload String username) {
        Game original = gameService.getGame(id).orElseThrow();
        if (original.getPlayer1() == null || original.getPlayer2() == null) return;

        String p1 = original.getPlayer1().getUsername();
        String p2 = original.getPlayer2().getUsername();

        Game newGame = gameService.createGame(p1);
        gameService.joinGame(newGame.getId(), p2);

        messagingTemplate.convertAndSend("/topic/game/" + id, "[REMATCH_ACCEPTED] " + newGame.getId());
    }
}