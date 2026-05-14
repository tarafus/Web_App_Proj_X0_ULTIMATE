package com.web_app.proj.backend.model;

import java.time.LocalDateTime;

import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "invitations")
public class Invitation {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    private User sender;

    @ManyToOne
    private User receiver;

    @Enumerated(EnumType.STRING)
    private InvitationStatus status;

    @ManyToOne
    private Game game; // null jusqu'à l'acceptation

    private LocalDateTime createdAt;

    public Invitation() {
        this.status = InvitationStatus.PENDING;
        this.createdAt = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public User getSender() { return sender; }
    public void setSender(User s) { this.sender = s; }
    public User getReceiver() { return receiver; }
    public void setReceiver(User r) { this.receiver = r; }
    public InvitationStatus getStatus() { return status; }
    public void setStatus(InvitationStatus s) { this.status = s; }
    public Game getGame() { return game; }
    public void setGame(Game g) { this.game = g; }
    public LocalDateTime getCreatedAt() { return createdAt; }
}