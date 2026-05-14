package com.web_app.proj.backend.service;

import com.web_app.proj.backend.dto.InvitationDTO;
import com.web_app.proj.backend.mapper.InvitationMapper;
import com.web_app.proj.backend.model.*;
import com.web_app.proj.backend.repository.InvitationRepository;
import com.web_app.proj.backend.repository.UserRepository;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

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
            throw new RuntimeException("Vous ne pouvez pas vous inviter vous-même");
        }

        User sender = userRepository.findByUsername(senderUsername).orElseThrow();
        User receiver = userRepository.findByUsername(receiverUsername)
                .orElseThrow(() -> new RuntimeException("Joueur introuvable"));

        // 1. Cross-invitation : si receiver nous a déjà invité → auto-accept
        Optional<Invitation> reverseInv = invitationRepository
                .findBySenderAndReceiverAndStatus(receiver, sender, InvitationStatus.PENDING);
        if (reverseInv.isPresent()) {
            return accept(reverseInv.get().getId(), senderUsername);
        }

        // 2. Anti-spam : empêcher d'envoyer plusieurs invitations à la même personne
        Optional<Invitation> forwardInv = invitationRepository
                .findBySenderAndReceiverAndStatus(sender, receiver, InvitationStatus.PENDING);
        if (forwardInv.isPresent()) {
            throw new RuntimeException("Vous avez déjà invité ce joueur");
        }

        // 3. Nouvelle invitation
        Invitation inv = new Invitation();
        inv.setSender(sender);
        inv.setReceiver(receiver);
        inv.setStatus(InvitationStatus.PENDING);
        Invitation saved = invitationRepository.save(inv);

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
        Invitation inv = invitationRepository.findById(invitationId)
                .orElseThrow(() -> new RuntimeException("Invitation introuvable"));

        if (!inv.getReceiver().getUsername().equals(username)) {
            throw new RuntimeException("Cette invitation ne vous est pas destinée");
        }
        if (inv.getStatus() != InvitationStatus.PENDING) {
            throw new RuntimeException("Cette invitation a déjà été traitée");
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
                .orElseThrow(() -> new RuntimeException("Invitation introuvable"));

        if (!inv.getReceiver().getUsername().equals(username)) {
            throw new RuntimeException("Cette invitation ne vous est pas destinée");
        }
        if (inv.getStatus() != InvitationStatus.PENDING) {
            throw new RuntimeException("Cette invitation a déjà été traitée");
        }

        inv.setStatus(InvitationStatus.DECLINED);
        invitationRepository.save(inv);

        notificationService.clearInvitationNotif(invitationId, username);

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