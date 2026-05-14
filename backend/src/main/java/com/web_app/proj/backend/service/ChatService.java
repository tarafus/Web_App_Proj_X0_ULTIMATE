package com.web_app.proj.backend.service;

import java.util.List;

import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import com.web_app.proj.backend.dto.ChatMessageDTO;
import com.web_app.proj.backend.model.Game;
import com.web_app.proj.backend.model.GameStatus;
import com.web_app.proj.backend.model.Message;
import com.web_app.proj.backend.model.User;
import com.web_app.proj.backend.repository.GameRepository;
import com.web_app.proj.backend.repository.MessageRepository;
import com.web_app.proj.backend.repository.UserRepository;

@Service
public class ChatService {

    private final MessageRepository messageRepository;
    private final GameRepository gameRepository;
    private final UserRepository userRepository;
    private final SimpMessagingTemplate messagingTemplate;

    public ChatService(MessageRepository messageRepository,
                       GameRepository gameRepository,
                       UserRepository userRepository,
                       SimpMessagingTemplate messagingTemplate) {
        this.messageRepository = messageRepository;
        this.gameRepository = gameRepository;
        this.userRepository = userRepository;
        this.messagingTemplate = messagingTemplate;
    }

    public ChatMessageDTO sendMessage(Long gameId, String username, String content) {
        if (content == null || content.trim().isEmpty()) {
            throw new RuntimeException("Empty message");
        }
        if (content.length() > 500) {
            content = content.substring(0, 500);
        }

        Game game = gameRepository.findById(gameId).orElseThrow();

        // Refuser les messages après la fin de la partie
        if (game.getStatus() != GameStatus.RUNNING) {
            return null;
        }

        User sender = userRepository.findByUsername(username).orElseThrow();

        Message msg = new Message();
        msg.setGame(game);
        msg.setSender(sender);
        msg.setContent(content);
        Message saved = messageRepository.save(msg);

        ChatMessageDTO dto = new ChatMessageDTO(
                saved.getId(),
                username,
                content,
                saved.getSentAt()
        );

        messagingTemplate.convertAndSend("/topic/game/" + gameId + "/chat", dto);
        return dto;
    }

    public List<ChatMessageDTO> getMessages(Long gameId) {
        Game game = gameRepository.findById(gameId).orElseThrow();
        return messageRepository.findByGameOrderBySentAtAsc(game).stream()
                .map(m -> new ChatMessageDTO(
                        m.getId(),
                        m.getSender().getUsername(),
                        m.getContent(),
                        m.getSentAt()))
                .toList();
    }
}