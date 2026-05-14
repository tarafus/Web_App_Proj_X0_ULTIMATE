package com.web_app.proj.backend.dto;

import java.time.LocalDateTime;

public class NotificationDTO {
    private Long id;
    private String type;
    private String message;
    private Long gameId;
    private Long invitationId;
    private String fromUsername;
    private LocalDateTime createdAt;

    public NotificationDTO() {}

    public NotificationDTO(Long id, String type, String message,
                           Long gameId, Long invitationId,
                           String fromUsername, LocalDateTime createdAt) {
        this.id = id;
        this.type = type;
        this.message = message;
        this.gameId = gameId;
        this.invitationId = invitationId;
        this.fromUsername = fromUsername;
        this.createdAt = createdAt;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getType() { return type; }
    public void setType(String type) { this.type = type; }
    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
    public Long getGameId() { return gameId; }
    public void setGameId(Long gameId) { this.gameId = gameId; }
    public Long getInvitationId() { return invitationId; }
    public void setInvitationId(Long invitationId) { this.invitationId = invitationId; }
    public String getFromUsername() { return fromUsername; }
    public void setFromUsername(String fromUsername) { this.fromUsername = fromUsername; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}