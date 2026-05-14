package com.web_app.proj.backend.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.web_app.proj.backend.model.Friendship;
import com.web_app.proj.backend.model.FriendshipStatus;
import com.web_app.proj.backend.model.User;

@Repository
public interface FriendshipRepository extends JpaRepository<Friendship, Long> {

    Optional<Friendship> findByRequesterAndAddressee(User requester, User addressee);

    @Query("SELECT f FROM Friendship f WHERE " +
           "(f.requester = :a AND f.addressee = :b) OR " +
           "(f.requester = :b AND f.addressee = :a)")
    Optional<Friendship> findRelation(@Param("a") User a, @Param("b") User b);

    @Query("SELECT f FROM Friendship f WHERE f.status = 'ACCEPTED' AND " +
           "(f.requester = :user OR f.addressee = :user) " +
           "ORDER BY f.createdAt DESC")
    List<Friendship> findFriendsOf(@Param("user") User user);

    /** Demandes reçues en attente. */
    @Query("SELECT f FROM Friendship f WHERE f.status = :status AND f.addressee = :user " +
           "ORDER BY f.createdAt DESC")
    List<Friendship> findByStatusAndAddressee(@Param("status") FriendshipStatus status,
                                              @Param("user") User user);

    /** Demandes envoyées en attente. */
    @Query("SELECT f FROM Friendship f WHERE f.status = :status AND f.requester = :user " +
           "ORDER BY f.createdAt DESC")
    List<Friendship> findByStatusAndRequester(@Param("status") FriendshipStatus status,
                                               @Param("user") User user);
}