package com.web_app.proj.backend.dto;

import java.time.LocalDateTime;

public class GameHistoryDTO {

    private Long gameId;
    private String opponentUsername;
    private String result;     // "WIN", "LOSS", "DRAW"
    private int eloChange;     // peut être négatif
    private int eloAfter;
    private LocalDateTime playedAt;

    public GameHistoryDTO() {}

    public GameHistoryDTO(Long gameId, String opponentUsername, String result,
                          int eloChange, int eloAfter, LocalDateTime playedAt) {
        this.gameId = gameId;
        this.opponentUsername = opponentUsername;
        this.result = result;
        this.eloChange = eloChange;
        this.eloAfter = eloAfter;
        this.playedAt = playedAt;
    }

    public Long getGameId() { return gameId; }
    public void setGameId(Long gameId) { this.gameId = gameId; }
    public String getOpponentUsername() { return opponentUsername; }
    public void setOpponentUsername(String opponentUsername) { this.opponentUsername = opponentUsername; }
    public String getResult() { return result; }
    public void setResult(String result) { this.result = result; }
    public int getEloChange() { return eloChange; }
    public void setEloChange(int eloChange) { this.eloChange = eloChange; }
    public int getEloAfter() { return eloAfter; }
    public void setEloAfter(int eloAfter) { this.eloAfter = eloAfter; }
    public LocalDateTime getPlayedAt() { return playedAt; }
    public void setPlayedAt(LocalDateTime playedAt) { this.playedAt = playedAt; }
}