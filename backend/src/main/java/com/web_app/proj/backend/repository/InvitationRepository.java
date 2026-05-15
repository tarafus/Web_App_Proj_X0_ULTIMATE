// repository/InvitationRepository.java
package com.web_app.proj.backend.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.web_app.proj.backend.model.Invitation;
import com.web_app.proj.backend.model.InvitationStatus;
import com.web_app.proj.backend.model.User;

public interface InvitationRepository extends JpaRepository<Invitation, Long> {

    List<Invitation> findByReceiverAndStatus(User receiver, InvitationStatus status);

    List<Invitation> findBySenderAndStatus(User sender, InvitationStatus status);

    /**
     * Renvoie au plus une invitation, défensif contre d'éventuels doublons.
     * Trie par id décroissant pour prendre la plus récente.
     */
    Optional<Invitation> findFirstBySenderAndReceiverAndStatusOrderByIdDesc(
            User sender, User receiver, InvitationStatus status);
}