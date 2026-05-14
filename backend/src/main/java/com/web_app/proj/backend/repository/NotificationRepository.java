package com.web_app.proj.backend.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import com.web_app.proj.backend.model.Notification;
import com.web_app.proj.backend.model.User;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {

    List<Notification> findByUserOrderByCreatedAtDesc(User user);

    @Modifying
    @Transactional
    @Query("DELETE FROM Notification n WHERE n.user = :user")
    void deleteAllByUser(@Param("user") User user);

    @Modifying
    @Transactional
    @Query("DELETE FROM Notification n WHERE n.invitationId = :invId AND n.user.username = :username")
    void deleteByInvitationIdAndUsername(@Param("invId") Long invId,
                                         @Param("username") String username);

    @Modifying
    @Transactional
    @Query("DELETE FROM Notification n WHERE n.friendshipId = :fId AND n.user.username = :username")
    void deleteByFriendshipIdAndUsername(@Param("fId") Long fId,
                                          @Param("username") String username);
}