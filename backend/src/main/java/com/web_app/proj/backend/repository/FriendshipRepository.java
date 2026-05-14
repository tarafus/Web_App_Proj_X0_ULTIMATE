// repository/FriendshipRepository.java
package com.web_app.proj.backend.repository;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.web_app.proj.backend.model.Friendship;
import com.web_app.proj.backend.model.User;

public interface FriendshipRepository extends JpaRepository<Friendship, Long> {
    List<Friendship> findByUser1OrUser2(User user1, User user2);
    boolean existsByUser1AndUser2OrUser2AndUser1(User u1, User u2, User u3, User u4);
}