package com.web_app.proj.backend.service;

import java.util.Optional;

import org.springframework.stereotype.Service;

import com.web_app.proj.backend.model.Game;
import com.web_app.proj.backend.model.GameStatus;
import com.web_app.proj.backend.model.User;
import com.web_app.proj.backend.repository.GameRepository;
import com.web_app.proj.backend.repository.UserRepository;

@Service
public class GameService {

    private final GameRepository gameRepository;
    private final UserRepository userRepository;

    public GameService(GameRepository gameRepository, UserRepository userRepository) {
        this.gameRepository = gameRepository;
        this.userRepository = userRepository;
    }

    public Game createGame(String username) {
        User player1 = userRepository.findByUsername(username).orElseThrow();

        Game game = new Game();
        game.setPlayer1(player1);
        game.setStatus(GameStatus.WAITING);

        // 🔥 INITIALISATION DU PLATEAU 9x9
        String emptyBoard = "{\"board\":[[[0,0,0],[0,0,0],[0,0,0]],[[[0,0,0],[0,0,0],[0,0,0]]],[[[0,0,0],[0,0,0],[0,0,0]]]],\"activeSubBoard\":null,\"winner\":null}";
        game.setState(emptyBoard);

        return gameRepository.save(game);
    }


    public Game joinGame(Long gameId, String username) {
        Game game = gameRepository.findById(gameId).orElseThrow();
        User player2 = userRepository.findByUsername(username).orElseThrow(() -> new RuntimeException("User not found"));


        game.setPlayer2(player2);
        game.setStatus(GameStatus.RUNNING);

        return gameRepository.save(game);
    }

    public Optional<Game> getGame(Long id) {
        return gameRepository.findById(id);
    }

    public Game updateState(Long id, String newState) {
        Game game = gameRepository.findById(id).orElseThrow();
        game.setState(newState);
        return gameRepository.save(game);
    }
}
