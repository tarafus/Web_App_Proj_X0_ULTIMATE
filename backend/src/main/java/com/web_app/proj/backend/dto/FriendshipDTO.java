package com.web_app.proj.backend.dto;

import java.time.LocalDateTime;

public class FriendshipDTO {
    private Long id;
    private String requester;
    private String addressee;
    private String status;
    private LocalDateTime createdAt;

    /** Pseudo de l'ami du point de vue de celui qui consulte la liste. */
    private String friendUsername;
    /** ELO de l'ami (pour l'afficher dans la liste). */
    private Integer friendElo;

    public FriendshipDTO() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getRequester() { return requester; }
    public void setRequester(String requester) { this.requester = requester; }
    public String getAddressee() { return addressee; }
    public void setAddressee(String addressee) { this.addressee = addressee; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public String getFriendUsername() { return friendUsername; }
    public void setFriendUsername(String friendUsername) { this.friendUsername = friendUsername; }
    public Integer getFriendElo() { return friendElo; }
    public void setFriendElo(Integer friendElo) { this.friendElo = friendElo; }
}