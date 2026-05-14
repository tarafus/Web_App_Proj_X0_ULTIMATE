package com.web_app.proj.backend.service;

import java.util.List;

import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.web_app.proj.backend.dto.NotificationDTO;
import com.web_app.proj.backend.model.Notification;
import com.web_app.proj.backend.model.NotificationType;
import com.web_app.proj.backend.model.User;
import com.web_app.proj.backend.repository.NotificationRepository;
import com.web_app.proj.backend.repository.UserRepository;

@Service
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;
    private final SimpMessagingTemplate messagingTemplate;
    private final ObjectMapper mapper = new ObjectMapper().findAndRegisterModules();

    public NotificationService(NotificationRepository notificationRepository,
                               UserRepository userRepository,
                               SimpMessagingTemplate messagingTemplate) {
        this.notificationRepository = notificationRepository;
        this.userRepository = userRepository;
        this.messagingTemplate = messagingTemplate;
    }

    /** Crée une notification persistée + push WS si le user est connecté. */
    public Notification create(String username,
                               NotificationType type,
                               String message,
                               Long gameId,
                               Long invitationId,
                               String fromUsername) {
        User user = userRepository.findByUsername(username).orElseThrow();

        Notification notif = new Notification();
        notif.setUser(user);
        notif.setType(type);
        notif.setMessage(message);
        notif.setGameId(gameId);
        notif.setInvitationId(invitationId);
        notif.setFromUsername(fromUsername);
        notif = notificationRepository.save(notif);

        // Broadcast en JSON
        try {
            NotificationDTO dto = toDTO(notif);
            String json = mapper.writeValueAsString(dto);
            messagingTemplate.convertAndSend("/topic/user/" + username, "[NOTIF] " + json);
        } catch (Exception e) {
            System.err.println("[Notif] WS send failed: " + e.getMessage());
        }

        return notif;
    }

    public List<NotificationDTO> getForUser(String username) {
        User user = userRepository.findByUsername(username).orElseThrow();
        return notificationRepository.findByUserOrderByCreatedAtDesc(user).stream()
                .map(this::toDTO).toList();
    }

    public void dismiss(Long id, String username) {
        Notification notif = notificationRepository.findById(id).orElseThrow();
        if (!notif.getUser().getUsername().equals(username)) {
            throw new RuntimeException("Not your notification");
        }
        notificationRepository.delete(notif);
    }

    public void dismissAll(String username) {
        User user = userRepository.findByUsername(username).orElseThrow();
        notificationRepository.deleteAllByUser(user);
    }

    /** Supprime automatiquement la notif d'invitation quand on accept/decline. */
    public void clearInvitationNotif(Long invitationId, String username) {
        notificationRepository.deleteByInvitationIdAndUsername(invitationId, username);
    }

    private NotificationDTO toDTO(Notification n) {
        return new NotificationDTO(
                n.getId(),
                n.getType().name().toLowerCase(),
                n.getMessage(),
                n.getGameId(),
                n.getInvitationId(),
                n.getFromUsername(),
                n.getCreatedAt()
        );
    }
}