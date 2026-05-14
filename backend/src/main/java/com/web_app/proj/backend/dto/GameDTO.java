// src/main/java/com/web_app/proj/backend/dto/GameDTO.java
package com.web_app.proj.backend.dto;

import java.time.LocalDateTime;

public class GameDTO {

    public Long id;

    public Long player1Id;
    public Long player2Id;
    public String player1Username;
    public String player2Username;
    public Long winnerId;

    public String state;
    public String status;

    public int eloChangeP1;
    public int eloChangeP2;

    public LocalDateTime createdAt;
    public LocalDateTime finishedAt;
}