package com.web_app.proj.backend.service;

import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;

import com.web_app.proj.backend.dto.FriendshipDTO;
import com.web_app.proj.backend.model.Friendship;
import com.web_app.proj.backend.model.FriendshipStatus;
import com.web_app.proj.backend.model.NotificationType;
import com.web_app.proj.backend.model.User;
import com.web_app.proj.backend.repository.FriendshipRepository;
import com.web_app.proj.backend.repository.UserRepository;

@Service
public class FriendshipService {

    private final FriendshipRepository friendshipRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;

    public FriendshipService(FriendshipRepository friendshipRepository,
                             UserRepository userRepository,
                             NotificationService notificationService) {
        this.friendshipRepository = friendshipRepository;
        this.userRepository = userRepository;
        this.notificationService = notificationService;
    }

    public FriendshipDTO request(String requesterUsername, String addresseeUsername) {
        if (requesterUsername.equals(addresseeUsername)) {
            throw new RuntimeException("Cannot friend yourself");
        }

        User requester = userRepository.findByUsername(requesterUsername).orElseThrow();
        User addressee = userRepository.findByUsername(addresseeUsername)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Optional<Friendship> existing = friendshipRepository.findRelation(requester, addressee);
        if (existing.isPresent()) {
            Friendship f = existing.get();
            if (f.getStatus() == FriendshipStatus.ACCEPTED) {
                throw new RuntimeException("Already friends");
            }
            if (f.getRequester().equals(addressee)) {
                return accept(f.getId(), requesterUsername);
            }
            throw new RuntimeException("Friend request already sent");
        }

        Friendship f = new Friendship();
        f.setRequester(requester);
        f.setAddressee(addressee);
        f.setStatus(FriendshipStatus.PENDING);
        Friendship saved = friendshipRepository.save(f);

        notificationService.create(
                addresseeUsername,
                NotificationType.FRIEND_REQUEST,
                requesterUsername + " sent you a friend request",
                null, null, saved.getId(), requesterUsername
        );

        return toDTO(saved, addresseeUsername);
    }

    public FriendshipDTO accept(Long friendshipId, String username) {
        Friendship f = friendshipRepository.findById(friendshipId).orElseThrow();
        if (!f.getAddressee().getUsername().equals(username)) {
            throw new RuntimeException("Not your friend request");
        }
        if (f.getStatus() != FriendshipStatus.PENDING) {
            throw new RuntimeException("Request already handled");
        }

        f.setStatus(FriendshipStatus.ACCEPTED);
        friendshipRepository.save(f);

        notificationService.clearFriendshipNotif(friendshipId, username);

        notificationService.create(
                f.getRequester().getUsername(),
                NotificationType.FRIEND_ACCEPTED,
                username + " accepted your friend request",
                null, null, f.getId(), username
        );

        return toDTO(f, username);
    }

    public void decline(Long friendshipId, String username) {
        Friendship f = friendshipRepository.findById(friendshipId).orElseThrow();
        if (!f.getAddressee().getUsername().equals(username)) {
            throw new RuntimeException("Not your friend request");
        }
        if (f.getStatus() != FriendshipStatus.PENDING) {
            throw new RuntimeException("Request already handled");
        }

        String requesterUsername = f.getRequester().getUsername();

        notificationService.clearFriendshipNotif(friendshipId, username);
        friendshipRepository.delete(f);

        // Notify the requester that their request was declined
        notificationService.create(
                requesterUsername,
                NotificationType.FRIEND_DECLINED,
                username + " declined your friend request",
                null, null, null, username
        );
    }

    /** Requester cancels their own pending request. */
    public void cancelRequest(Long friendshipId, String username) {
        Friendship f = friendshipRepository.findById(friendshipId).orElseThrow();
        if (!f.getRequester().getUsername().equals(username)) {
            throw new RuntimeException("Not your friend request");
        }
        if (f.getStatus() != FriendshipStatus.PENDING) {
            throw new RuntimeException("Request already handled");
        }

        // Clear the notification on the addressee's side
        notificationService.clearFriendshipNotif(friendshipId, f.getAddressee().getUsername());
        friendshipRepository.delete(f);
    }

    public void remove(String currentUsername, String otherUsername) {
        User a = userRepository.findByUsername(currentUsername).orElseThrow();
        User b = userRepository.findByUsername(otherUsername).orElseThrow();
        Friendship f = friendshipRepository.findRelation(a, b)
                .orElseThrow(() -> new RuntimeException("Not friends"));
        friendshipRepository.delete(f);
    }

    public List<FriendshipDTO> getFriends(String username) {
        User user = userRepository.findByUsername(username).orElseThrow();
        return friendshipRepository.findFriendsOf(user).stream()
                .map(f -> toDTO(f, username))
                .toList();
    }

    public List<FriendshipDTO> getPendingRequests(String username) {
        User user = userRepository.findByUsername(username).orElseThrow();
        return friendshipRepository.findByStatusAndAddressee(FriendshipStatus.PENDING, user)
                .stream()
                .map(f -> toDTO(f, username))
                .toList();
    }

    public List<FriendshipDTO> getSentRequests(String username) {
        User user = userRepository.findByUsername(username).orElseThrow();
        return friendshipRepository.findByStatusAndRequester(FriendshipStatus.PENDING, user)
                .stream()
                .map(f -> toDTO(f, username))
                .toList();
    }

    public String getStatus(String currentUsername, String otherUsername) {
        if (currentUsername.equals(otherUsername)) return "SELF";

        User a = userRepository.findByUsername(currentUsername).orElseThrow();
        Optional<User> bOpt = userRepository.findByUsername(otherUsername);
        if (bOpt.isEmpty()) return "NONE";
        User b = bOpt.get();

        Optional<Friendship> rel = friendshipRepository.findRelation(a, b);
        if (rel.isEmpty()) return "NONE";

        Friendship f = rel.get();
        if (f.getStatus() == FriendshipStatus.ACCEPTED) return "FRIENDS";
        return f.getRequester().equals(a) ? "PENDING_SENT" : "PENDING_RECEIVED";
    }

    private FriendshipDTO toDTO(Friendship f, String currentUsername) {
        FriendshipDTO dto = new FriendshipDTO();
        dto.setId(f.getId());
        dto.setRequester(f.getRequester().getUsername());
        dto.setAddressee(f.getAddressee().getUsername());
        dto.setStatus(f.getStatus().name());
        dto.setCreatedAt(f.getCreatedAt());

        User other = f.getRequester().getUsername().equals(currentUsername)
                ? f.getAddressee() : f.getRequester();
        dto.setFriendUsername(other.getUsername());
        dto.setFriendElo(other.getElo());
        return dto;
    }
}