package com.web_app.proj.backend.dto;

public class AIMoveRequest {

    private String[][] board;        // 9x9 : "X", "O", ou null
    private String[] subWinners;     // 9 : "X", "O", ou null
    private String currentPlayer;    // "X" ou "O" — c'est l'IA qui doit jouer
    private Integer activeSubBoard;  // 0-8, ou null si coup libre
    private String difficulty;       // "EASY", "MEDIUM", "HARD"

    public AIMoveRequest() {}

    public String[][] getBoard() { return board; }
    public void setBoard(String[][] board) { this.board = board; }

    public String[] getSubWinners() { return subWinners; }
    public void setSubWinners(String[] subWinners) { this.subWinners = subWinners; }

    public String getCurrentPlayer() { return currentPlayer; }
    public void setCurrentPlayer(String currentPlayer) { this.currentPlayer = currentPlayer; }

    public Integer getActiveSubBoard() { return activeSubBoard; }
    public void setActiveSubBoard(Integer activeSubBoard) { this.activeSubBoard = activeSubBoard; }

    public String getDifficulty() { return difficulty; }
    public void setDifficulty(String difficulty) { this.difficulty = difficulty; }
}