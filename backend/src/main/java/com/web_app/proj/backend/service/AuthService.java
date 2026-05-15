package com.web_app.proj.backend.service;

import java.util.List;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.web_app.proj.backend.config.JwtUtils;
import com.web_app.proj.backend.dto.GameHistoryDTO;
import com.web_app.proj.backend.exception.BadRequestException;
import com.web_app.proj.backend.exception.UnauthorizedException;
import com.web_app.proj.backend.model.Game;
import com.web_app.proj.backend.model.User;
import com.web_app.proj.backend.repository.EloHistoryRepository;
import com.web_app.proj.backend.repository.UserRepository;

@Service
public class AuthService {

    private final UserRepository repo;
    private final PasswordEncoder encoder;
    private final JwtUtils jwt;
    private final EloHistoryRepository eloHistoryRepository;

    public AuthService(UserRepository repo,
                       PasswordEncoder encoder,
                       JwtUtils jwt,
                       EloHistoryRepository eloHistoryRepository) {
        this.repo = repo;
        this.encoder = encoder;
        this.jwt = jwt;
        this.eloHistoryRepository = eloHistoryRepository;
    }

    public String register(String username, String password) {
        if (repo.existsByUsername(username)) {
            throw new BadRequestException("Username already taken");
        }

        User user = new User(username, encoder.encode(password));
        repo.save(user);

        return jwt.generateToken(username);
    }

    public String login(String username, String password) {
        User user = repo.findByUsername(username)
                .orElseThrow(() -> new UnauthorizedException("Invalid credentials"));

        if (!encoder.matches(password, user.getPassword())) {
            throw new UnauthorizedException("Invalid credentials");
        }

        return jwt.generateToken(username);
    }

    public User me(String username) {
        return repo.findByUsername(username)
                .orElseThrow(() -> new UnauthorizedException("User not found"));
    }

    public String extractUsername(String token) {
        return jwt.extractUsername(token);
    }

    /** Historique des parties terminées d'un user, plus récentes en premier. */
    public List<GameHistoryDTO> getHistory(String username) {
        User user = repo.findByUsername(username)
                .orElseThrow(() -> new UnauthorizedException("User not found"));

        return eloHistoryRepository.findByUserOrderByRecordedAtDesc(user).stream()
                .map(eh -> {
                    Game g = eh.getGame();
                    if (g == null) return null;

                    // Identifier l'adversaire
                    User opponent = null;
                    if (g.getPlayer1() != null && g.getPlayer1().getId().equals(user.getId())) {
                        opponent = g.getPlayer2();
                    } else if (g.getPlayer2() != null && g.getPlayer2().getId().equals(user.getId())) {
                        opponent = g.getPlayer1();
                    }
                    String opponentUsername = opponent != null ? opponent.getUsername() : "?";

                    // Déterminer le résultat
                    String result;
                    if (g.getWinner() == null) {
                        result = "DRAW";
                    } else if (g.getWinner().getId().equals(user.getId())) {
                        result = "WIN";
                    } else {
                        result = "LOSS";
                    }

                    return new GameHistoryDTO(
                            g.getId(),
                            opponentUsername,
                            result,
                            eh.getChange(),
                            eh.getEloAfter(),
                            eh.getRecordedAt()
                    );
                })
                .filter(dto -> dto != null)
                .toList();
    }
}