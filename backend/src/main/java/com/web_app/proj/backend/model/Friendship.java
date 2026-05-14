package com.web_app.proj.backend.model;

import java.time.LocalDateTime;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "friendships")
public class Friendship {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    private User user1;

    @ManyToOne
    private User user2;

    private LocalDateTime createdAt;

    public Friendship() { this.createdAt = LocalDateTime.now(); }

    public Long getId() { return id; }
    public User getUser1() { return user1; }
    public void setUser1(User u) { this.user1 = u; }
    public User getUser2() { return user2; }
    public void setUser2(User u) { this.user2 = u; }
    public LocalDateTime getCreatedAt() { return createdAt; }
}