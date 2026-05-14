package com.web_app.proj.backend.model;

import java.time.LocalDateTime;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "game_stats")
public class GameStat {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    @JoinColumn(name = "user_id", unique = true)
    private User user;

    private int totalMovesPlayed;
    private int longestWinStreak;
    private int currentWinStreak;
    private int highestElo;
    private LocalDateTime lastGameAt;

    public GameStat() {}
    public GameStat(User user) {
        this.user = user;
        this.highestElo = user.getElo();
    }

    public Long getId() { return id; }
    public User getUser() { return user; }
    public void setUser(User u) { this.user = u; }
    public int getTotalMovesPlayed() { return totalMovesPlayed; }
    public void setTotalMovesPlayed(int t) { this.totalMovesPlayed = t; }
    public int getLongestWinStreak() { return longestWinStreak; }
    public void setLongestWinStreak(int l) { this.longestWinStreak = l; }
    public int getCurrentWinStreak() { return currentWinStreak; }
    public void setCurrentWinStreak(int c) { this.currentWinStreak = c; }
    public int getHighestElo() { return highestElo; }
    public void setHighestElo(int h) { this.highestElo = h; }
    public LocalDateTime getLastGameAt() { return lastGameAt; }
    public void setLastGameAt(LocalDateTime t) { this.lastGameAt = t; }
}