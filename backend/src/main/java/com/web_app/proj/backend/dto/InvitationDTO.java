package com.web_app.proj.backend.dto;

public class InvitationDTO {
    public Long id;
    public String senderUsername;
    public String receiverUsername;
    public String status;
    public Long gameId;

    public InvitationDTO(Long id, String senderUsername,
                          String receiverUsername, String status, Long gameId) {
        this.id = id;
        this.senderUsername = senderUsername;
        this.receiverUsername = receiverUsername;
        this.status = status;
        this.gameId = gameId;
    }
}