package com.web_app.proj.backend.controller;

import java.util.List;

import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestAttribute;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.web_app.proj.backend.dto.NotificationDTO;
import com.web_app.proj.backend.service.NotificationService;

@RestController
@RequestMapping("/notifications")
public class NotificationController {

    private final NotificationService notificationService;

    public NotificationController(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    @GetMapping
    public List<NotificationDTO> getAll(@RequestAttribute("username") String username) {
        return notificationService.getForUser(username);
    }

    @DeleteMapping("/{id}")
    public void dismiss(@PathVariable Long id,
                        @RequestAttribute("username") String username) {
        notificationService.dismiss(id, username);
    }

    @DeleteMapping
    public void dismissAll(@RequestAttribute("username") String username) {
        notificationService.dismissAll(username);
    }
}