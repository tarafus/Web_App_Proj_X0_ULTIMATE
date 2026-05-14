package com.web_app.proj.backend.service;

import java.util.List;
import java.util.Optional;

import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import com.web_app.proj.backend.dto.InvitationDTO;
import com.web_app.proj.backend.mapper.InvitationMapper;
import com.web_app.proj.backend.model.Game;
import com.web_app.proj.backend.model.Invitation;
import com.web_app.proj.backend.model.InvitationStatus;
import com.web_app.proj.backend.model.NotificationType;
import com.web_app.proj.backend.model.User;
import com.web_app.proj.backend.repository.InvitationRepository;
import com.web_app.proj.backend.repository.UserRepository;

@Service
public class InvitationService {

    private final InvitationRepository invitationRepository;
    private final UserRepository userRepository;
    private final GameService gameService;
    private final NotificationService notificationService;
    private final SimpMessagingTemplate messagingTemplate;

    public InvitationService(InvitationRepository invitationRepository,
                             UserRepository userRepository,
                             GameService gameService,
                             NotificationService notificationService,
                             SimpMessagingTemplate messagingTemplate) {
        this.invitationRepository = invitationRepository;
        this.userRepository = userRepository;
        this.gameService = gameService;
        this.notificationService = notificationService;
        this.messagingTemplate = messagingTemplate;
    }

    public InvitationDTO send(String senderUsername, String receiverUsername) {
        if (senderUsername.equals(receiverUsername)) {
            throw new RuntimeException("Cannot invite yourself");
        }

        User sender = userRepository.findByUsername(senderUsername).orElseThrow();
        User receiver = userRepository.findByUsername(receiverUsername).orElseThrow();

        // Cross-invitation : si receiver a déjà invité sender, on auto-accepte
        Optional<Invitation> reverseInv = invitationRepository
                .findBySenderAndReceiverAndStatus(receiver, sender, InvitationStatus.PENDING);
        if (reverseInv.isPresent()) {
            return accept(reverseInv.get().getId(), senderUsername);
        }

        // Sinon création normale
        Invitation inv = new Invitation();
        inv.setSender(sender);
        inv.setReceiver(receiver);
        inv.setStatus(InvitationStatus.PENDING);
        Invitation saved = invitationRepository.save(inv);

        // Notification persistée + push WS
        notificationService.create(
                receiverUsername,
                NotificationType.INVITATION,
                senderUsername + " vous invite à jouer",
                null,
                saved.getId(),
                senderUsername
        );

        return InvitationMapper.toDTO(saved);
    }

    public InvitationDTO accept(Long invitationId, String username) {
        Invitation inv = invitationRepository.findById(invitationId).orElseThrow();

        if (!inv.getReceiver().getUsername().equals(username)) {
            throw new RuntimeException("Not your invitation");
        }
        if (inv.getStatus() != InvitationStatus.PENDING) {
            throw new RuntimeException("Invitation already handled");
        }

        Game game = gameService.createGame(inv.getSender().getUsername());
        gameService.joinGame(game.getId(), username);

        inv.setStatus(InvitationStatus.ACCEPTED);
        inv.setGame(game);
        invitationRepository.save(inv);

        // Supprimer la notif côté receiver (elle n'a plus lieu d'être)
        notificationService.clearInvitationNotif(invitationId, username);

        // Notifier le sender — message transient, pas une notif persistée
        // (déclenche la navigation immédiate)
        messagingTemplate.convertAndSend(
                "/topic/user/" + inv.getSender().getUsername(),
                "[INVITATION_ACCEPTED] " + game.getId()
        );

        return InvitationMapper.toDTO(inv);
    }

    public InvitationDTO decline(Long invitationId, String username) {
        Invitation inv = invitationRepository.findById(invitationId).orElseThrow();

        if (!inv.getReceiver().getUsername().equals(username)) {
            throw new RuntimeException("Not your invitation");
        }
        if (inv.getStatus() != InvitationStatus.PENDING) {
            throw new RuntimeException("Invitation already handled");
        }

        inv.setStatus(InvitationStatus.DECLINED);
        invitationRepository.save(inv);

        // Nettoyer côté receiver
        notificationService.clearInvitationNotif(invitationId, username);

        // Notifier le sender (persisté car informatif)
        notificationService.create(
                inv.getSender().getUsername(),
                NotificationType.DECLINED,
                username + " a refusé votre invitation",
                null,
                null,
                username
        );

        return InvitationMapper.toDTO(inv);
    }

    public List<InvitationDTO> getPending(String username) {
        User user = userRepository.findByUsername(username).orElseThrow();
        return invitationRepository.findByReceiverAndStatus(user, InvitationStatus.PENDING)
                .stream().map(InvitationMapper::toDTO).toList();
    }
}