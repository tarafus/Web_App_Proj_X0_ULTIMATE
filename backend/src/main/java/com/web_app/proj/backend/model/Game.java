package com.web_app.proj.backend.model;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.ManyToOne;

@Entity
public class Game {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    private User player1;

    @ManyToOne
    private User player2;

    @ManyToOne
    private User winner;

    @Column(columnDefinition = "TEXT")
    private String state; // JSON du plateau

    @Enumerated(EnumType.STRING)
    private GameStatus status;

    private int eloChangeP1;
    private int eloChangeP2;

    private LocalDateTime createdAt;
    private LocalDateTime finishedAt;

    // ---------- CONSTRUCTEURS ----------

    public Game() {
        this.createdAt = LocalDateTime.now();
        this.status = GameStatus.WAITING;
    }

    public Game(User player1, User player2, String state, GameStatus status) {
        this.player1 = player1;
        this.player2 = player2;
        this.state = state;
        this.status = status;
        this.createdAt = LocalDateTime.now();
    }

    // ---------- GETTERS & SETTERS ----------

    public Long getId() {
        return id;
    }

    public User getPlayer1() {
        return player1;
    }

    public void setPlayer1(User player1) {
        this.player1 = player1;
    }

    public User getPlayer2() {
        return player2;
    }

    public void setPlayer2(User player2) {
        this.player2 = player2;
    }

    public User getWinner() {
        return winner;
    }

    public void setWinner(User winner) {
        this.winner = winner;
    }

    public String getState() {
        return state;
    }

    public void setState(String state) {
        this.state = state;
    }

    public GameStatus getStatus() {
        return status;
    }

    public void setStatus(GameStatus status) {
        this.status = status;
    }

    public int getEloChangeP1() {
        return eloChangeP1;
    }

    public void setEloChangeP1(int eloChangeP1) {
        this.eloChangeP1 = eloChangeP1;
    }

    public int getEloChangeP2() {
        return eloChangeP2;
    }

    public void setEloChangeP2(int eloChangeP2) {
        this.eloChangeP2 = eloChangeP2;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getFinishedAt() {
        return finishedAt;
    }

    public void setFinishedAt(LocalDateTime finishedAt) {
        this.finishedAt = finishedAt;
    }
}
