package com.web_app.proj.backend.dto;

public class UserDTO {
    private Long id;
    private String username;
    private int elo;
    private int wins;
    private int losses;

    public UserDTO(Long id, String username, int elo, int wins, int losses) {
        this.id = id;
        this.username = username;
        this.elo = elo;
        this.wins = wins;
        this.losses = losses;
    }

    public Long getId() { return id; }
    public String getUsername() { return username; }
    public int getElo() { return elo; }
    public int getWins() { return wins; }
    public int getLosses() { return losses; }
}
