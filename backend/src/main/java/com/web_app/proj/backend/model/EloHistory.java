package com.web_app.proj.backend.model;

import java.time.LocalDateTime;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "elo_history")
public class EloHistory {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    private User user;

    @ManyToOne
    private Game game;

    private int eloAfter;  // ELO du joueur après cette partie
    private int change;    // variation (+ ou -)
    private LocalDateTime recordedAt;

    public EloHistory() { this.recordedAt = LocalDateTime.now(); }

    public Long getId() { return id; }
    public User getUser() { return user; }
    public void setUser(User u) { this.user = u; }
    public Game getGame() { return game; }
    public void setGame(Game g) { this.game = g; }
    public int getEloAfter() { return eloAfter; }
    public void setEloAfter(int e) { this.eloAfter = e; }
    public int getChange() { return change; }
    public void setChange(int c) { this.change = c; }
    public LocalDateTime getRecordedAt() { return recordedAt; }
}