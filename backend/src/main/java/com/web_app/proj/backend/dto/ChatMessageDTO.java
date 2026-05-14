package com.web_app.proj.backend.dto;

import java.time.LocalDateTime;

public class ChatMessageDTO {
    private Long id;
    private String username;
    private String content;
    private LocalDateTime sentAt;

    public ChatMessageDTO() {}

    public ChatMessageDTO(Long id, String username, String content, LocalDateTime sentAt) {
        this.id = id;
        this.username = username;
        this.content = content;
        this.sentAt = sentAt;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }
    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }
    public LocalDateTime getSentAt() { return sentAt; }
    public void setSentAt(LocalDateTime sentAt) { this.sentAt = sentAt; }
}