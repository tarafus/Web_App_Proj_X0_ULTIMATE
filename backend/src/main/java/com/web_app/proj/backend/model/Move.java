package com.web_app.proj.backend.model;

import java.time.LocalDateTime;

import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "moves")
public class Move {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    private Game game;

    @ManyToOne(fetch = FetchType.LAZY)
    private User player;

    private int subBoardIndex;
    private int cellIndex;
    private int moveNumber;
    private LocalDateTime playedAt;

    public Move() { this.playedAt = LocalDateTime.now(); }

    // Getters / Setters
    public Long getId() { return id; }
    public Game getGame() { return game; }
    public void setGame(Game game) { this.game = game; }
    public User getPlayer() { return player; }
    public void setPlayer(User player) { this.player = player; }
    public int getSubBoardIndex() { return subBoardIndex; }
    public void setSubBoardIndex(int s) { this.subBoardIndex = s; }
    public int getCellIndex() { return cellIndex; }
    public void setCellIndex(int c) { this.cellIndex = c; }
    public int getMoveNumber() { return moveNumber; }
    public void setMoveNumber(int n) { this.moveNumber = n; }
    public LocalDateTime getPlayedAt() { return playedAt; }
    public void setPlayedAt(LocalDateTime t) { this.playedAt = t; }
}