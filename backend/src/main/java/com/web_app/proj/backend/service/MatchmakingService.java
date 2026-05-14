package com.web_app.proj.backend.service;

import com.web_app.proj.backend.model.Game;
import com.web_app.proj.backend.model.User;
import com.web_app.proj.backend.repository.UserRepository;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.concurrent.ConcurrentLinkedQueue;

@Service
public class MatchmakingService {

    private record Entry(String username, int elo, LocalDateTime joinedAt) {}

    private final ConcurrentLinkedQueue<Entry> queue = new ConcurrentLinkedQueue<>();

    private final UserRepository userRepository;
    private final GameService gameService;
    private final SimpMessagingTemplate messagingTemplate;

    public MatchmakingService(UserRepository userRepository,
                               GameService gameService,
                               SimpMessagingTemplate messagingTemplate) {
        this.userRepository = userRepository;
        this.gameService = gameService;
        this.messagingTemplate = messagingTemplate;
    }

    /**
     * Tente de matcher le joueur avec le candidat ELO le plus proche.
     * @return "matched" si une partie a été créée, "waiting" si le joueur attend.
     */
    public synchronized String join(String username) {
        User user = userRepository.findByUsername(username).orElseThrow();

        // Retirer le joueur s'il était déjà en file (double-clic, etc.)
        queue.removeIf(e -> e.username().equals(username));

        // Chercher le meilleur candidat dans la file
        Entry best = queue.stream()
                .min(Comparator.comparingInt(e -> Math.abs(e.elo() - user.getElo())))
                .orElse(null);

        if (best != null) {
            queue.remove(best);

            // Créer la partie : le joueur avec l'ELO le plus élevé est X (player1)
            String p1 = best.elo() >= user.getElo() ? best.username() : username;
            String p2 = p1.equals(best.username()) ? username : best.username();

            Game game = gameService.createGame(p1);
            gameService.joinGame(game.getId(), p2);

            messagingTemplate.convertAndSend("/topic/user/" + p1, "[MATCHED] " + game.getId());
            messagingTemplate.convertAndSend("/topic/user/" + p2, "[MATCHED] " + game.getId());
            return "matched";
        }

        // Pas de candidat → on attend
        queue.add(new Entry(username, user.getElo(), LocalDateTime.now()));
        return "waiting";
    }

    public synchronized void leave(String username) {
        queue.removeIf(e -> e.username().equals(username));
    }

    public int queueSize() {
        return queue.size();
    }
}