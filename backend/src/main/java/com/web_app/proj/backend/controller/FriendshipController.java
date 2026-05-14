package com.web_app.proj.backend.controller;

import java.util.List;
import java.util.Map;

import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestAttribute;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.web_app.proj.backend.dto.FriendshipDTO;
import com.web_app.proj.backend.service.FriendshipService;

@RestController
@RequestMapping("/friends")
public class FriendshipController {

    private final FriendshipService friendshipService;

    public FriendshipController(FriendshipService friendshipService) {
        this.friendshipService = friendshipService;
    }

    @GetMapping
    public List<FriendshipDTO> getFriends(@RequestAttribute("username") String username) {
        return friendshipService.getFriends(username);
    }

    @GetMapping("/requests")
    public List<FriendshipDTO> getPending(@RequestAttribute("username") String username) {
        return friendshipService.getPendingRequests(username);
    }

    @GetMapping("/requests/sent")
    public List<FriendshipDTO> getSentPending(@RequestAttribute("username") String username) {
        return friendshipService.getSentRequests(username);
    }

    @PostMapping("/request")
    public FriendshipDTO request(@RequestAttribute("username") String username,
                                 @RequestParam String addressee) {
        return friendshipService.request(username, addressee);
    }

    @PostMapping("/accept/{id}")
    public FriendshipDTO accept(@PathVariable Long id,
                                @RequestAttribute("username") String username) {
        return friendshipService.accept(id, username);
    }

    @PostMapping("/decline/{id}")
    public void decline(@PathVariable Long id,
                        @RequestAttribute("username") String username) {
        friendshipService.decline(id, username);
    }

    @DeleteMapping("/requests/{id}")
    public void cancelRequest(@PathVariable Long id,
                              @RequestAttribute("username") String username) {
        friendshipService.cancelRequest(id, username);
    }

    @DeleteMapping("/{other}")
    public void remove(@PathVariable String other,
                       @RequestAttribute("username") String username) {
        friendshipService.remove(username, other);
    }

    @GetMapping("/status/{other}")
    public Map<String, String> status(@PathVariable String other,
                                      @RequestAttribute("username") String username) {
        return Map.of("status", friendshipService.getStatus(username, other));
    }
}