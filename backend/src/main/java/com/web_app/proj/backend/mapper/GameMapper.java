// src/main/java/com/web_app/proj/backend/mapper/GameMapper.java
package com.web_app.proj.backend.mapper;

import com.web_app.proj.backend.dto.GameDTO;
import com.web_app.proj.backend.model.Game;

public class GameMapper {

    public static GameDTO toDTO(Game game) {
        GameDTO dto = new GameDTO();

        dto.id = game.getId();

        dto.player1Id = game.getPlayer1() != null ? game.getPlayer1().getId() : null;
        dto.player2Id = game.getPlayer2() != null ? game.getPlayer2().getId() : null;
        dto.player1Username = game.getPlayer1() != null ? game.getPlayer1().getUsername() : null;
        dto.player2Username = game.getPlayer2() != null ? game.getPlayer2().getUsername() : null;
        dto.winnerId = game.getWinner() != null ? game.getWinner().getId() : null;

        dto.state = game.getState();
        dto.status = game.getStatus().name();

        dto.eloChangeP1 = game.getEloChangeP1();
        dto.eloChangeP2 = game.getEloChangeP2();

        dto.createdAt = game.getCreatedAt();
        dto.finishedAt = game.getFinishedAt();

        return dto;
    }
}