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
            throw new RuntimeException("You cannot invite yourself");
        }

        User sender = userRepository.findByUsername(senderUsername).orElseThrow();
        User receiver = userRepository.findByUsername(receiverUsername)
                .orElseThrow(() -> new RuntimeException("Player not found"));

        // 1. Cross-invitation: if receiver already invited us → auto-accept
        Optional<Invitation> reverseInv = invitationRepository
                .findFirstBySenderAndReceiverAndStatusOrderByIdDesc(
                        receiver, sender, InvitationStatus.PENDING);
        if (reverseInv.isPresent()) {
            return accept(reverseInv.get().getId(), senderUsername);
        }

        // 2. Anti-spam: prevent sending multiple invitations to the same person
        Optional<Invitation> forwardInv = invitationRepository
                .findFirstBySenderAndReceiverAndStatusOrderByIdDesc(
                        sender, receiver, InvitationStatus.PENDING);
        if (forwardInv.isPresent()) {
            throw new RuntimeException("You already invited this player");
        }

        // 3. New invitation
        Invitation inv = new Invitation();
        inv.setSender(sender);
        inv.setReceiver(receiver);
        inv.setStatus(InvitationStatus.PENDING);
        Invitation saved = invitationRepository.save(inv);

        notificationService.create(
                receiverUsername,
                NotificationType.INVITATION,
                senderUsername + " invited you to play",
                null,
                saved.getId(),
                senderUsername
        );

        return InvitationMapper.toDTO(saved);
    }

    public InvitationDTO accept(Long invitationId, String username) {
        Invitation inv = invitationRepository.findById(invitationId)
                .orElseThrow(() -> new RuntimeException("Invitation not found"));

        if (!inv.getReceiver().getUsername().equals(username)) {
            throw new RuntimeException("This invitation is not for you");
        }
        if (inv.getStatus() != InvitationStatus.PENDING) {
            throw new RuntimeException("This invitation has already been handled");
        }

        Game game = gameService.createGame(inv.getSender().getUsername());
        gameService.joinGame(game.getId(), username);

        inv.setStatus(InvitationStatus.ACCEPTED);
        inv.setGame(game);
        invitationRepository.save(inv);

        notificationService.clearInvitationNotif(invitationId, username);

        messagingTemplate.convertAndSend(
                "/topic/user/" + inv.getSender().getUsername(),
                "[INVITATION_ACCEPTED] " + game.getId()
        );

        return InvitationMapper.toDTO(inv);
    }

    public InvitationDTO decline(Long invitationId, String username) {
        Invitation inv = invitationRepository.findById(invitationId)
                .orElseThrow(() -> new RuntimeException("Invitation not found"));

        if (!inv.getReceiver().getUsername().equals(username)) {
            throw new RuntimeException("This invitation is not for you");
        }
        if (inv.getStatus() != InvitationStatus.PENDING) {
            throw new RuntimeException("This invitation has already been handled");
        }

        inv.setStatus(InvitationStatus.DECLINED);
        invitationRepository.save(inv);

        notificationService.clearInvitationNotif(invitationId, username);

        notificationService.create(
                inv.getSender().getUsername(),
                NotificationType.DECLINED,
                username + " declined your invitation",
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