package com.web_app.proj.backend.service;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.web_app.proj.backend.model.EloHistory;
import com.web_app.proj.backend.model.Game;
import com.web_app.proj.backend.model.GameStat;
import com.web_app.proj.backend.model.GameStatus;
import com.web_app.proj.backend.model.Move;
import com.web_app.proj.backend.model.User;
import com.web_app.proj.backend.repository.EloHistoryRepository;
import com.web_app.proj.backend.repository.GameRepository;
import com.web_app.proj.backend.repository.GameStatRepository;
import com.web_app.proj.backend.repository.MessageRepository;
import com.web_app.proj.backend.repository.MoveRepository;
import com.web_app.proj.backend.repository.UserRepository;

@Service
public class GameService {

    private final GameRepository gameRepository;
    private final UserRepository userRepository;
    private final MoveRepository moveRepository;
    private final EloHistoryRepository eloHistoryRepository;
    private final GameStatRepository gameStatRepository;
    private final EloService eloService;
    private final MessageRepository messageRepository;
    private final ObjectMapper mapper = new ObjectMapper();

    public GameService(GameRepository gameRepository,
                       UserRepository userRepository,
                       MoveRepository moveRepository,
                       EloHistoryRepository eloHistoryRepository,
                       GameStatRepository gameStatRepository,
                       EloService eloService,
                       MessageRepository messageRepository) {
        this.gameRepository = gameRepository;
        this.userRepository = userRepository;
        this.moveRepository = moveRepository;
        this.eloHistoryRepository = eloHistoryRepository;
        this.gameStatRepository = gameStatRepository;
        this.eloService = eloService;
        this.messageRepository = messageRepository; 
    }

    // ─────────────────────────────────────────
    // CRUD de base
    // ─────────────────────────────────────────

    public Game createGame(String username) {
        User player1 = userRepository.findByUsername(username).orElseThrow();

        Game game = new Game();
        game.setPlayer1(player1);
        game.setStatus(GameStatus.WAITING);
        game.setState(emptyBoardJson());

        return gameRepository.save(game);
    }

    public Game joinGame(Long gameId, String username) {
        Game game = gameRepository.findById(gameId).orElseThrow();
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (game.getPlayer1() != null && game.getPlayer1().getId().equals(user.getId())) return game;
        if (game.getPlayer2() != null && game.getPlayer2().getId().equals(user.getId())) return game;

        if (game.getPlayer2() == null) {
            game.setPlayer2(user);
            game.setStatus(GameStatus.RUNNING);
            return gameRepository.save(game);
        }

        throw new com.web_app.proj.backend.exception.BadRequestException("Game is full");
    }

    public Optional<Game> getGame(Long id) {
        return gameRepository.findById(id);
    }

    public Game updateState(Long id, String newState) {
        Game game = gameRepository.findById(id).orElseThrow();
        game.setState(newState);
        return gameRepository.save(game);
    }

    public Map<String, Object> parseState(String stateJson) {
        try {
            return mapper.readValue(stateJson, Map.class);
        } catch (Exception e) {
            throw new RuntimeException("Invalid state JSON", e);
        }
    }


    public List<Game> getOngoingGamesForUser(String username) {
        User user = userRepository.findByUsername(username).orElseThrow();
        return gameRepository.findByPlayerAndStatus(user, GameStatus.RUNNING);
    }

    // ─────────────────────────────────────────
    // Persistance des coups
    // ─────────────────────────────────────────

    public void recordMove(Long gameId, int sub, int cell) {
        Game game = gameRepository.findById(gameId).orElseThrow(); // entité fraîche = pas de problème
        Map<String, Object> state = parseState(game.getState());
        String symbol = (String) state.getOrDefault("currentPlayer", "X");
        User player = "X".equals(symbol) ? game.getPlayer1() : game.getPlayer2();
        if (player == null) return;

        Move move = new Move();
        move.setGame(game);
        move.setPlayer(player);
        move.setSubBoardIndex(sub);
        move.setCellIndex(cell);
        move.setMoveNumber((int) moveRepository.countByGame(game) + 1);
        moveRepository.save(move);
    }

    // ─────────────────────────────────────────
    // Finalisation de partie + ELO
    // ─────────────────────────────────────────

    @Transactional
    public void finalizeGame(Long gameId, String winnerSymbol) {
        Game game = gameRepository.findById(gameId).orElseThrow();
        if (game.getStatus() == GameStatus.FINISHED) return;

        User winner = "X".equals(winnerSymbol) ? game.getPlayer1() : game.getPlayer2();
        User loser  = "X".equals(winnerSymbol) ? game.getPlayer2() : game.getPlayer1();
        if (winner == null || loser == null) return;

        // Calcul ELO
        int[] deltas = eloService.calculate(winner.getElo(), loser.getElo());
        int deltaWinner = deltas[0];
        int deltaLoser  = deltas[1];

        winner.setElo(eloService.applyMin(winner.getElo(), deltaWinner));
        winner.setWins(winner.getWins() + 1);
        loser.setElo(eloService.applyMin(loser.getElo(), deltaLoser));
        loser.setLosses(loser.getLosses() + 1);
        userRepository.save(winner);
        userRepository.save(loser);

        // Historique ELO
        saveEloHistory(winner, deltaWinner, game);
        saveEloHistory(loser,  deltaLoser,  game);

        // GameStat
        updateGameStat(winner, true);
        updateGameStat(loser,  false);

        messageRepository.deleteByGame(game);

        // Clôture
        game.setWinner(winner);
        game.setStatus(GameStatus.FINISHED);
        game.setFinishedAt(LocalDateTime.now());
        game.setEloChangeP1("X".equals(winnerSymbol) ? deltaWinner : deltaLoser);
        game.setEloChangeP2("O".equals(winnerSymbol) ? deltaWinner : deltaLoser);
        gameRepository.save(game);
    }

    // ─────────────────────────────────────────
    // Helpers privés
    // ─────────────────────────────────────────

    private void saveEloHistory(User user, int change, Game game) {
        EloHistory h = new EloHistory();
        h.setUser(user);
        h.setGame(game);
        h.setChange(change);
        h.setEloAfter(user.getElo());
        eloHistoryRepository.save(h);
    }

    private void updateGameStat(User user, boolean won) {
        GameStat stat = gameStatRepository.findByUser(user)
                .orElseGet(() -> new GameStat(user));

        stat.setLastGameAt(LocalDateTime.now());
        if (user.getElo() > stat.getHighestElo()) stat.setHighestElo(user.getElo());

        if (won) {
            int streak = stat.getCurrentWinStreak() + 1;
            stat.setCurrentWinStreak(streak);
            if (streak > stat.getLongestWinStreak()) stat.setLongestWinStreak(streak);
        } else {
            stat.setCurrentWinStreak(0);
        }

        gameStatRepository.save(stat);
    }

    private String emptyBoardJson() {
        Object[][] board = new Object[9][9];
        Object[] subWinners = new Object[9];

        Map<String, Object> state = new HashMap<>();
        state.put("board", board);
        state.put("subWinners", subWinners);
        state.put("globalWinner", null);
        state.put("currentPlayer", "X");
        state.put("activeSubBoard", null);

        try {
            return mapper.writeValueAsString(state);
        } catch (Exception e) {
            throw new RuntimeException("Cannot build empty board", e);
        }
    }
}