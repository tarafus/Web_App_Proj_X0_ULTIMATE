package com.web_app.proj.backend.controller;

import java.util.List;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestAttribute;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.web_app.proj.backend.dto.InvitationDTO;
import com.web_app.proj.backend.service.InvitationService;

@RestController
@RequestMapping("/invitation")
@CrossOrigin(origins = "http://localhost:5173")
public class InvitationController {

    private final InvitationService invitationService;

    public InvitationController(InvitationService invitationService) {
        this.invitationService = invitationService;
    }

    @PostMapping("/send")
    public InvitationDTO send(@RequestAttribute("username") String sender,
                               @RequestParam String receiverUsername) {
        return invitationService.send(sender, receiverUsername);
    }

    @PostMapping("/{id}/accept")
    public InvitationDTO accept(@PathVariable Long id,
                                 @RequestAttribute("username") String username) {
        return invitationService.accept(id, username);
    }

    @PostMapping("/{id}/decline")
    public void decline(@PathVariable Long id,
                         @RequestAttribute("username") String username) {
        invitationService.decline(id, username);
    }

    @GetMapping("/pending")
    public List<InvitationDTO> pending(@RequestAttribute("username") String username) {
        return invitationService.getPending(username);
    }
}